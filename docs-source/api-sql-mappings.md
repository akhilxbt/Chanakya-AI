# Technical Reference: API Routes, Error Codes & SQL Mappings

## API & SQL > Endpoints > Reconciliation API
- **HTTP Route**: `POST /api/v2/reports/reconcile`
- **Database Function**: `fn_reconcile_branch_totals(p_branch_id UUID, p_cycle_date DATE)`
- **Troubleshooting `ERR_RECON_LOCK_TIMEOUT`**: This error means another reconciliation worker holds an advisory lock on the same branch. Wait 60 seconds and retry the request.

## API & SQL > Endpoints > Bulk Import Validation API
- **HTTP Route**: `POST /api/v2/imports/validate`
- **Database Function**: `fn_validate_import_staging(p_upload_id UUID)`
- **Troubleshooting `ERR_SCHEMA_HEADER_MISSING`**: Ensure the uploaded CSV includes required header columns `branch_code`, `txn_date`, `amount_minor`, and `currency_iso`.

## API & SQL > Confidential > Internal Treasury HSM Rotation
ACCESS_GROUP: internal-security-admins
The treasury master key rotation uses hardware security module slot `HSM_SLOT_09` and function `fn_rotate_treasury_master_key`. Standard application users are never authorized to view this guide.
