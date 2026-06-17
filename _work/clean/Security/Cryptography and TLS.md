# Cryptography and TLS

## Questions Covered

1. What is the difference between symmetric and asymmetric encryption?
2. What is the difference between hashing and encryption?
3. How do digital signatures work?
4. Walk through a TLS handshake at a high level.
5. What is a certificate chain of trust?
6. What is HMAC and when would you use it?
7. How do salt and pepper strengthen password storage?
8. What are common cryptographic mistakes in production systems?

## What is the difference between symmetric and asymmetric encryption?

**Symmetric encryption** uses one shared secret key for both encryption and decryption. It is fast and efficient for bulk data (files, database columns, TLS record payloads after the handshake).

**Asymmetric encryption** uses a key pair: a **public key** (encrypt or verify) and a **private key** (decrypt or sign). It solves key distribution but is orders of magnitude slower than symmetric crypto.

| Aspect | Symmetric | Asymmetric |
|--------|-----------|------------|
| Keys | One shared secret | Public + private pair |
| Speed | Fast (AES-GCM, ChaCha20) | Slow (RSA, ECDH) |
| Key distribution | Hard at scale | Public keys are shareable |
| Typical use | Bulk data, sessions | Key exchange, signatures, certs |
| Examples | AES-256-GCM, ChaCha20-Poly1305 | RSA-2048+, ECDSA P-256 |

**Hybrid approach (TLS, PGP, S/MIME):** asymmetric crypto establishes or wraps a symmetric session key; symmetric crypto carries the actual traffic.

```
Client                                    Server
  |                                         |
  |---- ClientHello (supported ciphers) --->|
  |<--- ServerHello + cert + key share -----|
  |                                         |
  |  [asymmetric: agree session key]        |
  |  [symmetric: encrypt application data]  |
```

**OpenSSL examples:**

```bash
# Symmetric: AES-256-GCM encrypt/decrypt
openssl enc -aes-256-gcm -salt -pbkdf2 -iter 600000 \
  -in secret.txt -out secret.enc -pass pass:'StrongPassphrase!'

openssl enc -d -aes-256-gcm -pbkdf2 -iter 600000 \
  -in secret.enc -out secret.dec -pass pass:'StrongPassphrase!'

# Asymmetric: generate RSA key pair
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem

# Encrypt with public key, decrypt with private key
echo "confidential" | openssl pkeyutl -encrypt -pubin -inkey public.pem -out cipher.bin
openssl pkeyutl -decrypt -inkey private.pem -in cipher.bin
```

**Interview sound bite:** symmetric for volume and speed; asymmetric for identity, key agreement, and signatures. Real protocols combine both.

## What is the difference between hashing and encryption?

**Hashing** is a one-way function: fixed-length digest from arbitrary input. Same input → same digest (unless salted). You cannot recover the original from the hash.

**Encryption** is reversible with the correct key: ciphertext ↔ plaintext.

| Property | Hashing | Encryption |
|----------|---------|------------|
| Reversible | No | Yes (with key) |
| Output size | Fixed (e.g. 256 bits) | Similar to input + padding/tag |
| Purpose | Integrity, fingerprinting, password verification | Confidentiality |
| Key required | No (password hashing uses salt + params) | Yes |
| Examples | SHA-256, BLAKE2, bcrypt, Argon2 | AES-GCM, RSA-OAEP |

**Hashing:** integrity checks, password verification (slow KDF), signature inputs. **Encryption:** data that must be read back (PII at rest, transit).

```bash
# SHA-256 hash (NOT for passwords)
echo -n "hello" | openssl dgst -sha256

# bcrypt-style password hash (use application library in production)
# PHP/Python/Node use bcrypt/Argon2 — openssl passwd is legacy DES-based:
openssl passwd -6 'MySecurePassword!'   # SHA-512 crypt; prefer Argon2id in apps
```

**Common mistake:** calling AES "hashing" or storing `SHA256(password)` without salt and a slow KDF. Attackers precompute rainbow tables and crack billions of hashes per second on GPUs.

**Password storage rule:** use **Argon2id** (preferred), **bcrypt**, or **scrypt** with per-user salt and tuned cost parameters — not raw SHA-256 or MD5.

## How do digital signatures work?

A **digital signature** proves **authenticity** (who sent it), **integrity** (not tampered), and **non-repudiation** (sender cannot credibly deny signing) for a message or document.

**Process:**

1. Sender hashes the message (e.g. SHA-256).
2. Sender encrypts the hash with their **private key** → signature.
3. Receiver hashes the received message independently.
4. Receiver decrypts the signature with sender's **public key** and compares digests.

If they match, the message is intact and was signed by the holder of the private key.

```
Message -----> SHA-256 -----> digest
                                  |
Private key --[sign]------------> signature ---- sent with message

Receiver: SHA-256(message) == decrypt(signature, public_key) ?
```

**Signing vs encryption with RSA:**

| Operation | Key used | Goal |
|-----------|----------|------|
| Encrypt | Public | Confidentiality |
| Decrypt | Private | Read ciphertext |
| Sign | Private | Prove origin |
| Verify | Public | Check signature |

**OpenSSL:**

```bash
# Generate EC key (common for TLS certs today)
openssl ecparam -name prime256v1 -genkey -noout -out ec-private.pem
openssl ec -in ec-private.pem -pubout -out ec-public.pem

# Sign and verify a file
openssl dgst -sha256 -sign ec-private.pem -out message.sig message.txt
openssl dgst -sha256 -verify ec-public.pem -signature message.sig message.txt
# prints "Verified OK"
```

**In TLS and code signing:** certificates bind a public key to an identity (domain, org). The server signs handshake messages so the client knows it talks to the real endpoint, not a MITM.

**ECDSA vs RSA:** ECDSA and Ed25519 give smaller keys and faster ops at equivalent strength (P-256 ≈ RSA-3072). TLS 1.3 prefers ECDHE + ECDSA or Ed25519 certificates.

## Walk through a TLS handshake at a high level.

TLS (Transport Layer Security) negotiates a secure channel: **authenticated peer** (via certificates), **confidentiality** (symmetric encryption), and **integrity** (AEAD or MAC).

### TLS 1.2 full handshake (simplified)

```
Client                                 Server
  |                                       |
  |-------- ClientHello ---------------->|
  |  version, random, cipher suites,      |
  |  extensions (SNI, ALPN, ...)        |
  |                                       |
  |<------- ServerHello -----------------|
  |  chosen cipher, random                |
  |<------- Certificate -----------------|
  |<------- ServerKeyExchange (optional) -|
  |<------- ServerHelloDone --------------|
  |                                       |
  |-------- ClientKeyExchange ---------->|
  |  (pre-master secret or DH share)      |
  |-------- ChangeCipherSpec ----------->|
  |-------- Finished (encrypted) ------->|
  |                                       |
  |<------- ChangeCipherSpec ------------|
  |<------- Finished (encrypted) --------|
  |                                       |
  |======== Application Data ============|
```

1. **ClientHello** — version, random, cipher suites, SNI, ALPN.
2. **ServerHello + Certificate** — chosen cipher; X.509 chain validated.
3. **Key exchange** — **ECDHE** (forward secrecy) or legacy RSA transport.
4. **Finished** — switch to session keys; verify handshake integrity.
5. **Application data** — AES-GCM or ChaCha20-Poly1305.

**TLS 1.3:** 1-RTT handshake, AEAD-only ciphers, mandatory (EC)DHE, optional 0-RTT resumption (replay risk).

```bash
# Inspect negotiated cipher and certificate chain
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# Test TLS version support
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3
```

**Forward secrecy (PFS):** session keys from ECDHE are ephemeral. Compromising the server's long-term private key does not decrypt past captures — unlike old RSA key transport.

## What is a certificate chain of trust?

An **X.509 certificate** binds a **public key** to an **identity** (DNS name, org). Browsers and OSes trust **root CAs** preloaded in the trust store. Servers send a **chain** from leaf → intermediates → (root is usually omitted).

```
[ Root CA ]          (self-signed, in OS/browser trust store)
     |
     v
[ Intermediate CA ]  (cross-signed sometimes)
     |
     v
[ Leaf certificate ] (your server: CN=api.example.com)
```

**Validation checks (simplified):**

1. Leaf not expired; hostname matches **SAN** (Subject Alternative Name).
2. Each cert signed by issuer above it; signatures verify with issuer public key.
3. Chain terminates at a trusted root.
4. Cert not revoked (CRL or OCSP stapling).
5. Key usage / EKU appropriate (e.g. `serverAuth`).

```bash
# View full chain from a live host
openssl s_client -showcerts -connect example.com:443 -servername example.com </dev/null

# Verify a PEM chain offline against system CAs
openssl verify -untrusted intermediate.pem leaf.pem

# Inspect SAN and key usage
openssl x509 -in leaf.pem -noout -text | grep -A1 "Subject Alternative Name"
```

**Interview points:** self-signed for dev only; wildcards — check SAN list; Let's Encrypt — automate 90-day renewal; **mTLS** for service-to-service. Avoid hard-coded pinning without backup pins.

## What is HMAC and when would you use it?

**HMAC** (Hash-based Message Authentication Code) combines a secret key with a hash function (HMAC-SHA256) to provide **integrity** and **authentication** — only parties with the secret can produce or verify the tag.

```
HMAC(K, message) = H( (K' xor opad) || H( (K' xor ipad) || message ) )
```

Unlike plain `SHA256(message)`, an attacker cannot forge a valid tag without `K`.

| Use case | Why HMAC |
|----------|----------|
| API webhook signatures (Stripe, GitHub) | Verify sender + payload integrity |
| JWT `HS256` | Symmetric signed tokens (prefer RS256/ES256 for multi-service) |
| Cookie signing | Tamper detection |
| PBKDF2 / key derivation building block | Part of password-based KDFs |

```bash
# HMAC-SHA256 with OpenSSL
echo -n "payload body" | openssl dgst -sha256 -hmac "shared-secret-key"

# Compare in application code with constant-time comparison (timingSafeEqual)
```

**HMAC vs digital signature:**

| | HMAC | Asymmetric signature |
|---|------|---------------------|
| Keys | Shared secret | Public/private pair |
| Speed | Very fast | Slower |
| Non-repudiation | Weak (both sides know secret) | Strong (only private key holder signs) |
| Distribution | Secret must be shared securely | Public key can be published |

**When not to use HMAC alone:** public APIs where consumers cannot share one global secret — use asymmetric signatures or mTLS instead.

## How do salt and pepper strengthen password storage?

**Problem:** users choose weak passwords; attackers steal hash databases and crack offline with GPUs.

**Salt** — unique random value per user, stored alongside the hash. Defeats **rainbow tables** and ensures identical passwords produce different hashes.

**Pepper** — secret value shared across all users, stored **outside** the database (HSM, Key Vault, env var). Even if the DB leaks, attacker still needs the pepper to verify guesses.

```
stored_hash = Argon2id( password + pepper, salt, memory_cost, time_cost )
```

| Mechanism | Scope | Stored where | Protects against |
|-----------|-------|--------------|------------------|
| Salt | Per user | DB next to hash | Rainbow tables, bulk identical-password detection |
| Pepper | Global secret | App config / HSM | DB-only leak; slows offline crack if pepper unknown |
| Slow KDF | Per hash | Params in hash string | Brute-force speed |

Use CSPRNG salt (≥ 16 bytes), **Argon2id** (or bcrypt 12+), never reuse salts, keep pepper out of DB and logs; rehash on pepper rotation.

```bash
# Illustrative: random salt generation (use library in production)
openssl rand -base64 16

# Argon2 in many stacks — example with Python passlib (conceptual):
# argon2id$v=19$m=65536,t=3,p=4$salt$hash
```

**Interview nuance:** pepper is not a substitute for salt — you need both. Pepper loss locks you out of verifying passwords unless you have backup. Document recovery procedures.

## What are common cryptographic mistakes in production systems?

### 1. Using ECB mode for structured data

**ECB** encrypts each block independently. Identical plaintext blocks → identical ciphertext blocks. Patterns leak.

```
Plain:  [BLOCK][BLOCK][    ][BLOCK]
ECB:    [XXXX ][XXXX ][YYYY][XXXX ]  ← pattern visible
```

**Fix:** use **AEAD** modes — **AES-GCM**, **ChaCha20-Poly1305**, or **AES-CBC + HMAC** (encrypt-then-MAC, not MAC-then-encrypt). TLS 1.3 uses AEAD only.

```bash
# BAD: openssl enc -aes-256-ecb (default in older examples)
# GOOD: GCM via modern APIs (libsodium, .NET AesGcm, Java Cipher "AES/GCM/NoPadding")
openssl enc -aes-256-gcm -pbkdf2 -iter 600000 -in data.txt -out data.enc -pass pass:'key'
```

### 2. Rolling your own crypto

Custom "combine XOR with timestamp" schemes, homegrown block ciphers, or `hash(password + salt)` without a vetted KDF fail under scrutiny.

**Fix:** use vetted libraries and protocols — TLS, NaCl/libsodium, platform APIs (`RandomNumberGenerator`, Web Crypto). Follow **RFCs** and **OWASP** guidance.

### 3–8. Other frequent failures

| Issue | Fix |
|-------|-----|
| Nonce/IV reuse (GCM) | Unique nonce per message; never IV `0` |
| MD5 / SHA-1 | SHA-256+; Argon2id for passwords |
| Keys in Git | Key Vault; secret scanning; rotate |
| Weak PRNG (`Math.random`) | OS CSPRNG; ≥ 128-bit tokens |
| Padding oracles | RSA-OAEP; TLS 1.3; constant-time compare |
| Disabled cert validation | Full chain + hostname; never ship `verify=false` |

**Checklist for interviews:**

| Mistake | Safer alternative |
|---------|-------------------|
| AES-ECB | AES-GCM, ChaCha20-Poly1305 |
| SHA256(password) | Argon2id + salt + pepper |
| Custom MAC | HMAC-SHA256 or AEAD |
| RSA 1024-bit | RSA 2048+ or ECDSA P-256+ |
| TLS 1.0/1.1 | TLS 1.2 minimum; prefer 1.3 |
| `RAND_pseudo` / weak PRNG | OS CSPRNG |

Cryptography is **easy to get wrong** — default to standards, let experts maintain primitives, and have security review for anything custom.

## Related Topics

- Certificates — CSR, IIS, Application Gateway
- C# — .NET Core OAuth 2.0, Cookies
- Microservices Security — mTLS, secrets management
- System Design Security — authn/authz, data in transit/at rest
