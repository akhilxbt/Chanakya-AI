# Administration: User Creation, Roles & SSO Provisioning

## Users > Provisioning > Creating a New User Account
To create a new user account in the **Users** module:
1. Open **Administration > Users** and click **New User**.
2. Enter the corporate email address, full name, and primary branch code.
3. Assign an authorization role (`application-users`, `branch-manager`, or `auditor`).
4. Click **Send Activation Invite**. The activation link expires after 24 hours.

## Users > Provisioning > Fixing Error ERR_SSO_CLAIM_MISMATCH
When a user signs in with SAML or OIDC and receives `ERR_SSO_CLAIM_MISMATCH`:
1. Navigate to **Administration > Users** and search for the user's email.
2. Verify that the **External Subject ID** field matches the identity provider `sub` claim.
3. Click **Resync Identity Claims** and ask the user to sign in again.

## Dealer > Branch Summary > Commission Settlement
In the **Dealer** module, the **Dealer Branch Summary** screen computes dealer commission payouts via `GET /api/v2/dealer/commissions`.
1. Open **Dealer > Branch Summary**.
2. Filter by Dealer ID and settlement cycle.
3. Click **Verify Payout Schedule** to review tier adjustments and holdbacks.
