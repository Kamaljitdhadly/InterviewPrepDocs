# Certificate Signing Request

A **CSR** is sent from an applicant to a **CA** to request a digital certificate. Contains the **public key** and **identity information** the CA will embed in the issued cert.

### Workflow for Certificate Signing Request (CSR)

## 1. Generate a Private Key

- Generate on server/local machine — **keep private and secure**.

```bash
openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048
```

Generates a **2048-bit RSA** private key → `private.key`.

## 2. Create the CSR

- Use private key to create CSR with public key + certificate identity info.

```bash
openssl req -new -key private.key -out mydomain.csr
```

Generates `mydomain.csr` from `private.key`.

<img src="_work/md/Certificates/media/media/image1.png" style="width:5.63611in;height:4.47708in" />

Interactive prompt collects CSR fields:

| Field | Description |
|-------|-------------|
| **Country Name** | Two-letter ISO code (e.g., US) |
| **State/Province** | Full state/province name |
| **Locality** | City |
| **Organization Name** | Legal org name |
| **Organizational Unit** | Department (optional) |
| **Common Name** | **FQDN** for the cert (e.g., `www.mydomain.com`) |
| **Email Address** | Certificate administrator email |

## 3. Submit the CSR to a Certificate Authority (CA)

- Submit `mydomain.csr` to CA for identity verification and cert issuance.
- Methods: **web upload**, **email**, or **API**.

## 4. Receive and Install the Digital Certificate

- CA issues cert via email or download — typically `.crt`/`.cer` plus **intermediate certs**.

**Apache:**

```
SSLCertificateFile /path/to/certificate.crt
SSLCertificateKeyFile /path/to/private.key
SSLCertificateChainFile /path/to/intermediate.crt
```

**Nginx:**

```
ssl_certificate /path/to/certificate.crt;
ssl_certificate_key /path/to/private.key;
```

## 5. Configure and Test the Server

- Configure server to use cert; restart.
- Test with **SSL Labs SSL Test** — verify complete chain, no warnings/errors.

### Example CSR Content

```
-----BEGIN CERTIFICATE REQUEST-----
MIICsTCCAZkCAQAwgZMxCzAJBgNVBAYTAlVTMRUwEwYDVQQIDAxDYWxpZm9ybmlh
MRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeSBDb21wYW55MRow
GAYDVQQLDBFJVCBEZXBhcnRtZW50MRowGAYDVQQDDBF3d3cubXlkb21haW4uY29t
MSIwIAYJKoZIhvcNAQkBFhNhZG1pbkBteWRvbWFpbi5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQCy0yg3LfH+VZLF9pZ5bPK8E97QQf17GZX9PpFv
...
-----END CERTIFICATE REQUEST-----
```

### Summary

1. **Generate private key** — secure on server/local machine
2. **Create CSR** — public key + identity info
3. **Submit CSR** — CA verifies and issues
4. **Install certificate** — primary + intermediate certs on server
5. **Configure and test** — verify secure connection

---

CAs send **intermediate certificates** with the primary cert to establish a complete trust chain:

## 1. Understanding the Certificate Chain

| Level | Role |
|-------|------|
| **Root Certificate** | Top of chain; self-signed by trusted root CA; pre-installed in trust stores |
| **Intermediate Certificates** | Issued by root or another intermediate; bridge root → end-user |
| **End-User Certificate** | Issued to your domain (e.g., `www.mydomain.com`); installed on server |

## 2. Purpose of Intermediate Certificates

| Purpose | Why |
|---------|-----|
| **Security / trust delegation** | Root is too sensitive to sign end-user certs directly — intermediates limit root exposure |
| **Scalability** | Multiple intermediates for regions/purposes without exposing root |
| **Revocation** | Compromised intermediate revoked without affecting root or siblings |
| **Trust chain building** | Server sends intermediates clients may not have pre-installed |

## 3. How the Chain of Trust Works

**Server sends:** end-user cert (`www.mydomain.com`) + intermediate cert.

**Client verifies:**
- Intermediate links to trusted root in trust store?
- End-user cert signed by intermediate?
- Chain unbroken and valid?

→ All pass = trusted connection.

## What Happens If Intermediate Certificates Are Missing?

- **Incomplete trust chain** — client can't reach root → "certificate not trusted" / "unknown issuer"
- **Browser warnings** — users see insecure connection; damages site trust

## 5. Best Practices

- **Always include intermediate certs** in server chain configuration
- **Correct order:** end-user → intermediates → root (root typically **not** sent by server)

### Summary

Intermediate certs protect the root CA, delegate trust, and let clients validate end-user certificates — essential for scalable, secure PKI.
