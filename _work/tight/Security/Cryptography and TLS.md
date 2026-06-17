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

**Symmetric:** one shared secret key; fast for bulk data (files, TLS payloads). **Asymmetric:** public/private key pair; solves distribution but slow — used for key exchange, signatures, certificates.

| Aspect | Symmetric | Asymmetric |
|--------|-----------|------------|
| Keys | One shared secret | Public + private pair |
| Speed | Fast (AES-GCM, ChaCha20) | Slow (RSA, ECDH) |
| Key distribution | Hard at scale | Public keys are shareable |
| Typical use | Bulk data, sessions | Key exchange, signatures, certs |
| Examples | AES-256-GCM, ChaCha20-Poly1305 | RSA-2048+, ECDSA P-256 |

**Hybrid (TLS, PGP):** asymmetric agrees session key; symmetric encrypts traffic.

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

**Sound bite:** symmetric = speed/volume; asymmetric = identity and key agreement.

## What is the difference between hashing and encryption?

**Hashing:** one-way, fixed-length digest; integrity and fingerprints. **Encryption:** reversible with key; confidentiality.

| Property | Hashing | Encryption |
|----------|---------|------------|
| Reversible | No | Yes (with key) |
| Output size | Fixed (e.g. 256 bits) | Similar to input + padding/tag |
| Purpose | Integrity, fingerprinting, password verification | Confidentiality |
| Key required | No (password hashing uses salt + params) | Yes |
| Examples | SHA-256, BLAKE2, bcrypt, Argon2 | AES-GCM, RSA-OAEP |

Never `SHA256(password)` alone — use **Argon2id**, **bcrypt**, or **scrypt** with per-user salt.

```bash
# SHA-256 hash (NOT for passwords)
echo -n "hello" | openssl dgst -sha256

# bcrypt-style password hash (use application library in production)
# PHP/Python/Node use bcrypt/Argon2 — openssl passwd is legacy DES-based:
openssl passwd -6 'MySecurePassword!'   # SHA-512 crypt; prefer Argon2id in apps
```

## How do digital signatures work?

Proves **authenticity**, **integrity**, and **non-repudiation**: hash message → sign hash with **private key** → verifier checks with **public key**.

```
Message -----> SHA-256 -----> digest
                                  |
Private key --[sign]------------> signature ---- sent with message

Receiver: SHA-256(message) == decrypt(signature, public_key) ?
```

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

Certs bind public keys to identities. TLS 1.3 prefers ECDHE + ECDSA/Ed25519 (P-256 ≈ RSA-3072).

## Walk through a TLS handshake at a high level.

TLS delivers authenticated peer, confidentiality, and integrity (AEAD).

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

**TLS 1.3:** 1-RTT, AEAD-only, mandatory (EC)DHE, optional 0-RTT (replay risk).

```bash
# Inspect negotiated cipher and certificate chain
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# Test TLS version support
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3
```

**PFS:** ECDHE session keys are ephemeral — past traffic stays safe if long-term key leaks.

## What is a certificate chain of trust?

X.509 binds **public key** to **identity**. Trust store holds root CAs; server sends leaf → intermediates.

```
[ Root CA ]          (self-signed, in OS/browser trust store)
     |
     v
[ Intermediate CA ]  (cross-signed sometimes)
     |
     v
[ Leaf certificate ] (your server: CN=api.example.com)
```

**Validate:** expiry, SAN hostname, signatures up to trusted root, revocation (CRL/OCSP), key usage (`serverAuth`).

```bash
# View full chain from a live host
openssl s_client -showcerts -connect example.com:443 -servername example.com </dev/null

# Verify a PEM chain offline against system CAs
openssl verify -untrusted intermediate.pem leaf.pem

# Inspect SAN and key usage
openssl x509 -in leaf.pem -noout -text | grep -A1 "Subject Alternative Name"
```

Self-signed = dev only; automate Let's Encrypt renewal; **mTLS** for service-to-service.

## What is HMAC and when would you use it?

**HMAC** = secret + hash → integrity + authentication tag only key holders can forge.

```
HMAC(K, message) = H( (K' xor opad) || H( (K' xor ipad) || message ) )
```

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

| | HMAC | Asymmetric signature |
|---|------|---------------------|
| Keys | Shared secret | Public/private pair |
| Non-repudiation | Weak | Strong |

Use asymmetric signatures or mTLS when a global shared secret does not scale.

## How do salt and pepper strengthen password storage?

**Salt** (per user, in DB) defeats rainbow tables. **Pepper** (global, outside DB) slows crack after DB-only leak.

```
stored_hash = Argon2id( password + pepper, salt, memory_cost, time_cost )
```

| Mechanism | Scope | Stored where | Protects against |
|-----------|-------|--------------|------------------|
| Salt | Per user | DB next to hash | Rainbow tables, bulk identical-password detection |
| Pepper | Global secret | App config / HSM | DB-only leak; slows offline crack if pepper unknown |
| Slow KDF | Per hash | Params in hash string | Brute-force speed |

CSPRNG salt ≥ 16 bytes; **Argon2id**; never log pepper.

```bash
# Illustrative: random salt generation (use library in production)
openssl rand -base64 16

# Argon2 in many stacks — example with Python passlib (conceptual):
# argon2id$v=19$m=65536,t=3,p=4$salt$hash
```

Need both salt and pepper; document pepper recovery.

## What are common cryptographic mistakes in production systems?

### 1. Using ECB mode for structured data

**ECB** leaks patterns — identical blocks → identical ciphertext.

```
Plain:  [BLOCK][BLOCK][    ][BLOCK]
ECB:    [XXXX ][XXXX ][YYYY][XXXX ]  ← pattern visible
```

**Fix:** **AES-GCM**, **ChaCha20-Poly1305**, or CBC + encrypt-then-MAC.

```bash
# BAD: openssl enc -aes-256-ecb (default in older examples)
# GOOD: GCM via modern APIs (libsodium, .NET AesGcm, Java Cipher "AES/GCM/NoPadding")
openssl enc -aes-256-gcm -pbkdf2 -iter 600000 -in data.txt -out data.enc -pass pass:'key'
```

### 2. Rolling your own crypto

Custom XOR schemes or `hash(password+salt)` without vetted KDF fail review. Use TLS, libsodium, platform CSPRNG, RFCs/OWASP.

### 3–8. Other frequent failures

| Issue | Fix |
|-------|-----|
| Nonce/IV reuse (GCM) | Unique nonce per message; never IV `0` |
| MD5 / SHA-1 | SHA-256+; Argon2id for passwords |
| Keys in Git | Key Vault; secret scanning; rotate |
| Weak PRNG (`Math.random`) | OS CSPRNG; ≥ 128-bit tokens |
| Padding oracles | RSA-OAEP; TLS 1.3; constant-time compare |
| Disabled cert validation | Full chain + hostname; never ship `verify=false` |

| Mistake | Safer alternative |
|---------|-------------------|
| AES-ECB | AES-GCM, ChaCha20-Poly1305 |
| SHA256(password) | Argon2id + salt + pepper |
| TLS 1.0/1.1 | TLS 1.2+; prefer 1.3 |

Default to standards — do not invent primitives.

## Related Topics

- Certificates — CSR, IIS, Application Gateway
- C# — .NET Core OAuth 2.0, Cookies
- Microservices Security — mTLS, secrets management
- System Design Security — authn/authz, data in transit/at rest
