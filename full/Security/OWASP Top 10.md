# OWASP Top 10

## Questions Covered

1. What is Broken Access Control and how do you prevent it?
2. What are Cryptographic Failures and how do you mitigate them?
3. What is Injection and how do you defend against it?
4. What is Insecure Design and how does it differ from implementation bugs?
5. What is Security Misconfiguration and what are common examples?
6. What are Vulnerable and Outdated Components and how do you manage them?
7. What are Identification and Authentication Failures?
8. What are Software and Data Integrity Failures?
9. What are Security Logging and Monitoring Failures?
10. What is Server-Side Request Forgery (SSRF) and how do you prevent it?

## What is Broken Access Control and how do you prevent it?

**Broken Access Control** (OWASP #1) occurs when users can act outside their intended permissions — accessing another user's data, performing admin actions as a regular user, or bypassing authorization by manipulating URLs, API parameters, or JWT claims.

### Common examples

| Attack | Example |
|--------|---------|
| **IDOR** | `GET /api/invoices/1001` returns another customer's invoice when IDs are sequential |
| **Forced browsing** | `GET /admin/users` works without role check because UI hides the link |
| **Privilege escalation** | `PUT /api/users/me` with `"role": "admin"` in JSON body |
| **CORS misconfig** | `Access-Control-Allow-Origin: *` with credentials on sensitive API |
| **Missing function-level auth** | DELETE allowed because only GET was tested |

### Mitigations

- **Deny by default** — every route and action requires explicit authorization.
- **Server-side checks** — never rely on hidden UI, client-side flags, or obscurity.
- **Use indirect references** — UUIDs plus ownership validation, not guessable IDs alone.
- **Centralize policy** — RBAC/ABAC in one layer; avoid scattered `if (isAdmin)` copies.
- **Test horizontally and vertically** — user A cannot access user B's data; viewer cannot admin.

```csharp
// BAD: authentication only — no authorization
[Authorize]
[HttpGet("orders/{orderId}")]
public async Task<Order> GetOrder(int orderId) =>
    await _db.Orders.FindAsync(orderId);

// GOOD: verify resource belongs to caller's tenant
[Authorize]
[HttpGet("orders/{orderId}")]
public async Task<ActionResult<Order>> GetOrder(Guid orderId)
{
    var order = await _db.Orders.FindAsync(orderId);
    if (order is null) return NotFound();

    var tenantId = User.FindFirstValue("tenant_id");
    if (order.TenantId.ToString() != tenantId)
        return Forbid();

    return order;
}
```

```javascript
// API gateway or middleware pattern — consistent deny-by-default
function requirePermission(permission) {
  return (req, res, next) => {
    const grants = req.user?.permissions ?? [];
    if (!grants.includes(permission)) {
      audit.log('AUTHZ_DENIED', { user: req.user?.id, permission, path: req.path });
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/api/posts/:id', requirePermission('posts:delete'), deletePost);
```

Interview emphasis: **authentication proves who you are; authorization proves what you may do.** Most breaches involve missing or inconsistent authorization on APIs.

## What are Cryptographic Failures and how do you mitigate them?

**Cryptographic Failures** (formerly "Sensitive Data Exposure") happen when sensitive data is not adequately protected in transit, at rest, or in use — weak algorithms, missing encryption, poor key management, or transmitting secrets in cleartext.

### Common failures

| Failure | Risk |
|---------|------|
| HTTP instead of HTTPS | Credentials and tokens sniffed on network |
| Weak hashing (MD5, SHA1 for passwords) | Offline cracking after DB leak |
| Hardcoded keys in source | Keys in Git history forever |
| ECB mode encryption | Patterns leak in ciphertext |
| Logging secrets | API keys in Splunk indexes |
| Deprecated TLS (1.0/1.1) | Protocol downgrade attacks |

### Mitigations

| Data state | Practice |
|------------|----------|
| **In transit** | TLS 1.2+; HSTS; certificate pinning for mobile if appropriate |
| **At rest** | AES-256; envelope encryption; cloud KMS (AWS KMS, Azure Key Vault) |
| **Passwords** | Argon2id, bcrypt, or scrypt with per-user salt — never reversible encryption |
| **Tokens** | Short-lived access tokens; refresh token rotation; HttpOnly cookies |
| **Key management** | Keys in HSM/KMS; rotation; separate dev/prod keys |

```csharp
// Password storage — use framework APIs, not custom crypto
using Microsoft.AspNetCore.Identity;

var hasher = new PasswordHasher<User>();
string hash = hasher.HashPassword(user, plainTextPassword);
// Verify later:
var result = hasher.VerifyHashedPassword(user, hash, plainTextPassword);

// Symmetric encryption — use AES-GCM via modern APIs
using var aes = new AesGcm(keyBytes, tagSizeInBytes: 16);
// Never: RijndaelManaged in ECB mode, custom IV handling, MD5 for passwords
```

```bash
# Verify TLS configuration in interviews / ops
openssl s_client -connect api.example.com:443 -tls1_2 </dev/null 2>/dev/null | openssl x509 -noout -dates

# Rotate keys without downtime: dual-key period, re-encrypt data, retire old key
```

**Rule of thumb**: do not invent crypto. Use vetted libraries and platform defaults. Classify data and encrypt what matters; hashing is for verifying, not retrieving.

## What is Injection and how do you defend against it?

**Injection** occurs when untrusted data is sent to an interpreter as part of a command, query, or template — SQL, NoSQL, OS commands, LDAP, XPath, or template engines. The attacker's input changes the intended logic.

### Examples

| Type | Payload sketch | Impact |
|------|----------------|--------|
| **SQLi** | `' OR '1'='1' --` | Bypass login, dump tables |
| **NoSQLi** | `{"$gt": ""}` in JSON filter | Auth bypass in MongoDB queries |
| **Command injection** | `; cat /etc/passwd` in filename passed to shell | RCE on server |
| **LDAP injection** | `*)(uid=*))(|(uid=*` | Directory enumeration |
| **XSS** (output injection) | `<script>steal(document.cookie)</script>` | Session hijack |

### Defenses (layered)

1. **Parameterized queries / prepared statements** — primary defense for SQL.
2. **ORM with bound parameters** — still validate; avoid raw SQL concatenation.
3. **Input validation** — allowlists for enums, formats, lengths.
4. **Output encoding** — context-specific (HTML, JS, URL) for XSS.
5. **Least privilege DB accounts** — limit blast radius of successful injection.
6. **Never pass user input to `exec`, `eval`, `shell_exec`**.

```csharp
// BAD: string concatenation
var sql = $"SELECT * FROM Users WHERE Email = '{email}'";

// GOOD: parameterized query
await using var cmd = new SqlCommand(
    "SELECT Id, Email FROM Users WHERE Email = @email", connection);
cmd.Parameters.AddWithValue("@email", email);
```

```javascript
// NoSQL — validate types; don't pass raw user objects into query operators
const email = String(req.body.email);
const user = await db.collection('users').findOne({ email }); // literal match

// BAD: merge req.body into filter
// await db.collection('users').findOne(req.body);
```

```html
<!-- XSS defense: encode on output; CSP as belt-and-suspenders -->
<p>Comment: <!-- use server-side HTML encoding, not raw echo -->
  &lt;script&gt;alert(1)&lt;/script&gt;
</p>
<!-- React/Angular default escaping helps; dangerouslySetInnerHTML / bypasses are risky -->
```

OWASP places injection high because automated tools find it easily and impact ranges from data theft to full server compromise.

## What is Insecure Design and how does it differ from implementation bugs?

**Insecure Design** is a flaw in the **architecture or business logic** — missing threat modeling, unsafe workflows, or absent security requirements — not a simple coding mistake like one missing `if` statement.

| Insecure design | Implementation bug |
|-----------------|-------------------|
| Password reset link never expires | Off-by-one in password length check |
| No rate limit on coupon redemption | SQL injection in one endpoint |
| "Security questions" as sole recovery | Forgot to escape one field |
| Trusting client-submitted prices | Hardcoded API key in repo |

### Examples

- **Business logic abuse**: apply discount codes infinitely; transfer negative amounts; race on limited inventory.
- **Missing abuse cases**: unlimited account creation for referral fraud; no CAPTCHA on high-value actions.
- **Trust boundary errors**: microservice trusts internal network without auth between services.
- **Workflow flaws**: email change without re-verification locks out legitimate user.

### Mitigations

- Threat modeling and abuse-case workshops **before** build.
- Rate limiting, fraud detection, and server-side price calculation.
- Secure design patterns: step-up MFA for sensitive changes, out-of-band verification for password reset.
- Reference architectures and reusable secure modules (authz library, payment adapter).

```javascript
// Insecure design: trust client price
async function checkout(req, res) {
  const { items, total } = req.body; // attacker sends total: 0.01
  await charge(req.user, total);
}

// Secure design: compute authoritative total server-side
async function checkout(req, res) {
  const items = await validateCartItems(req.user, req.body.itemIds);
  const total = pricingService.computeTotal(items, req.user.promotions);
  await charge(req.user, total);
  await audit.log('CHECKOUT', { userId: req.user.id, total, itemIds: items.map(i => i.id) });
}
```

Fixing insecure design often requires **redesign**, not a patch — interviews reward candidates who catch bad flows early.

## What is Security Misconfiguration and what are common examples?

**Security Misconfiguration** covers unsafe defaults, incomplete hardening, open cloud storage, verbose errors, unnecessary features enabled, and missing security headers — often across the stack.

### Common misconfigurations

| Area | Example |
|------|---------|
| **Cloud** | Public S3 bucket; overly permissive security group `0.0.0.0/0` |
| **Server** | Default admin credentials; directory listing enabled |
| **Application** | Debug mode in production; stack traces to users |
| **Framework** | Unused modules installed (example apps, admin consoles) |
| **Headers** | Missing `Content-Security-Policy`, `X-Frame-Options` |
| **CORS** | Reflecting arbitrary `Origin` with credentials |
| **Permissions** | Container running as root; file upload to web root |

### Mitigations

- **Hardening baselines** — CIS benchmarks, infrastructure-as-code with policy checks.
- **Automated scanning** — CSPM (Prowler, ScoutSuite), container image scans.
- **Remove defaults** — change default passwords; disable unused endpoints and ports.
- **Separate environments** — prod ≠ staging configs; no test backdoors in prod.
- **Security headers** and minimal error responses.

```yaml
# Kubernetes — avoid running as root, drop capabilities
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
```

```csharp
// ASP.NET — security headers middleware (production)
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; frame-ancestors 'none'; base-uri 'self'";
    await next();
});
```

```bash
# Quick cloud misconfig check (conceptual interview answer)
# - Block public access on object storage
# - Restrict security groups to required ports/sources
# - Enable audit logging (CloudTrail, Azure Activity Log)
# - Review IAM: no long-lived access keys on human users
```

Repeatable, automated deployment reduces drift — manual "snowflake" servers accumulate misconfigurations over time.

## What are Vulnerable and Outdated Components and how do you manage them?

**Vulnerable and Outdated Components** means running libraries, frameworks, OS packages, or container base images with known CVEs — or unsupported versions that no longer receive patches.

### Why it matters

Log4Shell (Log4j), Spring4Shell, and Equifax (unpatched Apache Struts) show that **one dependency** can compromise entire organizations. Transitive dependencies multiply exposure.

### Management practices

| Practice | Detail |
|----------|--------|
| **Inventory (SBOM)** | Know every direct and transitive dependency |
| **Scanning** | `npm audit`, Dependabot, Snyk, OWASP Dependency-Check in CI |
| **Patch cadence** | Critical CVEs within days; regular minor updates |
| **Pin and verify** | Lockfiles; verify package integrity (npm sigstore, checksums) |
| **Minimize dependencies** | Fewer packages = smaller attack surface |
| **Supported versions** | EOL Node, .NET, Spring — upgrade before vendor stops patches |

```bash
# CI dependency checks — fail build on critical CVEs (example)
npm ci
npm audit --audit-level=critical

# Container: scan image before deploy
trivy image myapp:1.2.3 --severity HIGH,CRITICAL --exit-code 1

# SBOM generation (supply chain interviews)
syft packages dir:. -o spdx-json > sbom.spdx.json
```

```xml
<!-- .NET — central package management + explicit versions -->
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
<!-- Avoid floating versions in production builds -->
```

When a CVE hits: **assess exploitability** in your context (is the vulnerable code path reachable?), patch or mitigate (WAF rule temporarily), communicate status, and post-incident improve scanning SLAs.

## What are Identification and Authentication Failures?

**Identification and Authentication Failures** (formerly "Broken Authentication") cover weak credential handling, session management flaws, and missing MFA — allowing attackers to compromise passwords, hijack sessions, or brute-force accounts.

### Common failures

| Failure | Example |
|---------|---------|
| Weak password policy | No breach password check; short passwords allowed |
| Credential stuffing | No rate limit; no MFA |
| Session fixation | Session ID not rotated after login |
| Predictable tokens | `sessionId = userId + timestamp` |
| Long-lived sessions | JWT valid 30 days with no revocation |
| Insecure password recovery | Reset token in URL logged by analytics |
| Missing MFA on admin | Single factor for privileged accounts |

### Mitigations

- **MFA** for users and especially admins; WebAuthn/passkeys where possible.
- **Rate limiting** and lockout (with care to avoid denial-of-service to legitimate users).
- **Secure session cookies**: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`.
- **Rotate session ID** on login; invalidate on logout and password change.
- **Short-lived access tokens** + refresh rotation; server-side session revocation list for sensitive apps.
- **OAuth/OIDC** from trusted IdP instead of custom auth when appropriate.

```csharp
// Cookie auth — secure defaults (ASP.NET Core)
services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});
```

```javascript
// Login — constant-time comparison, generic error messages, rate limit
const MAX_ATTEMPTS = 5;

async function login(req, res) {
  const { email, password } = req.body;
  if (await rateLimiter.isBlocked(req.ip, email)) {
    return res.status(429).json({ error: 'Too many attempts' });
  }

  const user = await findUserByEmail(email);
  const hash = user?.passwordHash ?? DUMMY_HASH; // prevent user enumeration via timing
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    await rateLimiter.recordFailure(req.ip, email);
    return res.status(401).json({ error: 'Invalid credentials' }); // same message always
  }

  await rateLimiter.reset(req.ip, email);
  const session = await sessions.create(user.id);
  setSecureSessionCookie(res, session.id);
  return res.json({ ok: true });
}
```

Never roll your own crypto for passwords or sessions — use framework and IdP standards.

## What are Software and Data Integrity Failures?

**Software and Data Integrity Failures** address trust without verification — unsigned updates, compromised CI/CD, insecure deserialization, and tampered data or packages from untrusted sources.

### Examples

| Scenario | Risk |
|----------|------|
| Unsigned auto-updates | Malicious update pushed to all clients |
| Compromised CI secret | Pipeline publishes backdoored artifact |
| `npm install` from compromised package | Supply-chain malware |
| Insecure deserialization | .NET `BinaryFormatter`, Java serialized objects → RCE |
| Webhook without signature | Attacker fakes payment confirmation |

### Mitigations

- **Sign artifacts** — code signing, Sigstore, signed container images; verify before run.
- **Lock down CI/CD** — OIDC to cloud, least privilege, protected branches, required reviews.
- **Dependency provenance** — pin versions, verify checksums, private registry mirroring.
- **Avoid unsafe deserialization** — JSON with schema validation; never deserialize untrusted binary blobs.
- **Verify webhooks** — HMAC signature (Stripe, GitHub) with constant-time compare.

```yaml
# GitHub Actions — pin actions by commit SHA, not @main
- uses: actions/checkout@b4ffde65f46336ab88eb53be7084776ef67df154 # v4.1.1

# Use OIDC instead of long-lived cloud keys in CI
permissions:
  id-token: write
  contents: read
```

```csharp
// Verify webhook signature (conceptual)
public bool VerifyStripeSignature(string payload, string signatureHeader, string secret)
{
    var elements = ParseStripeHeader(signatureHeader);
    var signedPayload = $"{elements.Timestamp}.{payload}";
    var expected = HmacSha256(secret, signedPayload);
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected),
        Encoding.UTF8.GetBytes(elements.Signature));
}
```

```javascript
// Safe JSON parsing — schema validate; no eval
const schema = z.object({ orderId: z.string().uuid(), amount: z.number().positive() });
const data = schema.parse(JSON.parse(req.body));
```

Supply-chain security is a major interview theme: SBOM, signed builds, and least-privilege pipelines.

## What are Security Logging and Monitoring Failures?

**Security Logging and Monitoring Failures** mean insufficient visibility — attacks succeed without detection, incidents lack forensic data, or alerts are noisy and ignored.

### What to log (security-relevant)

| Event | Why |
|-------|-----|
| Auth success/failure | Brute force, credential stuffing |
| Authz denials | Reconnaissance, IDOR attempts |
| Admin actions | Insider threat, privilege abuse |
| Input validation failures | Injection probes |
| Password/profile changes | Account takeover |
| API rate limit hits | Abuse, DDoS |

### What NOT to log

Passwords, full credit card numbers, session tokens, secrets, excessive PII without retention policy.

### Best practices

- **Centralize** logs (SIEM: Splunk, Elastic, Sentinel).
- **Correlate** — user + IP + device + resource + outcome.
- **Alert on high-signal events** — not every 404.
- **Tamper-resistant storage** — append-only, restricted access, retention for compliance.
- **Runbooks** — who responds at 3 AM; MTTD/MTTR metrics.
- **Test detection** — purple team exercises validate rules fire.

```csharp
_logger.LogWarning(
    "AUTHZ_DENIED UserId={UserId} TenantId={TenantId} Resource={Resource} Action={Action} ClientIp={Ip}",
    userId, tenantId, resourceId, "DELETE", clientIp);

// Structured logging enables SIEM queries: count AUTHZ_DENIED by IP in 5m window
```

```bash
# Example detection rule (conceptual — Sigma-style thinking for interviews)
# Title: Multiple auth failures followed by success from same IP
# Condition: >=10 LoginFailed in 5m AND LoginSuccess within 10m same src_ip
# Action: alert SOC, temporary step-up MFA for affected accounts
```

Without logging, you cannot prove compliance, investigate breaches, or measure improvement. **Detection does not replace prevention** — but prevention without detection prolongs dwell time.

## What is Server-Side Request Forgery (SSRF) and how do you prevent it?

**SSRF** forces the **server** to make HTTP (or other protocol) requests to attacker-chosen destinations — often internal services, cloud metadata endpoints, or localhost admin panels not reachable from the internet.

### Attack scenarios

| Vector | Target |
|--------|--------|
| URL fetch feature | `http://169.254.169.254/latest/meta-data/` (AWS IMDS credentials) |
| PDF/image renderer fetching remote URL | `http://localhost:6379/` (Redis) |
| Webhook tester | Internal admin `http://10.0.0.5:8080/actuator/env` |
| Import-from-URL | File schemes, `gopher://`, internal DNS rebinding |

### Impact

Cloud credential theft, internal network scanning, bypass of firewall rules (server is trusted inside VPC), RCE via hitting unpatched internal services.

### Mitigations

| Control | Detail |
|---------|--------|
| **Allowlist destinations** | Only approved domains if user-supplied URLs are required |
| **Block private ranges** | RFC1918, link-local, metadata IPs, localhost |
| **Disable redirects** or re-validate URL after redirect |
| **Network segmentation** | App servers cannot reach admin networks or metadata |
| **IMDSv2** | Require session-oriented metadata requests on AWS |
| **No raw sockets from user input** | Sanitize URL scheme (`http`/`https` only) |
| **DNS rebinding protection** | Resolve hostname and verify IP before connect |

```javascript
const ipaddr = require('ipaddr.js');
const { URL } = require('url');

const BLOCKED = [
  '127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
  '169.254.0.0/16', '::1/128', 'fc00::/7'
];

function isBlockedIp(ip) {
  const addr = ipaddr.parse(ip);
  return BLOCKED.some(range => addr.match(ipaddr.parseCIDR(range)));
}

async function safeFetch(userUrl) {
  const url = new URL(userUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid scheme');

  const { address } = await dns.lookup(url.hostname); // resolve first
  if (isBlockedIp(address)) throw new Error('Blocked destination');

  return fetch(url.toString(), { redirect: 'manual', timeout: 5000 });
}
```

```csharp
// Prefer: don't accept arbitrary URLs; use internal service registry instead
// If URL import required: HttpClient with restricted handler, no auto-redirect,
// validate resolved IP against blocklist before sending request
```

SSRF moved into OWASP Top 10 because cloud metadata and microservice interiors created high-impact targets behind a seemingly innocent "fetch URL" feature.

## Related Topics

- [Security Basics](Security%20Basics.md) — CIA triad, STRIDE, zero trust, interview framing
- React [Error Handling and Security](../React/React%20Error%20Handling%20and%20Security.md) — XSS, CSRF, tokens in SPAs
