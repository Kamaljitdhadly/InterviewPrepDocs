# Certificate Signing Request on IIS and Azure Application Gateway

SSL workflow: **CSR creation** → **purchase from provider (GoDaddy)** → **CA validation** → **install on IIS** → **verify**.

### Step 1: Generate a Certificate Signing Request (CSR) on IIS

1. **Open IIS Manager** on target server
2. **Server Certificates** — click server name → double-click "Server Certificates"
3. **Create CSR** — "Create Certificate Request…" in Actions panel
4. **Distinguished Name Properties:**

   | Field | Value |
   |-------|-------|
   | **Common Name** | FQDN (e.g., `www.mydomain.com`) |
   | **Organization** | Legal org name |
   | **Organizational Unit** | Department (optional) |
   | **City/Locality** | City |
   | **State/Province** | State/province |
   | **Country/Region** | Two-letter code (e.g., US) |

5. **Cryptographic Service Provider:**
   - Provider: **Microsoft RSA SChannel Cryptographic Provider**
   - Bit Length: **2048**
6. **Save CSR** — e.g., `mydomain.csr` for CA submission

### Step 2: Purchase SSL Certificate from GoDaddy

1. Go to GoDaddy **SSL Certificates** section
2. Choose cert type (Standard, Wildcard, EV)
3. Add to cart → checkout
4. **Upload CSR** (`mydomain.csr`) during purchase
5. Select server type: **Microsoft IIS**
6. Complete payment — GoDaddy forwards CSR to CA

### Step 3: Certificate Authority (CA) Validation and Approval

| Validation Type | Method |
|-----------------|--------|
| **Domain (DV)** | Email to registered domain address |
| **DNS** | Add specific DNS record |
| **File-based** | Upload file to website |
| **Organization (OV/EV)** | Additional identity documents |

Once verified → CA issues cert via email or GoDaddy account download.

### Step 4: Download and Install the SSL Certificate on IIS

1. **Download** from GoDaddy account:
   - **Primary cert** (`your_domain_name.crt`/`.cer`)
   - **Intermediate certs** (`gd_bundle.crt` or similar)

2. **Install in IIS:**
   - IIS Manager → Server Certificates → **Complete Certificate Request…**
   - Select primary cert file
   - Friendly name (e.g., "MyDomain SSL")
   - Store: **Personal**

3. **Bind to site:**
   - Sites → select site → **Bindings…** → Add/Edit
   - Type: **https** | Port: **443** | SSL Certificate: select installed cert
   - OK → close bindings

4. **Restart IIS** — server name → Actions → **Restart**

### Step 5: Verify SSL Installation

- Visit `https://yourdomain.com` — check **padlock** in address bar
- Run **SSL Labs SSL Test** for chain completeness

### Summary

1. **Generate CSR** in IIS
2. **Purchase SSL** from GoDaddy; submit CSR
3. **CA validates** domain (and org for OV/EV)
4. **Install + bind** cert on IIS
5. **Verify** installation

---

Azure workflow: **purchase SSL via Azure** → **install on Application Gateway** → **secure IIS on Azure VM**.

### Step 1: Purchase an SSL Certificate from Azure

1. **Azure Portal** → [portal.azure.com](https://portal.azure.com)
2. **Key Vault** — create or use existing (Create a resource → Security + Identity → Key Vault)
3. **Generate CSR** — Key Vault → Certificates → Generate/Import → Generate
   - Subject: e.g., `CN=www.mydomain.com`
   - **Download CSR** for purchase
4. **Purchase SSL** — Azure Marketplace → SSL Certificate provider (DigiCert, GlobalSign, etc.)
   - Upload Key Vault CSR during purchase
5. **CA validates** → cert delivered back to **Azure Key Vault**

### Step 2: Install the SSL Certificate on Azure Application Gateway

1. Portal → **Application Gateway** (Networking)
2. **Listeners** → Add listener:
   - Protocol: **HTTPS** | Port: **443**
   - SSL Certificate: **Choose a Key Vault certificate** → select from Key Vault
3. **HTTP settings** — new setting:
   - Backend port: **443** (if IIS uses HTTPS)
   - Protocol: **HTTPS**
   - **Use Well-Known CA Certificate**: enable for trusted CA certs
   - Override hostname if needed
4. **Associate listener** with backend pool (IIS server) via routing rules

### Step 3: Secure the IIS Website on an Azure VM

1. **RDP** into Azure VM
2. **Import cert:**
   - Export from Key Vault as **.pfx** → transfer to VM
   - IIS Manager → Server Certificates → **Import** → select `.pfx` + password
3. **Bind to website:**
   - Sites → site → Bindings → https | Port 443 | select imported cert
4. **Backend HTTPS** — ensure Application Gateway communicates with IIS over HTTPS
5. **Test** — `https://yourdomain.com` + padlock check

### Step 4: Verify the SSL Installation

- **SSL Labs SSL Test** — cert + chain completeness
- **Monitor Application Gateway** — SSL offloading, routing, cert validation

### Summary

1. **Purchase SSL from Azure** — CSR in Key Vault → marketplace purchase
2. **Application Gateway** — HTTPS listener with Key Vault cert
3. **IIS on Azure VM** — import `.pfx`, bind HTTPS
4. **Verify and monitor** — SSL test + gateway health

SSL offloading at Application Gateway; end-to-end HTTPS to IIS in Azure VM.
