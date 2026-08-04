import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from src.measurements.models import MetricDefinition, MetricVersion, InitiativeMetric, Baseline
from src.initiatives.models import Initiative

def get_auth_headers(clerk_user_id="user_test_baseline", clerk_org_id="org_test_baseline", role="org:admin"):
    return {
        "Authorization": f"Bearer token_{clerk_user_id}_{clerk_org_id}_{role}"
    }

def mock_auth_payload(mock_verifier, clerk_user_id="user_test_baseline", clerk_org_id="org_test_baseline", role="org:admin"):
    mock_verifier.return_value = {
        "sub": clerk_user_id,
        "email": f"{clerk_user_id}@example.com",
        "name": f"Test User {clerk_user_id}",
        "org_id": clerk_org_id,
        "org_name": f"Org {clerk_org_id}",
        "org_role": role,
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

def test_baseline_lifecycle_and_uniqueness_checks(client, mock_clerk_verifier, db):
    # Setup auth
    org_id_str = "org_test_baseline"
    mock_auth_payload(mock_clerk_verifier, "user_baseline", org_id_str, "org:admin")
    headers = get_auth_headers("user_baseline", org_id_str, "org:admin")

    # 1. Create Initiative
    init_res = client.post("/api/v1/initiatives", json={
        "name": "AI Customer Support Automation Test",
        "business_area": "Support",
        "problem_statement": "High response time",
        "proposed_intervention": "AI Bot",
        "expected_business_outcome": "Less response time",
        "planned_start_date": "2026-08-01"
    }, headers=headers)
    assert init_res.status_code == status.HTTP_201_CREATED
    init_id = init_res.json()["id"]

    # 2. Create Metric Definition & Version
    m_payload = {
        "canonical_key": "metrics.avg_resp_time_test",
        "name": "Average Response Time",
        "description": "Average support response time in minutes",
        "unit": "MINUTE",
        "value_type": "DECIMAL",
        "improvement_direction": "DECREASE",
        "aggregation_method": "AVG",
        "time_grain": "MONTH"
    }
    m_res = client.post("/api/v1/metrics", json=m_payload, headers=headers)
    assert m_res.status_code in [200, 201]
    metric_def_id = m_res.json()["id"]

    # 3. Assign Metric to Success Plan
    assign_payload = {
        "metric_definition_id": metric_def_id,
        "role": "PRIMARY_KPI",
        "target_type": "ABSOLUTE",
        "target_value": 30.00,
        "threshold_operator": "LESS_EQUAL"
    }
    assign_res = client.post(f"/api/v1/initiatives/{init_id}/metrics", json=assign_payload, headers=headers)
    assert assign_res.status_code == 201
    init_metric_id = assign_res.json()["id"]

    # 4. Create First DRAFT Baseline
    baseline_payload = {
        "value": 60.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Historical ticketing system averages"
    }
    base_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json=baseline_payload, headers=headers)
    assert base_res.status_code == status.HTTP_201_CREATED
    base_data = base_res.json()
    assert base_data["value"] == 60.0
    assert base_data["status"] == "DRAFT"
    assert base_data["version_number"] == 1
    baseline_id = base_data["id"]

    # 5. GET initiative metrics returns that baseline serialized correctly
    get_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers)
    assert get_res.status_code == status.HTTP_200_OK
    metrics_list = get_res.json()
    assert len(metrics_list) == 1
    metric_plan = metrics_list[0]
    assert metric_plan["id"] == init_metric_id
    assert "baselines" in metric_plan
    assert len(metric_plan["baselines"]) == 1
    
    serialized_baseline = metric_plan["baselines"][0]
    assert serialized_baseline["id"] == baseline_id
    assert serialized_baseline["value"] == 60.0
    assert serialized_baseline["status"] == "DRAFT"
    assert serialized_baseline["version_number"] == 1
    assert serialized_baseline["source_method"] == "Historical ticketing system averages"

    # 6. Refresh-equivalent GET still exposes the baseline
    refresh_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers)
    assert refresh_res.status_code == status.HTTP_200_OK
    assert len(refresh_res.json()[0]["baselines"]) == 1

    # 7. Attempting to create another DRAFT baseline is rejected (409 Conflict)
    duplicate_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json=baseline_payload, headers=headers)
    assert duplicate_res.status_code == status.HTTP_409_CONFLICT
    assert "draft baseline already exists" in duplicate_res.json()["detail"].lower()

    # 8. Tenant isolation remains enforced
    # Tenant B tries to create a baseline for Tenant A's metric plan
    mock_auth_payload(mock_clerk_verifier, "user_tenant_b", "org_tenant_b", "org:admin")
    headers_b = get_auth_headers("user_tenant_b", "org_tenant_b", "org:admin")
    
    cross_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json=baseline_payload, headers=headers_b)
    assert cross_res.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    # Tenant B tries to list metrics for Tenant A's initiative
    cross_get_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers_b)
    assert cross_get_res.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    # 9. Existing approved/versioned baseline behavior is not unintentionally changed
    # Restore Tenant A authentication
    mock_auth_payload(mock_clerk_verifier, "user_baseline", org_id_str, "org:admin")
    
    # Approve baseline 1 directly using the DB session to test service-level Versioning
    db_base = db.get(Baseline, uuid.UUID(baseline_id))
    db_base.status = "APPROVED"
    db_base.approved_by_user_id = uuid.UUID(init_res.json()["created_by_user_id"])
    db_base.approved_at = datetime.now(timezone.utc)
    db.commit()

    # Now that Tenant A has no DRAFT baselines (its only baseline is APPROVED),
    # creating a second baseline version should succeed
    base_res_v2 = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json={
        "value": 55.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Updated ticketing system averages"
    }, headers=headers)
    assert base_res_v2.status_code == status.HTTP_201_CREATED
    base_data_v2 = base_res_v2.json()
    assert base_data_v2["value"] == 55.0
    assert base_data_v2["status"] == "DRAFT"
    assert base_data_v2["version_number"] == 2

def test_baseline_approval_and_terminal_states(client, mock_clerk_verifier, db):
    # Setup auth for Org Admin (Tenant C)
    org_id_str = "org_test_lifecycle"
    mock_auth_payload(mock_clerk_verifier, "user_admin_c", org_id_str, "org:admin")
    headers_admin = get_auth_headers("user_admin_c", org_id_str, "org:admin")

    # 1. Create Initiative
    init_res = client.post("/api/v1/initiatives", json={
        "name": "Lifecycle Initiative Test",
        "business_area": "Support",
    }, headers=headers_admin)
    assert init_res.status_code == status.HTTP_201_CREATED
    init_id = init_res.json()["id"]

    # 2. Create Metric definition
    m_res = client.post("/api/v1/metrics", json={
        "canonical_key": "metrics.lifec_resp_time",
        "name": "Resp Time",
        "description": "Desc",
        "unit": "MINUTE",
        "value_type": "DECIMAL",
        "improvement_direction": "DECREASE",
        "aggregation_method": "AVG",
        "time_grain": "MONTH"
    }, headers=headers_admin)
    assert m_res.status_code in [200, 201]
    metric_def_id = m_res.json()["id"]

    # 3. Assign Metric (DRAFT initiative state)
    assign_res = client.post(f"/api/v1/initiatives/{init_id}/metrics", json={
        "metric_definition_id": metric_def_id,
        "role": "PRIMARY_KPI",
        "target_type": "ABSOLUTE",
        "target_value": 30.00,
        "threshold_operator": "LESS_EQUAL"
    }, headers=headers_admin)
    assert assign_res.status_code == 201
    init_metric_id = assign_res.json()["id"]

    # 4. Create DRAFT Baseline (DRAFT initiative state)
    base_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json={
        "value": 60.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Survey"
    }, headers=headers_admin)
    assert base_res.status_code == 201
    base_data = base_res.json()
    baseline_id = base_data["id"]
    assert base_data["status"] == "DRAFT"

    # 5. Non-admin (org:member) attempts baseline approval -> should fail with 403 Forbidden
    mock_auth_payload(mock_clerk_verifier, "user_member_c", org_id_str, "org:member")
    headers_member = get_auth_headers("user_member_c", org_id_str, "org:member")
    
    appr_fail_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline/{baseline_id}/approve", headers=headers_member)
    assert appr_fail_res.status_code == status.HTTP_403_FORBIDDEN

    # 6. Admin (org:admin) approves baseline -> should succeed
    mock_auth_payload(mock_clerk_verifier, "user_admin_c", org_id_str, "org:admin")
    appr_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline/{baseline_id}/approve", headers=headers_admin)
    assert appr_res.status_code == status.HTTP_200_OK
    assert appr_res.json()["status"] == "APPROVED"

    # 7. GET initiative metrics returns APPROVED status
    get_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers_admin)
    assert get_res.json()[0]["baselines"][0]["status"] == "APPROVED"

    # 8. Transition to ACTIVE (via SUBMITTED)
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=SUBMITTED", headers=headers_admin)
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=ACTIVE", headers=headers_admin)
    
    init_detail = client.get(f"/api/v1/initiatives/{init_id}", headers=headers_admin).json()
    assert init_detail["lifecycle_state"] == "ACTIVE"

    # 9. Transition to COMPLETED
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=COMPLETED", headers=headers_admin)
    init_detail_comp = client.get(f"/api/v1/initiatives/{init_id}", headers=headers_admin).json()
    assert init_detail_comp["lifecycle_state"] == "COMPLETED"

    # 10. Operations in COMPLETED state fail with 409 Conflict
    # Cost component mutation
    cost_fail = client.post(f"/api/v1/initiatives/{init_id}/investments/cost-items", json={
        "category": "SOFTWARE", "value_type": "PLANNED", "amount": 1000.0, "currency": "USD", "recurrence": "ONE_TIME"
    }, headers=headers_admin)
    assert cost_fail.status_code == status.HTTP_409_CONFLICT
    assert "terminal state" in cost_fail.json()["detail"].lower()

    # Metric assignment mutation
    metric_fail = client.post(f"/api/v1/initiatives/{init_id}/metrics", json={
        "metric_definition_id": metric_def_id, "role": "GUARDRAIL", "target_type": "ABSOLUTE", "target_value": 40.0
    }, headers=headers_admin)
    assert metric_fail.status_code == status.HTTP_409_CONFLICT
    assert "terminal state" in metric_fail.json()["detail"].lower()

    # 11. Reset to ACTIVE (need a new initiative or transition back, transition COMPLETED to anywhere is invalid)
    # Let's create a new initiative for ABANDONED test
    init_res2 = client.post("/api/v1/initiatives", json={
        "name": "Lifecycle Initiative Test 2",
        "business_area": "Support",
    }, headers=headers_admin)
    init_id2 = init_res2.json()["id"]

    # Transition directly: DRAFT -> ABANDONED
    client.post(f"/api/v1/initiatives/{init_id2}/transition?target_state=ABANDONED", headers=headers_admin)
    init_detail_abandoned = client.get(f"/api/v1/initiatives/{init_id2}", headers=headers_admin).json()
    assert init_detail_abandoned["lifecycle_state"] == "ABANDONED"

    # 12. Operations in ABANDONED state fail with 409 Conflict
    cost_fail2 = client.post(f"/api/v1/initiatives/{init_id2}/investments/cost-items", json={
        "category": "SOFTWARE", "value_type": "PLANNED", "amount": 1000.0, "currency": "USD", "recurrence": "ONE_TIME"
    }, headers=headers_admin)
    assert cost_fail2.status_code == status.HTTP_409_CONFLICT
    assert "terminal state" in cost_fail2.json()["detail"].lower()

    metric_fail2 = client.post(f"/api/v1/initiatives/{init_id2}/metrics", json={
        "metric_definition_id": metric_def_id, "role": "GUARDRAIL", "target_type": "ABSOLUTE", "target_value": 40.0
    }, headers=headers_admin)
    assert metric_fail2.status_code == status.HTTP_409_CONFLICT
    assert "terminal state" in metric_fail2.json()["detail"].lower()
