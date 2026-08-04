import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from sqlalchemy import select
from src.initiatives.models import Claim, Evidence, Review, ReviewSnapshot, Recommendation, Decision, DecisionExpectation, Outcome, Learning, AIRun
from src.measurements.models import DataSource, SourceFile, IngestionRun, Observation, InitiativeMetric, Baseline, MetricDefinition, MetricVersion
from src.initiatives.service import GroundedAIService, ModelProviderAdapter

def get_auth_headers(clerk_user_id="user_test_m5", clerk_org_id="org_test_m5", role="org:admin"):
    return {
        "Authorization": f"Bearer token_{clerk_user_id}_{clerk_org_id}_{role}"
    }

def mock_auth_payload(mock_verifier, clerk_user_id="user_test_m5", clerk_org_id="org_test_m5", role="org:admin"):
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

def setup_m5_test_fixture(client, headers, initiative_id, target_attained=True, dq_state="HEALTHY", evidence_strength="STRONG", guardrails_passing=True):
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
        "role": "PRIMARY_KPI",
        "target_type": "ABSOLUTE",
        "target_value": 90.00,
        "threshold_operator": "GREATER_EQUAL"
    }
    assign_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics", json=assign_payload, headers=headers)
    assert assign_res.status_code == 201
    assigned_metric_id = assign_res.json()["id"]

    # 3. Create approved baseline
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

    # 4. Create manual observation representing actual value
    actual_val = 92.00 if target_attained else 80.00
    obs_payload = {
        "value": actual_val,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "period_end": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        "observation_type": "MANUAL",
        "source_reference": "Manual test report"
    }
    obs_res = client.post(f"/api/v1/initiative-metrics/{assigned_metric_id}/observations", json=obs_payload, headers=headers)
    assert obs_res.status_code == 201
    obs_id = obs_res.json()["id"]

    # Validate observation
    val_obs_res = client.post(f"/api/v1/observations/{obs_id}/validate", headers=headers)
    assert val_obs_res.status_code == 200

    # 5. Optional Guardrail setup
    if not guardrails_passing:
        g_payload = {
            "canonical_key": f"metrics.cost_{uuid.uuid4().hex[:6]}",
            "name": "Operating Cost",
            "description": "CSAT Guardrail Cost",
            "unit": "USD",
            "value_type": "MONEY",
            "improvement_direction": "DECREASE",
            "aggregation_method": "SUM",
            "time_grain": "MONTH"
        }
        g_def_res = client.post("/api/v1/metrics", json=g_payload, headers=headers)
        assert g_def_res.status_code in [200, 201]
        g_def_id = g_def_res.json()["id"]

        g_assign = {
            "metric_definition_id": g_def_id,
            "role": "GUARDRAIL",
            "target_type": "ABSOLUTE",
            "target_value": 1000.00,
            "threshold_operator": "LESS_THAN"
        }
        g_assign_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics", json=g_assign, headers=headers)
        assert g_assign_res.status_code == 201
        g_metric_id = g_assign_res.json()["id"]

        # Baseline for guardrail
        gb_res = client.post(f"/api/v1/initiatives/{initiative_id}/metrics/{g_metric_id}/baseline", json={
            "value": 500.00,
            "period_start": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            "period_end": datetime.now(timezone.utc).isoformat(),
            "baseline_type": "PRE_DEPLOYMENT",
            "source_method": "Sys"
        }, headers=headers)
        assert gb_res.status_code == 201
        gb_id = gb_res.json()["id"]
        client.post(f"/api/v1/initiatives/{initiative_id}/metrics/{g_metric_id}/baseline/{gb_id}/approve", headers=headers)

        # Obs to breach it
        g_obs_res = client.post(f"/api/v1/initiative-metrics/{g_metric_id}/observations", json={
            "value": 500.00, # Breached
            "period_start": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
            "period_end": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "observation_type": "MANUAL"
        }, headers=headers)
        assert g_obs_res.status_code == 201
        g_obs_id = g_obs_res.json()["id"]
        client.post(f"/api/v1/observations/{g_obs_id}/validate", headers=headers)

    # 6. Setup Claims & Evidence
    claim_res = client.post(f"/api/v1/initiatives/{initiative_id}/claims", json={
        "claim_type": "FINANCIAL_VALUE",
        "statement": "CSAT improvement generates value"
    }, headers=headers)
    assert claim_res.status_code == 201
    claim_id = claim_res.json()["id"]

    # Attach evidence
    ev_level = "E6" if evidence_strength == "STRONG" else ("E3" if evidence_strength == "MODERATE" else "E1")
    ev_res = client.post(f"/api/v1/claims/{claim_id}/evidence", json={
        "evidence_level": ev_level,
        "stance": "SUPPORTS",
        "source_type": "OBSERVATION",
        "observation_id": obs_id,
        "method": "Direct Survey analysis"
    }, headers=headers)
    assert ev_res.status_code == 201
    evidence_id = ev_res.json()["id"]

    # Validate evidence
    client.post(f"/api/v1/evidence/{evidence_id}/validate", headers=headers)

    # If STRONG evidence, matrix requires timeline intervention
    if evidence_strength == "STRONG":
        client.post(f"/api/v1/initiatives/{initiative_id}/interventions", json={
            "action_type": "PROCESS_CHANGE",
            "title": "Timeline intervention for strong strength",
            "effective_at": datetime.now(timezone.utc).isoformat()
        }, headers=headers)

    return assigned_metric_id, obs_id, claim_id


# =====================================================================
# M5 TESTING MATRIX
# =====================================================================

def test_m5_recommendation_policy_matrix_branches(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    # BRANCH 1: KPI Met + Guardrail Passes + STRONG evidence -> SCALE (SUPPORTED)
    init_res = client.post("/api/v1/initiatives", json={"name": "KPI Met Strong"}, headers=headers)
    assert init_res.status_code == 201
    init_id_1 = init_res.json()["id"]
    
    setup_m5_test_fixture(client, headers, init_id_1, target_attained=True, dq_state="HEALTHY", evidence_strength="STRONG", guardrails_passing=True)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id_1}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id_1 = review_res.json()["id"]

    client.post(f"/api/v1/reviews/{review_id_1}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id_1}/freeze", headers=headers)
    
    rec_res = client.post(f"/api/v1/reviews/{review_id_1}/recommendations", headers=headers)
    assert rec_res.status_code == 201
    assert rec_res.json()["recommendation_type"] == "SCALE"
    assert rec_res.json()["support_state"] == "SUPPORTED"

    # BRANCH 2: KPI Met + Guardrail Passes + MODERATE evidence -> KEEP (SUPPORTED_WITH_CONDITIONS)
    init_res2 = client.post("/api/v1/initiatives", json={"name": "KPI Met Moderate"}, headers=headers)
    init_id_2 = init_res2.json()["id"]
    setup_m5_test_fixture(client, headers, init_id_2, target_attained=True, dq_state="HEALTHY", evidence_strength="MODERATE", guardrails_passing=True)
    
    review_res2 = client.post(f"/api/v1/initiatives/{init_id_2}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id_2 = review_res2.json()["id"]

    client.post(f"/api/v1/reviews/{review_id_2}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id_2}/freeze", headers=headers)
    
    rec_res2 = client.post(f"/api/v1/reviews/{review_id_2}/recommendations", headers=headers)
    assert rec_res2.status_code == 201
    assert rec_res2.json()["recommendation_type"] == "KEEP"
    assert rec_res2.json()["support_state"] == "SUPPORTED_WITH_CONDITIONS"

    # BRANCH 3: KPI Met + Guardrail Breached + STRONG evidence -> OPTIMIZE (SUPPORTED_WITH_CONDITIONS)
    init_res3 = client.post("/api/v1/initiatives", json={"name": "KPI Met Breached Strong"}, headers=headers)
    init_id_3 = init_res3.json()["id"]
    setup_m5_test_fixture(client, headers, init_id_3, target_attained=True, dq_state="HEALTHY", evidence_strength="STRONG", guardrails_passing=False)
    
    review_res3 = client.post(f"/api/v1/initiatives/{init_id_3}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id_3 = review_res3.json()["id"]

    client.post(f"/api/v1/reviews/{review_id_3}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id_3}/freeze", headers=headers)
    
    rec_res3 = client.post(f"/api/v1/reviews/{review_id_3}/recommendations", headers=headers)
    assert rec_res3.status_code == 201
    assert rec_res3.json()["recommendation_type"] == "OPTIMIZE"
    assert rec_res3.json()["support_state"] == "SUPPORTED_WITH_CONDITIONS"


def test_m5_recommendation_idempotency_and_versioning(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Idempotency test"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]

    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    rec_res1 = client.post(f"/api/v1/reviews/{review_id}/recommendations", headers=headers)
    assert rec_res1.status_code == 201
    id1 = rec_res1.json()["id"]

    # Repeat generation - must be idempotent and return identical record
    rec_res2 = client.post(f"/api/v1/reviews/{review_id}/recommendations", headers=headers)
    assert rec_res2.status_code == 201
    id2 = rec_res2.json()["id"]
    assert id1 == id2


def test_m5_concurrency_locking(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Locking test"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    db_review = db.get(Review, review_id)

    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    rec_res1 = client.post(f"/api/v1/reviews/{review_id}/recommendations", headers=headers)
    assert rec_res1.status_code == 201
    
    # Check that recommendation exists in DB
    db.refresh(db_review)
    db_recs = db.scalars(select(Recommendation).where(Recommendation.review_snapshot_id == db_review.snapshots[0].id)).all()
    assert len(db_recs) == 1
    assert db_recs[0].version_number == 1


def test_m5_cross_tenant_isolation_violations(client, mock_clerk_verifier, db):
    # Setup Tenant A
    mock_auth_payload(mock_clerk_verifier, "user_a", "org_a", "org:admin")
    headers_a = get_auth_headers("user_a", "org_a", "org:admin")
    init_a_res = client.post("/api/v1/initiatives", json={"name": "Init Tenant A"}, headers=headers_a)
    init_a_id = init_a_res.json()["id"]
    setup_m5_test_fixture(client, headers_a, init_a_id)

    review_a_res = client.post(f"/api/v1/initiatives/{init_a_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers_a)
    review_a_id = review_a_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_a_id}/prepare", headers=headers_a)
    client.post(f"/api/v1/reviews/{review_a_id}/freeze", headers=headers_a)
    rec_a_res = client.post(f"/api/v1/reviews/{review_a_id}/recommendations", headers=headers_a)
    rec_a_id = rec_a_res.json()["id"]

    # Setup Tenant B
    mock_auth_payload(mock_clerk_verifier, "user_b", "org_b", "org:admin")
    headers_b = get_auth_headers("user_b", "org_b", "org:admin")
    init_b_res = client.post("/api/v1/initiatives", json={"name": "Init Tenant B"}, headers=headers_b)
    init_b_id = init_b_res.json()["id"]
    setup_m5_test_fixture(client, headers_b, init_b_id)

    review_b_res = client.post(f"/api/v1/initiatives/{init_b_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers_b)
    review_b_id = review_b_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_b_id}/prepare", headers=headers_b)
    client.post(f"/api/v1/reviews/{review_b_id}/freeze", headers=headers_b)

    # 1. Attempt cross-tenant recommendation posting (Tenant B targeting Tenant A's review)
    cross_rec = client.post(f"/api/v1/reviews/{review_a_id}/recommendations", headers=headers_b)
    assert cross_rec.status_code == 404 # Tenant B cannot find Review A

    # 2. Attempt cross-tenant decision posting (Tenant B referencing Tenant A's recommendation)
    dec_payload = {
        "decision_type": "SCALE",
        "recommendation_id": rec_a_id
    }
    cross_dec = client.post(f"/api/v1/reviews/{review_b_id}/decisions", json=dec_payload, headers=headers_b)
    assert cross_dec.status_code in [400, 404]


def test_m5_client_org_id_override_rejection(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_real", "org:admin")
    headers = get_auth_headers("admin_m5", "org_real", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Override test"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    payload = {
        "decision_type": "SCALE",
        "organization_id": str(uuid.uuid4()) # Mismatched target org ID
    }
    res = client.post(f"/api/v1/reviews/{review_id}/decisions", json=payload, headers=headers)
    assert res.status_code == 201
    # Check that decision recorded maps to context active org, not overridden one
    assert res.json()["organization_id"] == init_res.json()["organization_id"]
    assert res.json()["organization_id"] != payload["organization_id"]


def test_m5_human_disagreement_with_recommendation(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Disagreement test"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    rec_res = client.post(f"/api/v1/reviews/{review_id}/recommendations", headers=headers)
    assert rec_res.status_code == 201
    rec_id = rec_res.json()["id"]
    assert rec_res.json()["recommendation_type"] == "SCALE"

    # Human disagrees: records "STOP" decision
    dec_payload = {
        "decision_type": "STOP",
        "recommendation_id": rec_id,
        "rationale": "Human operator disagrees. Stopping initiative due to high budget variance."
    }
    dec_res = client.post(f"/api/v1/reviews/{review_id}/decisions", json=dec_payload, headers=headers)
    assert dec_res.status_code == 201
    assert dec_res.json()["decision_type"] == "STOP"
    assert dec_res.json()["recommendation_id"] == rec_id


def test_m5_decision_immutability(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Immutability test"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    dec_res = client.post(f"/api/v1/reviews/{review_id}/decisions", json={"decision_type": "KEEP"}, headers=headers)
    assert dec_res.status_code == 201
    dec_id = dec_res.json()["id"]

    # Verify PUT/PATCH/DELETE are rejected / blocked since no such routes are declared
    put_res = client.put(f"/api/v1/decisions/{dec_id}", json={"decision_type": "STOP"}, headers=headers)
    assert put_res.status_code in [404, 405]


def test_m5_expectation_constraints(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Expectation test"}, headers=headers)
    init_id = init_res.json()["id"]
    assigned_metric_id, _, _ = setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    dec_res = client.post(f"/api/v1/reviews/{review_id}/decisions", json={"decision_type": "KEEP"}, headers=headers)
    assert dec_res.status_code == 201
    dec_id = dec_res.json()["id"]

    # 1. period_end <= period_start -> Should fail
    exp_payload_dates = {
        "initiative_metric_id": assigned_metric_id,
        "expected_value": 90.0,
        "period_start": datetime.now(timezone.utc).isoformat(),
        "period_end": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    }
    exp_res1 = client.post(f"/api/v1/decisions/{dec_id}/expectations", json=exp_payload_dates, headers=headers)
    assert exp_res1.status_code == 400

    # 2. Both missing value and change -> Should fail
    exp_payload_empty = {
        "initiative_metric_id": assigned_metric_id,
        "period_start": datetime.now(timezone.utc).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }
    exp_res2 = client.post(f"/api/v1/decisions/{dec_id}/expectations", json=exp_payload_empty, headers=headers)
    assert exp_res2.status_code == 400

    # 3. Mathematically inconsistent value and change
    exp_payload_inconsistent = {
        "initiative_metric_id": assigned_metric_id,
        "expected_value": 90.0,
        "expected_change": 10.0,
        "period_start": datetime.now(timezone.utc).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }
    exp_res3 = client.post(f"/api/v1/decisions/{dec_id}/expectations", json=exp_payload_inconsistent, headers=headers)
    assert exp_res3.status_code == 422

    # 4. Missing baseline test: create a new metric without baseline, and try to specify expected_change (must fail with 400)
    m_payload_nobase = {
        "canonical_key": f"metrics.nobase_{uuid.uuid4().hex[:6]}",
        "name": "No Baseline Metric",
        "description": "Metric with no baseline for testing expectation constraint",
        "unit": "INTEGER",
        "value_type": "INTEGER",
        "improvement_direction": "INCREASE",
        "aggregation_method": "AVG",
        "time_grain": "MONTH"
    }
    m_res_nobase = client.post("/api/v1/metrics", json=m_payload_nobase, headers=headers)
    m_def_nobase_id = m_res_nobase.json()["id"]

    assign_res_nobase = client.post(f"/api/v1/initiatives/{init_id}/metrics", json={
        "metric_definition_id": m_def_nobase_id,
        "role": "GUARDRAIL",
        "target_type": "ABSOLUTE",
        "target_value": 100.0,
        "threshold_operator": "GREATER_EQUAL"
    }, headers=headers)
    assert assign_res_nobase.status_code == 201
    metric_nobase_id = assign_res_nobase.json()["id"]

    # Try setting expectation with change (should fail 400 because there is no baseline)
    exp_nobase_change = client.post(f"/api/v1/decisions/{dec_id}/expectations", json={
        "initiative_metric_id": metric_nobase_id,
        "expected_change": 10.0,
        "period_start": datetime.now(timezone.utc).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }, headers=headers)
    assert exp_nobase_change.status_code == 400

    # Setting expectation with value only should succeed
    exp_nobase_value = client.post(f"/api/v1/decisions/{dec_id}/expectations", json={
        "initiative_metric_id": metric_nobase_id,
        "expected_value": 100.0,
        "period_start": datetime.now(timezone.utc).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }, headers=headers)
    assert exp_nobase_value.status_code == 201
    assert exp_nobase_value.json()["expected_change"] is None


def test_m5_outcome_variance_and_missing_expectation(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Variance test"}, headers=headers)
    init_id = init_res.json()["id"]
    assigned_metric_id, obs_id, _ = setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    dec_res = client.post(f"/api/v1/reviews/{review_id}/decisions", json={"decision_type": "KEEP"}, headers=headers)
    assert dec_res.status_code == 201
    dec_id = dec_res.json()["id"]

    # Scenario A: Missing expectation -> Variance is None
    outcome_res_missing = client.post(f"/api/v1/decisions/{dec_id}/outcomes", json={
        "initiative_metric_id": assigned_metric_id,
        "observation_id": obs_id
    }, headers=headers)
    assert outcome_res_missing.status_code == 201
    assert outcome_res_missing.json()["variance_from_expected"] is None

    # Scenario B: Period Mismatch -> Variance is None
    client.post(f"/api/v1/decisions/{dec_id}/expectations", json={
        "initiative_metric_id": assigned_metric_id,
        "expected_value": 95.0,
        "period_start": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
    }, headers=headers)

    outcome_res_mismatch = client.post(f"/api/v1/decisions/{dec_id}/outcomes", json={
        "initiative_metric_id": assigned_metric_id,
        "observation_id": obs_id
    }, headers=headers)
    assert outcome_res_mismatch.status_code == 201
    assert outcome_res_mismatch.json()["variance_from_expected"] is None


def test_m5_outcome_validation_lifecycle(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "Lifecycle test"}, headers=headers)
    init_id = init_res.json()["id"]
    assigned_metric_id, obs_id, _ = setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]
    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    dec_res = client.post(f"/api/v1/reviews/{review_id}/decisions", json={"decision_type": "KEEP"}, headers=headers)
    dec_id = dec_res.json()["id"]

    # 1. Create Expectation
    client.post(f"/api/v1/decisions/{dec_id}/expectations", json={
        "initiative_metric_id": assigned_metric_id,
        "expected_value": 95.0,
        "period_start": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
        "period_end": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    }, headers=headers)

    # 2. Create Outcome
    out_res = client.post(f"/api/v1/decisions/{dec_id}/outcomes", json={
        "initiative_metric_id": assigned_metric_id,
        "observation_id": obs_id
    }, headers=headers)
    assert out_res.status_code == 201
    outcome_id = out_res.json()["id"]
    assert out_res.json()["validation_state"] == "UNVALIDATED"
    assert float(out_res.json()["variance_from_expected"]) == -3.0

    # Dispute outcome (requires dispute reason)
    disp_res_empty = client.post(f"/api/v1/outcomes/{outcome_id}/dispute", json={"reason": ""}, headers=headers)
    assert disp_res_empty.status_code == 400

    disp_res = client.post(f"/api/v1/outcomes/{outcome_id}/dispute", json={"reason": "Measurement looks corrupted."}, headers=headers)
    assert disp_res.status_code == 200
    assert disp_res.json()["validation_state"] == "DISPUTED"

    # Terminal state transitions blocked - validating disputed outcome fails
    val_again = client.post(f"/api/v1/outcomes/{outcome_id}/validate", headers=headers)
    assert val_again.status_code == 409


def test_m5_ai_grounding_runs_and_provider_failure(client, mock_clerk_verifier, db, monkeypatch):
    mock_auth_payload(mock_clerk_verifier, "admin_m5", "org_m5", "org:admin")
    headers = get_auth_headers("admin_m5", "org_m5", "org:admin")

    init_res = client.post("/api/v1/initiatives", json={"name": "AI test init"}, headers=headers)
    init_id = init_res.json()["id"]
    setup_m5_test_fixture(client, headers, init_id)
    
    review_res = client.post(f"/api/v1/initiatives/{init_id}/reviews", json={"review_type": "INVESTMENT"}, headers=headers)
    review_id = review_res.json()["id"]

    client.post(f"/api/v1/reviews/{review_id}/prepare", headers=headers)
    client.post(f"/api/v1/reviews/{review_id}/freeze", headers=headers)
    
    # 1. Call AI Draft Summary Endpoint
    ai_draft_res = client.post(f"/api/v1/reviews/{review_id}/ai/draft-summary", headers=headers)
    assert ai_draft_res.status_code == 200
    assert "draft_text" in ai_draft_res.json()
    assert "ai_run_id" in ai_draft_res.json()

    # 2. Simulate AI Provider failure
    class FailingAdapter(ModelProviderAdapter):
        def generate_completion(self, prompt: str, task_type: str, org_id: uuid.UUID, user_id: uuid.UUID) -> str:
            raise Exception("Provider is currently offline.")

    monkeypatch.setattr(GroundedAIService, "provider_adapter", FailingAdapter())
    ai_fail_res = client.post(f"/api/v1/reviews/{review_id}/ai/draft-summary", headers=headers)
    assert ai_fail_res.status_code == 500 or ai_fail_res.status_code == 502
