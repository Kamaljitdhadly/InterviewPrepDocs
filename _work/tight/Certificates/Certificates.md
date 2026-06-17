# Certificates

**Authenticate identity** and **encrypt data** for secure connections.

## 1. SSL/TLS Certificates

| Type | Validation | Use Case |
|------|------------|----------|
| **DV (Domain Validated)** | Domain control only | Blogs, small sites |
| **OV (Organization Validated)** | Organization identity verified | Business websites |
| **EV (Extended Validation)** | Rigorous org vetting; green bar/company name in browser | Highest trust |
| **Wildcard** | Single cert for domain + all subdomains (e.g., `*.example.com`) | Multi-subdomain sites |
| **Multi-Domain (SAN)** | Multiple domains/hostnames on one cert | Orgs managing several sites |

## 2. Code Signing Certificates

Digitally sign software/executables — verifies **publisher identity** and **code integrity** (untampered).

## 3. Email Certificates (S/MIME)

**Secure/Multipurpose Internet Mail Extensions** — encrypt and digitally sign email for **confidentiality** and **sender authentication**.

## 4. Client Certificates

Authenticate **users or devices** to servers — extra security beyond username/password; common in corporate internal access.

## 5. Root Certificates

Top of **PKI hierarchy**; issued by trusted **CA**; self-signed; pre-installed in OS/browser trust stores; signs all downstream certs.

## 6. Intermediate Certificates

Bridge between **root** and **end-user** certs — root signs intermediate, intermediate signs end-user certs (chain of trust).

## 7. Self-Signed Certificates

Created and signed by the entity itself (not a trusted CA). Fine for **internal use**; browsers/devices reject by default (no CA chain).

## 8. Wildcard Certificates

Single cert secures a domain and **all subdomains** — used when many subdomains share one parent domain.

## 9. Multi-Domain Certificates (SAN)

**Subject Alternative Name** — multiple domains/hostnames on one certificate for orgs with several sites/services.

## 10. Document Signing Certificates

Digitally sign documents — proves **authenticity** and **integrity**; used in legal/financial industries.

## 1. PEM (Privacy Enhanced Mail)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.pem`, `.crt`, `.cer`, `.key` |
| **Format** | Base64-encoded; headers `-----BEGIN CERTIFICATE-----` / `-----END CERTIFICATE-----` |
| **Use Cases** | Unix/Linux; Apache/Nginx; cert chains (root, intermediate, end-entity) |
| **Advantages** | Human-readable; multiple certs/keys in one file |

## 2. DER (Distinguished Encoding Rules)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.der`, `.cer` |
| **Format** | Binary; not human-readable (convert to PEM to view) |
| **Use Cases** | Java platforms; Windows cert storage |
| **Advantages** | Compact; efficient for storage/transmission |

## 3. PKCS#7 (Public Key Cryptography Standards #7)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.p7b`, `.p7c` |
| **Format** | Cert chains only — **no private key**; DER or PEM encoded |
| **Use Cases** | Certificate chains; Windows and Java |
| **Advantages** | Multiple certs in one file; widely supported |

## 4. PKCS#12 (Public Key Cryptography Standards #12)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.pfx`, `.p12` |
| **Format** | Binary; cert + intermediates + private key in one file; password-protected |
| **Use Cases** | Windows import/export; code signing, document signing, secure email |
| **Advantages** | All-in-one; password protection |

## 5. CER (Certificate)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.cer`, `.crt` |
| **Format** | Synonym for PEM or DER; typically **public cert only** (no private key) |
| **Use Cases** | Store/distribute X.509 certificates |
| **Advantages** | Safe public cert distribution |

## 6. CRT (Certificate)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.crt`, `.cer` |
| **Format** | PEM or DER; public certificate |
| **Use Cases** | Web server SSL/TLS; client authentication |
| **Advantages** | Interchangeable with PEM/DER per environment |

## 7. KEY (Private Key)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.key` |
| **Format** | PEM private key; optionally passphrase-encrypted |
| **Use Cases** | Paired with CRT/PEM for secure connections |
| **Advantages** | Text-editable; passphrase-secured |

## 8. JKS (Java KeyStore)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.jks` |
| **Format** | Proprietary Java format; password-protected |
| **Use Cases** | Java apps/servers (Tomcat) SSL/TLS |
| **Advantages** | Integrated with Java security; multiple certs/keys per keystore |

## 9. P7R (PKCS#7 Certificate Request Response)

| Aspect | Detail |
|--------|--------|
| **Extensions** | `.p7r` |
| **Format** | CA response to PKCS#10 request; cert or chain |
| **Use Cases** | Import CA-issued cert after CSR submission |
| **Advantages** | Standardized; cross-platform |

## 1. RSA (Rivest-Shamir-Adleman)

| Aspect | Detail |
|--------|--------|
| **Type** | Asymmetric — public encrypts, private decrypts |
| **Key Size** | 1024–4096 bits (2048 standard) |
| **Use Cases** | SSL/TLS; digital signatures; PGP email |
| **Pros** | Widely supported; strong at large key sizes |
| **Cons** | Slower than ECC; larger keys |

## 2. DSA (Digital Signature Algorithm)

| Aspect | Detail |
|--------|--------|
| **Type** | Asymmetric — **signatures only** (no encryption/key exchange) |
| **Key Size** | 1024–3072 bits |
| **Use Cases** | Software signing; secure email |
| **Pros** | Efficient signing; NIST-standardized |
| **Cons** | Slower verification vs RSA |

## 3. ECC (Elliptic Curve Cryptography)

| Aspect | Detail |
|--------|--------|
| **Type** | Asymmetric; elliptic curves over finite fields |
| **Key Size** | 160–521 bits (256 common) — RSA-equivalent security at smaller sizes |
| **Use Cases** | SSL/TLS; mobile/embedded; signatures; key exchange |
| **Pros** | Fast; low resource use |
| **Cons** | Complex math; historically less adoption (growing) |

## 4. DH (Diffie-Hellman)

| Aspect | Detail |
|--------|--------|
| **Type** | **Key exchange only** — secure shared secret over public channel |
| **Key Size** | 2048–4096 bits |
| **Use Cases** | SSL/TLS sessions; VPNs; secure messaging |
| **Pros** | No pre-shared key needed |
| **Cons** | Weak parameters vulnerable; careful implementation required |

## 5. ECDSA (Elliptic Curve Digital Signature Algorithm)

| Aspect | Detail |
|--------|--------|
| **Type** | DSA + ECC — digital signatures with small keys |
| **Key Size** | 256–521 bits |
| **Use Cases** | Bitcoin/crypto; secure messaging; smart cards |
| **Pros** | Strong security; efficient; small keys |
| **Cons** | Complex implementation; fewer legacy tools |

## 6. EdDSA (Edwards-curve Digital Signature Algorithm)

| Aspect | Detail |
|--------|--------|
| **Type** | Modern ECC signatures — high performance, robust |
| **Key Size** | Ed25519 (256-bit), Ed448 (448-bit) |
| **Use Cases** | High-perf secure comms; blockchain; version control |
| **Pros** | Fast; side-channel resistant |
| **Cons** | Newer; less legacy support |

## 7. AES (Advanced Encryption Standard)

| Aspect | Detail |
|--------|--------|
| **Type** | **Symmetric** — same key encrypts and decrypts |
| **Key Size** | 128, 192, 256 bits |
| **Use Cases** | DB encryption; VPN/TLS; file/disk encryption |
| **Pros** | Fast (especially hardware); strong at 256-bit |
| **Cons** | Requires secure key management; weak modes risky |

## 8. P-256, P-384, P-521 (NIST Recommended Curves for ECC)

| Aspect | Detail |
|--------|--------|
| **Type** | NIST-standardized elliptic curves for ECC |
| **Key Size** | 256, 384, 521 bits |
| **Use Cases** | SSL/TLS; digital signatures |
| **Pros** | Standardized; tiered security levels |
| **Cons** | Debated curve origins; more complex than RSA |

## 9. GCM (Galois/Counter Mode)

| Aspect | Detail |
|--------|--------|
| **Type** | AES block cipher mode — **authenticated encryption** (confidentiality + integrity via MAC) |
| **Use Cases** | TLS, IPsec; data needing both encryption and integrity |
| **Pros** | High performance; parallel-friendly |
| **Cons** | **Nonce reuse** breaks security — careful implementation required |
