# Reports: Branch Summary & Duplicate Records Guide

## Reports > Branch Summary > Overview
The **Branch Summary** screen in the **Reports** module aggregates daily branch settlement totals, transaction counts, and reconciliation status across operating branches.
Prerequisites:
- You must hold the `application-users` or `branch-manager` role.
- The nightly batch job `sync_branch_ledger_v2` must show status `COMPLETED`.

## Reports > Branch Summary > Duplicate Records Troubleshooting
If duplicate rows appear in the **Branch Summary** report or batch import fails with `ERR_DUP_LEDGER_KEY`:
1. Open **Reports > Branch Summary** and click **Reconciliation Filter** in the top-right toolbar.
2. Inspect whether two batch imports share the same `settlement_batch_id`.
3. Select the duplicate pending batch and click **Mark Superseded** (this invokes read-safe deduplication via `fn_deduplicate_branch_batch`).
4. Click **Refresh Summary** to recalculate branch totals without duplicate entries.
If the batch status is already `LOCKED_POSTED`, do not edit rows manually—escalate to Support with the `settlement_batch_id`.

## Reports > Branch Summary > Exporting CSV and Signed PDF
To export the Branch Summary report:
1. Choose your date range and branch code in **Reports > Branch Summary**.
2. Click **Export** and select either **CSV (UTF-8)** or **Signed Audit PDF**.
3. Exports larger than 50,000 rows are queued in the background and appear under **Reports > Downloads**.
