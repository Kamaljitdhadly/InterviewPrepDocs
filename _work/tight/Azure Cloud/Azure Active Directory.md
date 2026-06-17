# Azure Active Directory

Setup: domain, identities, email (e.g., `kamaljit.singh@momentum.com`).

### Step 1: Register Your Domain

1.  **Choose a Domain Registrar:** GoDaddy, Namecheap, Google Domains → `momentum.com`.

2.  **Register the Domain:** Purchase per registrar steps.

### Step 2: Set Up Azure Active Directory

1.  **Create an Azure Account:** [<u>Azure Portal</u>](https://portal.azure.com).

2.  **Create an Azure AD Tenant:**

    - **Azure Active Directory** → **Create a resource** > **Identity** > **Azure Active Directory**.

    - Tenant for `momentum.com`.

3.  **Add Custom Domain to Azure AD:**

    - **Custom domain names** > **Add custom domain** → `momentum.com`.

    - Verify: TXT record at registrar.

### Step 3: Set Up Microsoft 365 for Email

1.  **Choose a Microsoft 365 Plan:** Business Basic/Standard.

2.  **Purchase a Microsoft 365 Subscription:** [<u>Microsoft 365 admin center</u>](https://admin.microsoft.com/).

3.  **Add Your Domain to Microsoft 365:**

    - **Setup** > **Domains** > **Add domain** → `momentum.com`; verify via TXT.

4.  **Configure DNS Records for Email:**

    - MX, CNAME, TXT at registrar per admin center.

### Step 4: Create User Accounts

1.  **Add Users in Azure AD:**

    - **Users** > **New user** → `kamaljit.singh@momentum.com`; roles/groups.

2.  **Assign Microsoft 365 Licenses:**

    - **Active users** → **Manage product licenses**.

### Step 5: Set Up Email Accounts

1.  **Configure Email Clients:** Outlook web/desktop/mobile.

2.  **Email Security and Policies:** Spam filtering, DLP in admin center.

### Step 6: Manage User Access and Security

1.  **Enable Multi-Factor Authentication (MFA):** All users in Azure AD.

2.  **Set Up Conditional Access Policies:** By location, device state.

3.  **Regularly Review Access:** Audit permissions.

### Conclusion

Azure AD + M365 = identity, access control, email for org users.
