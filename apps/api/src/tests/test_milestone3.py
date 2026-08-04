import io
import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from src.core.storage import get_storage_service
from src.measurements.models import DataSource, SourceFile, IngestionRun, Observation, DataQualityAssessment

# Helper to create authentication headers
def get_auth_headers(clerk_user_id="user_test_m3", clerk_org_id="org_test_m3", role="org:admin"):
    return {
        "Authorization": f"Bearer token_{clerk_user_id}_{clerk_org_id}_{role}"
    }

def mock_auth_payload(mock_verifier, clerk_user_id="user_test_m3", clerk_org_id="org_test_m3", role="org:admin"):
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

# =====================================================================
# DATA SOURCES & UPLOAD SECURITY TESTS
# =====================================================================

def test_data_source_crud(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # 1. Create Data Source
    payload = {
        "name": "Local CSV Support Data",
        "source_type": "CSV",
        "provider": "Zendesk",
        "configuration": {}
    }
    response = client.post("/api/v1/data-sources", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Local CSV Support Data"
    source_id = data["id"]

    # 2. Get Data Source
    response = client.get(f"/api/v1/data-sources/{source_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["provider"] == "Zendesk"

    # 3. List Data Sources
    response = client.get("/api/v1/data-sources", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 1

def test_upload_file_security_and_deduplication(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # Setup logical data source
    payload = {"name": "Upload Test Source", "source_type": "CSV"}
    res = client.post("/api/v1/data-sources", json=payload, headers=headers)
    ds_id = res.json()["id"]

    # 1. Test size limits (>10MB)
    huge_bytes = b"x" * (11 * 1024 * 1024)
    response = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("huge.csv", huge_bytes, "text/csv")},
        headers=headers
    )
    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

    # 2. Test extension validation (.txt)
    response = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("malicious.txt", b"some,data\n1,2", "text/plain")},
        headers=headers
    )
    assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE

    # 3. Path traversal protection in filename
    response = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("../../etc/passwd.csv", b"Date,Resolved Count\n2026-06-01,10", "text/csv")},
        headers=headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert ".." not in data["object_key"]
    assert "passwd.csv" in data["object_key"]
    file_id_1 = data["id"]

    # 4. Checksum source-scoped deduplication
    file_data = b"Date,Resolved Count\n2026-06-01,10"
    res_dup = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("another.csv", file_data, "text/csv")},
        headers=headers
    )
    assert res_dup.status_code == status.HTTP_201_CREATED
    file_id_2 = res_dup.json()["id"]

    # Rerun upload of same bytes under SAME data source. Reuses record.
    res_dup_same = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("another_copied.csv", file_data, "text/csv")},
        headers=headers
    )
    assert res_dup_same.status_code == status.HTTP_201_CREATED
    assert res_dup_same.json()["id"] == file_id_2

    # Rerun upload of same bytes under DIFFERENT data source. Returns separate record.
    res_ds2 = client.post("/api/v1/data-sources", json={"name": "DS2", "source_type": "CSV"}, headers=headers)
    ds_id_2 = res_ds2.json()["id"]
    res_dup_diff = client.post(
        f"/api/v1/uploads?data_source_id={ds_id_2}",
        files={"file": ("another.csv", file_data, "text/csv")},
        headers=headers
    )
    assert res_dup_diff.status_code == status.HTTP_201_CREATED
    assert res_dup_diff.json()["id"] != file_id_2

# =====================================================================
# INGESTION RUNS IDEMPOTENCY & STATE MACHINE TESTS
# =====================================================================

def test_ingestion_runs_idempotency_and_state(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # Setup source and file
    ds_res = client.post("/api/v1/data-sources", json={"name": "Run Test Source", "source_type": "CSV"}, headers=headers)
    ds_id = ds_res.json()["id"]
    file_data = b"Date,Resolved Count\n2026-06-01,10\n2026-06-02,abc" # row 2 is invalid
    file_res = client.post(
        f"/api/v1/uploads?data_source_id={ds_id}",
        files={"file": ("runs.csv", file_data, "text/csv")},
        headers=headers
    )
    file_id = file_res.json()["id"]

    # Create ingestion run with idempotency key
    run_payload = {
        "source_file_id": file_id,
        "idempotency_key": "idem-key-1"
    }
    res_run1 = client.post(f"/api/v1/data-sources/{ds_id}/imports", json=run_payload, headers=headers)
    assert res_run1.status_code == status.HTTP_202_ACCEPTED
    run1 = res_run1.json()
    assert run1["status"] == "QUEUED"

    # Retrying same idempotency key returns the existing run
    res_run_idem = client.post(f"/api/v1/data-sources/{ds_id}/imports", json=run_payload, headers=headers)
    assert res_run_idem.status_code == status.HTTP_202_ACCEPTED
    assert res_run_idem.json()["id"] == run1["id"]

    # Trying to process without mapping snapshot fails
    res_proc_fail = client.post(f"/api/v1/imports/{run1['id']}/process", headers=headers)
    assert res_proc_fail.status_code == status.HTTP_400_BAD_REQUEST

    # Register Metric Definition & assign to Initiative
    metric_payload = {
        "canonical_key": "resolved_tickets",
        "name": "Resolved Tickets",
        "description": "Resolved support tickets count.",
        "unit": "tickets",
        "value_type": "INTEGER",
        "improvement_direction": "INCREASE",
        "aggregation_method": "SUM",
        "time_grain": "DAY"
    }
    metric_res = client.post("/api/v1/metrics", json=metric_payload, headers=headers)
    latest_ver_id = metric_res.json()["latest_version"]["id"]

    init_res = client.post("/api/v1/initiatives", json={"name": "Support Automation Ingest", "business_area": "Care"}, headers=headers)
    init_id = init_res.json()["id"]

    client.post(
        f"/api/v1/initiatives/{init_id}/metrics",
        json={"metric_definition_id": metric_res.json()["id"], "role": "PRIMARY_KPI", "target_type": "DIRECTIONAL"},
        headers=headers
    )

    # Submit column mapping
    mapping_payload = {
        "metric_version_id": latest_ver_id,
        "timestamp_column": "Date",
        "value_column": "Resolved Count",
        "date_format_pattern": "%Y-%m-%d"
    }
    client.post(f"/api/v1/imports/{run1['id']}/mapping", json=mapping_payload, headers=headers)

    # Process run
    from unittest.mock import patch
    orig_close = db.close
    db.close = lambda: None
    try:
        with patch("src.measurements.routes.SessionLocal", lambda: db):
            res_process = client.post(f"/api/v1/imports/{run1['id']}/process", headers=headers)
            assert res_process.status_code == status.HTTP_202_ACCEPTED
            assert res_process.json()["status"] == "RUNNING"
    finally:
        db.close = orig_close

    # Fetch status
    status_res = client.get(f"/api/v1/imports/{run1['id']}", headers=headers)
    run_status = status_res.json()["status"]
    assert run_status in ("SUCCEEDED", "PARTIAL", "FAILED")
    
    # Retrieve errors
    errors_res = client.get(f"/api/v1/imports/{run1['id']}/errors", headers=headers)
    assert errors_res.status_code == status.HTTP_200_OK

# =====================================================================
# OBSERVATION VALIDATION WORKFLOW TESTS
# =====================================================================

def test_observation_validation_workflow(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # Register Metric & assignment
    metric_res = client.post("/api/v1/metrics", json={
        "canonical_key": "manual_csat", "name": "CSAT Score", "description": "Customer satisfaction score",
        "unit": "percent", "value_type": "PERCENT", "improvement_direction": "INCREASE",
        "aggregation_method": "AVG", "time_grain": "MONTH"
    }, headers=headers)
    init_res = client.post("/api/v1/initiatives", json={"name": "Manual Obs Initiative", "business_area": "Sales"}, headers=headers)
    init_id = init_res.json()["id"]

    im_res = client.post(f"/api/v1/initiatives/{init_id}/metrics", json={
        "metric_definition_id": metric_res.json()["id"], "role": "PRIMARY_KPI", "target_type": "DIRECTIONAL"
    }, headers=headers)
    init_metric_id = im_res.json()["id"]

    # 1. Create Manual Observation
    obs_payload = {
        "value": 85.5,
        "period_start": "2026-06-01T00:00:00Z",
        "period_end": "2026-06-30T00:00:00Z",
        "observation_type": "MANUAL",
        "source_reference": "Q2 CSAT Survey Output"
    }
    obs_res = client.post(f"/api/v1/initiative-metrics/{init_metric_id}/observations", json=obs_payload, headers=headers)
    assert obs_res.status_code == status.HTTP_201_CREATED
    obs_data = obs_res.json()
    assert obs_data["validation_state"] == "UNVALIDATED"
    obs_id = obs_data["id"]

    # Verify manual observations cannot carry ingestion_run_id (enforced in DB chk_manual_lineage_guard)
    # Tested indirectly via standard manual creation which sets those to NULL.

    # 2. Assert excluded from analytics while UNVALIDATED
    # First create an approved baseline so analytics doesn't raise missing baseline error
    client.post(f"/api/v1/initiatives/{init_id}/metrics/{init_metric_id}/baseline", json={
        "value": 80.0, "period_start": "2026-05-01T00:00:00Z", "period_end": "2026-05-31T00:00:00Z",
        "baseline_type": "PRE_DEPLOYMENT", "source_method": "Survey"
    }, headers=headers)
    # Approve baseline
    baselines_res = client.get(f"/api/v1/initiatives/{init_id}", headers=headers) # Fetch baseline id
    # Retrieve assigned baseline ID via ORM list or similar
    # Since we can approve the baseline:
    from src.measurements.models import Baseline
    db_base = db.query(Baseline).filter(Baseline.initiative_metric_id == init_metric_id).first()
    db_base.status = "APPROVED"
    db_base.approved_by_user_id = uuid.UUID(obs_data["created_by_user_id"])
    db_base.approved_at = datetime.now(timezone.utc)
    db.commit()

    # Get analytics summary -> current KPI should be 0.0 because observation is UNVALIDATED
    summary_res = client.get(f"/api/v1/initiatives/{init_id}/analytics/summary", headers=headers)
    assert summary_res.status_code == status.HTTP_200_OK
    assert summary_res.json()["kpis"][0]["current"] == 0.0

    # 3. Validate Observation
    val_res = client.post(f"/api/v1/observations/{obs_id}/validate", headers=headers)
    assert val_res.status_code == status.HTTP_200_OK
    assert val_res.json()["validation_state"] == "VALIDATED"

    # Get analytics summary -> current KPI should now be 85.5
    summary_res2 = client.get(f"/api/v1/initiatives/{init_id}/analytics/summary", headers=headers)
    assert summary_res2.json()["kpis"][0]["current"] == 85.5

    # 4. Assert validate/reject are terminal states
    res_val_retry = client.post(f"/api/v1/observations/{obs_id}/validate", headers=headers)
    assert res_val_retry.status_code == status.HTTP_409_CONFLICT

# =====================================================================
# DETERMINISTIC ANALYTICS SUMMARY TESTS
# =====================================================================

def test_analytics_currency_blocks_and_variance(client, mock_clerk_verifier, db):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # 1. Create Initiative
    init_res = client.post("/api/v1/initiatives", json={"name": "Investment Incomparable Currency", "business_area": "FP&A"}, headers=headers)
    init_id = init_res.json()["id"]

    # 2. Add Investment (DRAFT, currency = USD)
    inv_payload = {
        "currency": "USD",
        "period_start": "2026-08-01",
        "period_end": "2026-12-31"
    }
    # Link manually via DB to save testing code length
    from src.initiatives.models import Investment, InvestmentCostItem, Initiative
    init_db = db.query(Initiative).filter(Initiative.id == init_id).first()
    org_id = init_db.organization_id
    
    inv = db.query(Investment).filter(Investment.initiative_id == init_id, Investment.version_number == 1).first()
    inv.status = "APPROVED"
    inv.currency = "USD"
    
    # 3. Add cost items (PLANNED in USD)
    item1 = InvestmentCostItem(
        id=uuid.uuid4(),
        organization_id=org_id,
        investment_id=inv.id,
        category="SOFTWARE",
        value_type="PLANNED",
        amount=10000.00,
        currency="USD"
    )
    db.add(item1)

    # Add Investment 2 (approved, version = 2, currency = EUR)
    inv2 = Investment(
        id=uuid.uuid4(),
        organization_id=org_id,
        initiative_id=init_id,
        version_number=2,
        currency="EUR",
        status="APPROVED"
    )
    db.add(inv2)
    
    # Add cost item for Investment 2 (ACTUAL in EUR)
    item2 = InvestmentCostItem(
        id=uuid.uuid4(),
        organization_id=org_id,
        investment_id=inv2.id,
        category="SOFTWARE",
        value_type="ACTUAL",
        amount=9500.00,
        currency="EUR"
    )
    db.add(item2)
    db.commit()

    # 4. Assert analytics summary throws 400 Bad Request
    response = client.get(f"/api/v1/initiatives/{init_id}/analytics/summary", headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Incomparable currencies" in response.json()["detail"]

# =====================================================================
# DATA QUALITY ASSESSMENT TESTS
# =====================================================================

def test_data_quality_assessment(client, mock_clerk_verifier):
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # 1. Create Initiative with no metrics
    init_res = client.post("/api/v1/initiatives", json={"name": "No Metrics Quality", "business_area": "Ops"}, headers=headers)
    init_id = init_res.json()["id"]

    # 2. Get Data Quality. Assert BLOCKED
    response = client.get(f"/api/v1/initiatives/{init_id}/data-quality", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["state"] == "BLOCKED"
    assert response.json()["completeness"]["status"] == "BLOCKED"
    assert response.json()["consistency"]["status"] == "NOT_EVALUATED"

# =====================================================================
# TENANT ISOLATION TESTS
# =====================================================================

def test_cross_tenant_composite_fk_rejections(client, mock_clerk_verifier):
    # Setup Tenant A resources
    mock_auth_payload(mock_clerk_verifier, "user_tenant_a", "org_tenant_a", "org:admin")
    headers_a = get_auth_headers("user_tenant_a", "org_tenant_a", "org:admin")

    ds_res_a = client.post("/api/v1/data-sources", json={"name": "Tenant A Data", "source_type": "CSV"}, headers=headers_a)
    ds_id_a = ds_res_a.json()["id"]

    file_res_a = client.post(
        f"/api/v1/uploads?data_source_id={ds_id_a}",
        files={"file": ("tenant_a.csv", b"Date,Value\n2026-06-01,10", "text/csv")},
        headers=headers_a
    )
    file_id_a = file_res_a.json()["id"]

    # Switch to Tenant B
    mock_auth_payload(mock_clerk_verifier, "user_tenant_b", "org_tenant_b", "org:admin")
    headers_b = get_auth_headers("user_tenant_b", "org_tenant_b", "org:admin")

    # Try creating ingestion run referencing Tenant A's file or data source.
    # Assert 404 (mismatch or isolation protection)
    response = client.post(
        f"/api/v1/data-sources/{ds_id_a}/imports",
        json={"source_file_id": file_id_a},
        headers=headers_b
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_milestone3_additional_audit_scenarios(client, mock_clerk_verifier, db):
    from src.measurements.models import Observation
    mock_auth_payload(mock_clerk_verifier, "user_analyst", "org_tenant_m3", "org:admin")
    headers = get_auth_headers("user_analyst", "org_tenant_m3", "org:admin")

    # 1. Register Metric & assignment
    metric_res = client.post("/api/v1/metrics", json={
        "canonical_key": "audit_metric", "name": "Audit Metric", "description": "Used for extra audits",
        "unit": "percent", "value_type": "PERCENT", "improvement_direction": "INCREASE",
        "aggregation_method": "AVG", "time_grain": "MONTH"
    }, headers=headers)
    init_res = client.post("/api/v1/initiatives", json={"name": "Audit Initiative", "business_area": "Sales"}, headers=headers)
    init_id = init_res.json()["id"]

    im_res = client.post(f"/api/v1/initiatives/{init_id}/metrics", json={
        "metric_definition_id": metric_res.json()["id"], "role": "PRIMARY_KPI", "target_type": "DIRECTIONAL"
    }, headers=headers)
    init_metric_id = im_res.json()["id"]
    metric_ver_id = uuid.UUID(im_res.json()["metric_version_id"])
    
    from src.initiatives.models import Initiative
    init_db = db.query(Initiative).filter(Initiative.id == init_id).first()
    org_id = init_db.organization_id

    # Scenario B: REJECTED observation is excluded from analytics
    # Create manual observation
    obs_payload = {
        "value": 90.0,
        "period_start": "2026-06-01T00:00:00Z",
        "period_end": "2026-06-30T00:00:00Z",
        "observation_type": "MANUAL"
    }
    obs_res = client.post(f"/api/v1/initiative-metrics/{init_metric_id}/observations", json=obs_payload, headers=headers)
    obs_id = obs_res.json()["id"]
    
    # Reject it
    client.post(f"/api/v1/observations/{obs_id}/reject", json={"rejection_reason": "Outlier"}, headers=headers)

    # Get analytics summary -> current KPI should be 0.0 because it is REJECTED
    summary_res = client.get(f"/api/v1/initiatives/{init_id}/analytics/summary", headers=headers)
    assert summary_res.json()["kpis"][0]["current"] == 0.0

    # Scenario C: missing approved baseline handled safely (no baseline created)
    # Analytics should have baseline = 0.0 and target_attained = False
    summary_res_no_base = client.get(f"/api/v1/initiatives/{init_id}/analytics/summary", headers=headers)
    assert summary_res_no_base.json()["kpis"][0]["baseline"] == 0.0
    assert summary_res_no_base.json()["kpis"][0]["target_attained"] is False

    # Scenario D: stale observations produce correct DQ behavior
    # Insert a validated observation older than 60 days
    stale_obs = Observation(
        id=uuid.uuid4(),
        organization_id=org_id,
        initiative_metric_id=init_metric_id,
        metric_version_id=metric_ver_id,
        initiative_id=init_id,
        value=50.0,
        period_start=datetime.now(timezone.utc) - timedelta(days=70),
        period_end=datetime.now(timezone.utc) - timedelta(days=70),
        observation_type="MANUAL",
        validation_state="VALIDATED"
    )
    db.add(stale_obs)
    db.commit()

    dq_res = client.get(f"/api/v1/initiatives/{init_id}/data-quality", headers=headers)
    assert dq_res.json()["state"] == "STALE"
    assert dq_res.json()["freshness"]["status"] == "STALE"

    # Scenario E: stale RUNNING ingestion run recovery works
    from src.measurements.models import IngestionRun, DataSource, SourceFile
    ds = DataSource(id=uuid.uuid4(), organization_id=org_id, name="Temp DS", source_type="CSV")
    sf = SourceFile(id=uuid.uuid4(), organization_id=org_id, data_source_id=ds.id, object_key="temp", original_filename="temp.csv", content_type="text/csv", size_bytes=10, checksum="abc")
    run = IngestionRun(id=uuid.uuid4(), organization_id=org_id, data_source_id=ds.id, source_file_id=sf.id, status="RUNNING")
    db.add(ds)
    db.add(sf)
    db.flush()
    db.add(run)
    db.commit()

    from src.measurements.service import MeasurementsService
    count = MeasurementsService.recover_stale_running_runs(db)
    assert count == 1
    db.refresh(run)
    assert run.status == "FAILED"

    # Scenario F: storage object removed if DB registration fails
    from unittest.mock import MagicMock, patch
    from src.core.storage import LocalStorageProvider
    from src.identity.authorization import AuthorizationContext
    
    from sqlalchemy.orm import Session
    try:
        with patch.object(Session, "commit", side_effect=Exception("Database crash mock")):
            with patch.object(LocalStorageProvider, "delete_file") as mock_delete:
                with pytest.raises(Exception):
                    MeasurementsService.upload_source_file(
                        db=db,
                        context=AuthorizationContext(user_id=uuid.uuid4(), clerk_user_id=str(uuid.uuid4()), active_organization_id=org_id, capabilities=["ingest_data"]),
                        data_source_id=ds.id,
                        original_filename="test_fail.csv",
                        content_type="text/csv",
                        size_bytes=100,
                        checksum=None,
                        file_bytes=b"header1,header2\nvalue1,value2"
                    )
                assert mock_delete.call_count == 1
    finally:
        pass

    # Scenario A: manual observation cannot contain ingestion lineage (assert DB IntegrityError)
    from sqlalchemy.exc import IntegrityError
    invalid_manual = Observation(
        id=uuid.uuid4(),
        organization_id=org_id,
        initiative_metric_id=init_metric_id,
        metric_version_id=metric_ver_id,
        initiative_id=init_id,
        value=10.0,
        period_start=datetime.now(timezone.utc),
        period_end=datetime.now(timezone.utc),
        observation_type="MANUAL",
        source_row_index=1 # Violates chk_manual_lineage_guard!
    )
    db.add(invalid_manual)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()

