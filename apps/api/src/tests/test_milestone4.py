import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from src.initiatives.models import Claim, Evidence, Review, ReviewSnapshot, Intervention
from src.measurements.models import DataSource, SourceFile, IngestionRun, Observation, InitiativeMetric, Baseline

def get_auth_headers(clerk_user_id="user_test_m4", clerk_org_id="org_test_m4", role="org:admin"):
    return {
        "Authorization": f"Bearer token_{clerk_user_id}_{clerk_org_id}_{role}"
    }

def mock_auth_payload(mock_verifier, clerk_user_id="user_test_m4", clerk_org_id="org_test_m4", role="org:admin"):
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

def setup_mock_kpi(client, headers, initiative_id):
    # Register metric definition
    m_payload = {
        "canonical_key": "metrics.csat",
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

    # Assign to initiative
    assign_payload = {
        "metric_definition_id": metric_def_id,
        "role": "PRIMARY_KPI",
        "target_type": "ABSOLUTE",
        "target_value": 90.00,
        "threshold_operator": "GREATER_EQUAL"
    }
    assign_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics", json=assign_payload, headers=headers)
    assert assign_res.status_code == 201
    assigned_metric_id = assign_res.json()["id"]

    # Create approved baseline
    baseline_payload = {
        "value": 85.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
        "period_end": datetime.now(timezone.utc).isoformat(),
        "baseline_type": "PRE_DEPLOYMENT",
        "source_method": "Survey"
    }
    base_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics/{assigned_metric_id}/baseline", json=baseline_payload, headers=headers)
    assert base_res.status_code == 201
    baseline_id = base_res.json()["id"]

    # Approve baseline
    app_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics/{assigned_metric_id}/baseline/{baseline_id}/approve", headers=headers)
    assert app_res.status_code == 200

    # Create manual observation
    obs_payload = {
        "value": 88.00,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "period_end": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        "observation_type": "MANUAL",
        "source_reference": "Manual test report"
    }
    obs_res = client.post(f"/api/v1/initiative-metrics/{assigned_metric_id}/observations", json=obs_payload, headers=headers)
    assert obs_res.status_code == 201
    obs_id = obs_res.json()["id"]

    # Validate observation using validate_metrics capability
    val_obs_res = client.post(f"/api/v1/observations/{obs_id}/validate", headers=headers)
    assert val_obs_res.status_code == 200

    return assigned_metric_id


# =====================================================================
# INTERVENTIONS TESTS
# =====================================================================

def test_interventions_timeline(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_m4_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_m4_test", "org:admin")

    # 1. Create Initiative
    init_payload = {"name": "M4 Timeline Initiative"}
    res = client.post("/api/v1/initiatives", json=init_payload, headers=headers)
    assert res.status_code == 201
    init_id = res.json()["id"]

    # 2. Record Intervention
    int_payload = {
        "action_type": "ROUTING_CHANGE",
        "title": "Rerouted customer support requests",
        "description": "Changed support routing model",
        "reason": "Lower costs",
        "effective_at": datetime.now(timezone.utc).isoformat()
    }
    res_int = client.post(f"/api/v1/initiatives/{init_id}/interventions", json=int_payload, headers=headers)
    assert res_int.status_code == 201
    int_id = res_int.json()["id"]

    # 3. List Interventions (Timeline)
    res_list = client.get(f"/api/v1/initiatives/{init_id}/interventions", headers=headers)
    assert res_list.status_code == 200
    timeline = res_list.json()
    assert len(timeline) == 1
    assert timeline[0]["id"] == int_id
    assert timeline[0]["action_type"] == "ROUTING_CHANGE"


# =====================================================================
# CLAIMS & EVIDENCE TESTS
# =====================================================================

def test_claims_and_evidence_lifecycle(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_m4_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_m4_test", "org:admin")

    # 1. Create Initiative
    init_id = client.post("/api/v1/initiatives", json={"name": "M4 Claims Initiative"}, headers=headers).json()["id"]

    # 2. Create Claim
    claim_payload = {
        "claim_type": "CAUSAL",
        "statement": "Fast response times cause higher CSAT"
    }
    claim_res = client.post(f"/api/v1/initiatives/{init_id}/claims", json=claim_payload, headers=headers)
    assert claim_res.status_code == 201
    claim_id = claim_res.json()["id"]

    # 3. Retrieve Claim detail
    claim_get = client.get(f"/api/v1/claims/{claim_id}", headers=headers)
    assert claim_get.status_code == 200
    assert claim_get.json()["claim_type"] == "CAUSAL"

    # 4. Attach Evidence
    ev_payload = {
        "evidence_level": "E3",
        "stance": "SUPPORTS",
        "source_type": "MANUAL",
        "source_reference": "Q2 CSAT manual analysis report"
    }
    ev_res = client.post(f"/api/v1/claims/{claim_id}/evidence", json=ev_payload, headers=headers)
    assert ev_res.status_code == 201
    ev_id = ev_res.json()["id"]
    assert ev_res.json()["validation_state"] == "UNVALIDATED"

    # 5. List Evidence for Claim
    ev_list = client.get(f"/api/v1/claims/{claim_id}/evidence", headers=headers)
    assert ev_list.status_code == 200
    assert len(ev_list.json()) == 1
    assert ev_list.json()[0]["id"] == ev_id

    # 6. Get single evidence
    ev_get = client.get(f"/api/v1/evidence/{ev_id}", headers=headers)
    assert ev_get.status_code == 200

    # 7. Human Validation - Validate
    mock_auth_payload(mock_clerk_verifier, "validator_1", "org_m4_test", "org:admin") # validator role
    val_res = client.post(f"/api/v1/evidence/{ev_id}/validate", headers=headers)
    assert val_res.status_code == 200
    assert val_res.json()["validation_state"] == "VALIDATED"
    assert val_res.json()["validated_by_user_id"] is not None

    # 8. Terminal state immutability - Rejecting already validated evidence should fail (HTTP 409)
    rej_res = client.post(f"/api/v1/evidence/{ev_id}/reject?reason=Incorrect+methods", headers=headers)
    assert rej_res.status_code == status.HTTP_409_CONFLICT

    # 9. Terminal state immutability - Validating already validated evidence should fail (HTTP 409)
    val_res_dup = client.post(f"/api/v1/evidence/{ev_id}/validate", headers=headers)
    assert val_res_dup.status_code == status.HTTP_409_CONFLICT


def test_evidence_rejection(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_m4_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_m4_test", "org:admin")

    init_id = client.post("/api/v1/initiatives", json={"name": "M4 Rej Initiative"}, headers=headers).json()["id"]
    claim_id = client.post(f"/api/v1/initiatives/{init_id}/claims", json={"claim_type": "CHANGE", "statement": "Statement"}, headers=headers).json()["id"]
    ev_id = client.post(
        f"/api/v1/claims/{claim_id}/evidence",
        json={"evidence_level": "E1", "stance": "SUPPORTS", "source_type": "MANUAL"},
        headers=headers
    ).json()["id"]

    # 1. Rejecting requires reason
    rej_fail = client.post(f"/api/v1/evidence/{ev_id}/reject?reason=", headers=headers)
    assert rej_fail.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 2. Reject successfully
    rej_ok = client.post(f"/api/v1/evidence/{ev_id}/reject?reason=Flawed+data", headers=headers)
    assert rej_ok.status_code == 200
    assert rej_ok.json()["validation_state"] == "REJECTED"
    assert rej_ok.json()["rejection_reason"] == "Flawed data"


# =====================================================================
# SOURCE TYPE INVARIANTS TESTS
# =====================================================================

def test_evidence_source_type_invariants(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_m4_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_m4_test", "org:admin")

    init_id = client.post("/api/v1/initiatives", json={"name": "M4 Inv Initiative"}, headers=headers).json()["id"]
    claim_id = client.post(f"/api/v1/initiatives/{init_id}/claims", json={"claim_type": "DESCRIPTIVE", "statement": "Invariants"}, headers=headers).json()["id"]

    # 1. OBSERVATION requires observation_id
    payload_obs_invalid = {
        "evidence_level": "E3",
        "stance": "SUPPORTS",
        "source_type": "OBSERVATION",
        "observation_id": None
    }
    res = client.post(f"/api/v1/claims/{claim_id}/evidence", json=payload_obs_invalid, headers=headers)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 2. FILE requires source_file_id
    payload_file_invalid = {
        "evidence_level": "E2",
        "stance": "SUPPORTS",
        "source_type": "FILE",
        "source_file_id": None
    }
    res = client.post(f"/api/v1/claims/{claim_id}/evidence", json=payload_file_invalid, headers=headers)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 3. MANUAL cannot have either
    some_id = str(uuid.uuid4())
    payload_manual_invalid = {
        "evidence_level": "E1",
        "stance": "SUPPORTS",
        "source_type": "MANUAL",
        "observation_id": some_id
    }
    res = client.post(f"/api/v1/claims/{claim_id}/evidence", json=payload_manual_invalid, headers=headers)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# =====================================================================
# CROSS-TENANT ISOLATION TESTS
# =====================================================================

def test_cross_tenant_database_isolation(client, mock_clerk_verifier):
    # Setup Tenant A
    mock_auth_payload(mock_clerk_verifier, "user_a", "org_tenant_a", "org:admin")
    headers_a = get_auth_headers("user_a", "org_tenant_a", "org:admin")
    init_a = client.post("/api/v1/initiatives", json={"name": "Org A Initiative"}, headers=headers_a).json()
    init_a_id = init_a["id"]
    claim_a = client.post(f"/api/v1/initiatives/{init_a_id}/claims", json={"claim_type": "CAUSAL", "statement": "Statement A"}, headers=headers_a).json()
    claim_a_id = claim_a["id"]

    # Setup Tenant B
    mock_auth_payload(mock_clerk_verifier, "user_b", "org_tenant_b", "org:admin")
    headers_b = get_auth_headers("user_b", "org_tenant_b", "org:admin")
    init_b = client.post("/api/v1/initiatives", json={"name": "Org B Initiative"}, headers=headers_b).json()
    init_b_id = init_b["id"]

    # 1. Tenant B cannot create a claim under Tenant A's initiative
    res_fail_claim = client.post(f"/api/v1/initiatives/{init_a_id}/claims", json={"claim_type": "CAUSAL", "statement": "Attack"}, headers=headers_b)
    assert res_fail_claim.status_code == status.HTTP_404_NOT_FOUND

    # 2. Tenant B cannot get Tenant A's claim
    res_fail_get = client.get(f"/api/v1/claims/{claim_a_id}", headers=headers_b)
    assert res_fail_get.status_code == status.HTTP_404_NOT_FOUND

    # 3. Tenant B cannot attach evidence to Tenant A's claim
    res_fail_ev = client.post(
        f"/api/v1/claims/{claim_a_id}/evidence",
        json={"evidence_level": "E1", "stance": "SUPPORTS", "source_type": "MANUAL"},
        headers=headers_b
    )
    assert res_fail_ev.status_code == status.HTTP_404_NOT_FOUND


# =====================================================================
# DETERMINISTIC STRENGTH EVALUATOR TESTS
# =====================================================================

def test_claim_evidence_strength_matrix(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_strength_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_strength_test", "org:admin")

    init_id = client.post("/api/v1/initiatives", json={"name": "Strength Case"}, headers=headers).json()["id"]
    claim_id = client.post(f"/api/v1/initiatives/{init_id}/claims", json={"claim_type": "CAUSAL", "statement": "Statement"}, headers=headers).json()["id"]

    # 1. Strength is LIMITED with no validated supporting evidence
    res_l1 = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_l1.json()["state"] == "LIMITED"

    # Add E3 validated evidence (Data quality is default unhealthy since no metrics exist)
    ev_id = client.post(
        f"/api/v1/claims/{claim_id}/evidence",
        json={"evidence_level": "E3", "stance": "SUPPORTS", "source_type": "MANUAL"},
        headers=headers
    ).json()["id"]
    client.post(f"/api/v1/evidence/{ev_id}/validate", headers=headers)

    # 2. Downgrades to LIMITED because data quality is default unhealthy (no metrics)
    res_l2 = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_l2.json()["state"] == "LIMITED"

    # Add Primary KPI and approved baseline to satisfy health (data quality becomes healthy)
    setup_mock_kpi(client, headers, init_id)

    # 3. Now strength becomes MODERATE (E3 supporting evidence + healthy data quality)
    res_mod = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_mod.json()["state"] == "MODERATE"

    # Attach E5 validated evidence
    ev_high = client.post(
        f"/api/v1/claims/{claim_id}/evidence",
        json={"evidence_level": "E5", "stance": "SUPPORTS", "source_type": "MANUAL"},
        headers=headers
    ).json()["id"]
    client.post(f"/api/v1/evidence/{ev_high}/validate", headers=headers)

    # 4. Strength remains MODERATE because E5 requires concurrent interventions to show causal proof
    res_high_no_int = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_high_no_int.json()["state"] == "MODERATE"

    # Log an intervention on the timeline
    client.post(
        f"/api/v1/initiatives/{init_id}/interventions",
        json={"action_type": "PROCESS_CHANGE", "title": "Change", "effective_at": datetime.now(timezone.utc).isoformat()},
        headers=headers
    )

    # 5. Now strength rises to STRONG (E5 validated evidence + healthy data quality + timeline interventions)
    res_strong = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_strong.json()["state"] == "STRONG"

    # Add conflicting validated evidence
    ev_conflict = client.post(
        f"/api/v1/claims/{claim_id}/evidence",
        json={"evidence_level": "E3", "stance": "CONFLICTS", "source_type": "MANUAL"},
        headers=headers
    ).json()["id"]
    client.post(f"/api/v1/evidence/{ev_conflict}/validate", headers=headers)

    # 6. Should downgrade to LIMITED due to conflicting evidence
    res_conf = client.get(f"/api/v1/claims/{claim_id}/strength", headers=headers)
    assert res_conf.json()["state"] == "LIMITED"


# =====================================================================
# REVIEWS & SNAPSHOTS TESTS
# =====================================================================

def test_reviews_readiness_and_freeze(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "owner_1", "org_review_test", "org:admin")
    headers = get_auth_headers("owner_1", "org_review_test", "org:admin")

    # Setup initiative
    init_id = client.post("/api/v1/initiatives", json={"name": "Audit Initiative"}, headers=headers).json()["id"]
    claim_id = client.post(f"/api/v1/initiatives/{init_id}/claims", json={"claim_type": "DECISION", "statement": "Statement"}, headers=headers).json()["id"]

    # Attach unvalidated evidence (creates blocker)
    ev_id = client.post(
        f"/api/v1/claims/{claim_id}/evidence",
        json={"evidence_level": "E1", "stance": "SUPPORTS", "source_type": "MANUAL"},
        headers=headers
    ).json()["id"]

    # 1. Create Review
    review_payload = {
        "review_type": "INVESTMENT",
        "decision_question": "Should we scale up investment?"
    }
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json=review_payload, headers=headers)
    assert review_res.status_code == 201
    review_id = review_res.json()["id"]

    # 2. Get readiness - Expect not ready due to missing KPI, baseline, target, unvalidated evidence, etc.
    readiness = client.get(f"/api/v1/reviews/{review_id}/readiness", headers=headers).json()
    assert readiness["ready"] is False
    assert len(readiness["blockers"]) > 0

    # 3. Freezing review should fail when blockers exist
    freeze_fail = client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    assert freeze_fail.status_code == status.HTTP_400_BAD_REQUEST

    # Satisfy all readiness blockers:
    # A. Validate the unvalidated evidence
    client.post(f"/api/v1/evidence/{ev_id}/validate", headers=headers)

    # B. Assign Primary KPI with approved baseline and targets
    setup_mock_kpi(client, headers, init_id)

    # 4. Now readiness should pass
    readiness_ok = client.get(f"/api/v1/reviews/{review_id}/readiness", headers=headers).json()
    assert readiness_ok["ready"] is True
    assert len(readiness_ok["blockers"]) == 0

    # Prepare review to READY
    prep_res = client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    assert prep_res.status_code == 200
    assert prep_res.json()["status"] == "READY"

    # 5. Freeze review snapshot
    freeze_res = client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    assert freeze_res.status_code == 201
    snapshot = freeze_res.json()
    assert snapshot["snapshot_version"] == 1
    assert "claims" in snapshot["evidence_snapshot"]
    assert "assumptions" in snapshot["assumptions_snapshot"]

    # Verify review status advanced to IN_REVIEW
    rev_get = client.get(f"/api/v1/reviews/{review_id}", headers=headers)
    assert rev_get.json()["status"] == "IN_REVIEW"

    # 6. Retrieve snapshot
    snap_get = client.get(f"/api/v1/reviews/{review_id}/snapshot", headers=headers)
    assert snap_get.status_code == 200
    assert snap_get.json()["snapshot_version"] == 1

    # 7. Complete review
    comp_res = client.post(f"/api/v1/reviews/{review_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "COMPLETED"
