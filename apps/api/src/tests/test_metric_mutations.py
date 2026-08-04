import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from sqlalchemy import select
from src.initiatives.models import Initiative, Claim, Evidence, DecisionExpectation, Outcome, InitiativeVersion
from src.measurements.models import DataSource, SourceFile, IngestionRun, Observation, InitiativeMetric, Baseline, MetricDefinition, MetricVersion

# Helper to create authentication headers
def get_auth_headers(clerk_user_id="user_test_mutations", clerk_org_id="org_test_mutations", role="org:admin"):
    return {
        "Authorization": f"Bearer token_{clerk_user_id}_{clerk_org_id}_{role}"
    }

def mock_auth_payload(mock_verifier, clerk_user_id="user_test_mutations", clerk_org_id="org_test_mutations", role="org:admin"):
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

# Setup standard test fixture
def setup_metric_fixture(client, headers, initiative_id, role="PRIMARY_KPI"):
    # 1. Setup Metric Definition
    m_payload = {
        "canonical_key": f"metrics.csat_{uuid.uuid4().hex[:6]}",
        "name": "Customer Satisfaction",
        "description": "CSAT score",
        "unit": "PERCENT",
        "value_type": "PERCENT",
        "improvement_direction": "INCREASE",
        "aggregation_method": "AVG",
        "time_grain": "MONTH"
    }
    m_res = client.post("/api/v1/metrics", json=m_payload, headers=headers)
    assert m_res.status_code in [200, 201]
    metric_def_id = m_res.json()["id"]

    # 2. Assign to initiative
    assign_payload = {
        "metric_definition_id": metric_def_id,
        "role": role,
        "target_type": "ABSOLUTE",
        "target_value": 90.00,
        "threshold_operator": "GREATER_EQUAL"
    }
    assign_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics", json=assign_payload, headers=headers)
    assert assign_res.status_code == 201
    return assign_res.json()

# 1. ACTIVE copy-on-write edit test
def test_active_copy_on_write_edit(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    # Create initiative
    init_res = client.post("/api/v1/initiatives", json={"name": "Mutations Test Initiative", "business_area": "Care"}, headers=headers)
    assert init_res.status_code == 201
    init_id = init_res.json()["id"]

    # Assign PRIMARY_KPI
    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Transition to ACTIVE (needs uvicorn or direct state transition)
    # Transition to SUBMITTED first
    lifecycle_res = client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=SUBMITTED", headers=headers)
    assert lifecycle_res.status_code == 200
    # Then transition to ACTIVE
    lifecycle_res2 = client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=ACTIVE", headers=headers)
    assert lifecycle_res2.status_code == 200

    # Add a baseline to the assignment
    baseline_payload = {
        "value": 85.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Survey"
    }
    base_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/baseline", json=baseline_payload, headers=headers)
    assert base_res.status_code == 201
    baseline_id = base_res.json()["id"]

    # Approve baseline
    app_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/baseline/{baseline_id}/approve", headers=headers)
    assert app_res.status_code == 200

    # Verify existing baseline count is 1
    assert db.scalar(select(Baseline).where(Baseline.initiative_metric_id == assign_id)) is not None

    # Perform edit on the active metric assignment
    patch_payload = {
        "target_value": 95.00
    }
    patch_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json=patch_payload, headers=headers)
    assert patch_res.status_code == 200
    new_assign_id = patch_res.json()["id"]
    assert new_assign_id != assign_id

    # Verify old assignment is now SUPERSEDED
    old_stmt = select(InitiativeMetric).where(InitiativeMetric.id == assign_id)
    old_im = db.scalars(old_stmt).first()
    assert old_im.status == "SUPERSEDED"

    # Verify new assignment is APPROVED
    new_stmt = select(InitiativeMetric).where(InitiativeMetric.id == new_assign_id)
    new_im = db.scalars(new_stmt).first()
    assert new_im.status == "APPROVED"
    assert new_im.target_value == 95.00

    # Verify baseline is still attached to the old SUPERSEDED assignment (preserving audit history)
    assert str(db.scalar(select(Baseline.initiative_metric_id).where(Baseline.id == baseline_id))) == assign_id

    # Verify SUPERSEDED assignments are excluded from list_assigned_metrics
    list_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers)
    assert list_res.status_code == 200
    assigned_list = list_res.json()
    assert len(assigned_list) == 1
    assert assigned_list[0]["id"] == new_assign_id

    # Verify an InitiativeVersion snapshot was created with metric update metadata
    versions = db.scalars(select(InitiativeVersion).where(InitiativeVersion.initiative_id == init_id)).all()
    assert len(versions) >= 1
    assert any("Active Metric update snapshot" in v.change_reason for v in versions)


# 2. uq_primary_kpi behavior & secondary promotion test
def test_primary_kpi_safeguards_and_migration(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    # Create initiative
    init_res = client.post("/api/v1/initiatives", json={"name": "Safeguards Test Initiative", "business_area": "Care"}, headers=headers)
    assert init_res.status_code == 201
    init_id = init_res.json()["id"]

    # Assign PRIMARY_KPI
    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Transition to ACTIVE
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=SUBMITTED", headers=headers)
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=ACTIVE", headers=headers)

    # Attempt to promote a SECONDARY metric to PRIMARY_KPI while one exists -> Blocked 409
    m_payload2 = {
        "canonical_key": f"metrics.csat_{uuid.uuid4().hex[:6]}",
        "name": "Customer Satisfaction 2",
        "description": "CSAT score 2",
        "unit": "PERCENT",
        "value_type": "PERCENT",
        "improvement_direction": "INCREASE",
        "aggregation_method": "AVG",
        "time_grain": "MONTH"
    }
    m_res2 = client.post("/api/v1/metrics", json=m_payload2, headers=headers)
    metric_def_id2 = m_res2.json()["id"]

    # Link as SECONDARY first
    assign_payload2 = {
        "metric_definition_id": metric_def_id2,
        "role": "SECONDARY",
        "target_type": "ABSOLUTE",
        "target_value": 80.00,
        "threshold_operator": "GREATER_EQUAL"
    }
    sec_res = client.post(f"/api/v1/initiatives/{init_id}/metrics", json=assign_payload2, headers=headers)
    assert sec_res.status_code == 201
    sec_id = sec_res.json()["id"]

    # Edit SECONDARY to PRIMARY_KPI -> Blocked (409 Conflict)
    edit_payload = {"role": "PRIMARY_KPI"}
    edit_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{sec_id}", json=edit_payload, headers=headers)
    assert edit_res.status_code == 409
    assert "already has a PRIMARY_KPI assigned" in edit_res.json()["detail"]


# 3. Physical delete with no history test
def test_physical_delete_with_no_history(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    # Create initiative in DRAFT
    init_res = client.post("/api/v1/initiatives", json={"name": "Delete Test Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Delete metric assignment
    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify physical deletion
    stmt = select(InitiativeMetric).where(InitiativeMetric.id == assign_id)
    assert db.scalars(stmt).first() is None


# 4. 409 delete block with baseline/history
def test_delete_blocked_with_history(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "History Delete Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Add a baseline
    baseline_payload = {
        "value": 85.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Survey"
    }
    client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/baseline", json=baseline_payload, headers=headers)

    # Attempt to delete -> Blocked 409
    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers)
    assert del_res.status_code == 409
    assert "baseline benchmarks" in del_res.json()["detail"]


# 5. Retirement with history
def test_retirement_with_history(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Retire Test Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    # Add a SECONDARY metric
    assign = setup_metric_fixture(client, headers, init_id, role="SECONDARY")
    assign_id = assign["id"]

    # Add a baseline
    baseline_payload = {
        "value": 85.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Survey"
    }
    client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/baseline", json=baseline_payload, headers=headers)

    # Retire the metric
    retire_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/retire", headers=headers)
    assert retire_res.status_code == 200
    assert retire_res.json()["status"] == "SUPERSEDED"

    # Verify it is no longer listed as active
    list_res = client.get(f"/api/v1/initiatives/{init_id}/metrics", headers=headers)
    assert len(list_res.json()) == 0


# 6. Terminal state mutations blocked
def test_terminal_state_mutations_blocked(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Terminal Test Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Transition to ACTIVE, then COMPLETED
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=SUBMITTED", headers=headers)
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=ACTIVE", headers=headers)
    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=COMPLETED", headers=headers)

    # Try patching -> 409
    patch_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"target_value": 99.0}, headers=headers)
    assert patch_res.status_code == 409

    # Try deleting -> 409
    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers)
    assert del_res.status_code == 409

    # Try retiring -> 409
    retire_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/retire", headers=headers)
    assert retire_res.status_code == 409


# 7. PRIMARY_KPI safeguards
def test_primary_kpi_safeguards(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "KPI Safeguards Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    client.post(f"/api/v1/initiatives/{init_id}/transition?target_state=SUBMITTED", headers=headers)

    # Try demoting role -> 400 Bad Request
    patch_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"role": "SECONDARY"}, headers=headers)
    assert patch_res.status_code == 400

    # Try deleting -> 400 Bad Request
    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers)
    assert del_res.status_code == 400

    # Try retiring -> 400 Bad Request
    retire_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/retire", headers=headers)
    assert retire_res.status_code == 400


# 8. Tenant isolation
def test_tenant_isolation_on_mutations(client, mock_clerk_verifier):
    # Setup initiative and metric under org 1
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_1", "org:admin")
    headers1 = get_auth_headers("user_mutations", "org_1", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Tenant 1 Initiative", "business_area": "Care"}, headers=headers1)
    init_id = init_res.json()["id"]
    assign = setup_metric_fixture(client, headers1, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Now attempt to modify under org 2 -> 404 Not Found (tenant boundaries protect resources)
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_2", "org:admin")
    headers2 = get_auth_headers("user_mutations", "org_2", "org:admin")

    patch_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"target_value": 95.0}, headers=headers2)
    assert patch_res.status_code == 404

    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers2)
    assert del_res.status_code == 404

    retire_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/retire", headers=headers2)
    assert retire_res.status_code == 404


# 9. RBAC validation
def test_rbac_on_mutations(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_admin", "org_rbac", "org:admin")
    headers_admin = get_auth_headers("user_admin", "org_rbac", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "RBAC Initiative", "business_area": "Care"}, headers=headers_admin)
    init_id = init_res.json()["id"]
    assign = setup_metric_fixture(client, headers_admin, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # Non-permitted role (VIEWER / org:member) -> 403 Forbidden
    mock_auth_payload(mock_clerk_verifier, "user_member", "org_rbac", "org:member")
    headers_member = get_auth_headers("user_member", "org_rbac", "org:member")

    patch_res = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"target_value": 95.0}, headers=headers_member)
    assert patch_res.status_code == 403

    del_res = client.delete(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", headers=headers_member)
    assert del_res.status_code == 403

    retire_res = client.post(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}/retire", headers=headers_member)
    assert retire_res.status_code == 403


# 10. Invalid target/operator combinations
def test_invalid_target_operator_combinations(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_mutations", "org_tenant_mutations", "org:admin")
    headers = get_auth_headers("user_mutations", "org_tenant_mutations", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Validation Test Initiative", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    assign = setup_metric_fixture(client, headers, init_id, role="PRIMARY_KPI")
    assign_id = assign["id"]

    # 1. ABSOLUTE with missing target_value -> 400
    res1 = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"target_type": "ABSOLUTE", "target_value": None}, headers=headers)
    assert res1.status_code == 400

    # 2. RANGE with missing bounds -> 400
    res2 = client.patch(f"/api/v1/initiatives/{init_id}/metrics/{assign_id}", json={"target_type": "RANGE", "target_lower": None, "target_upper": None}, headers=headers)
    assert res2.status_code == 400
