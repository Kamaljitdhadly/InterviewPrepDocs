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

**Broken Access Control** (#1) — users act outside intended permissions: IDOR, forced browsing, privilege escalation via API params, missing function-level auth.

| Attack | Example |
|--------|---------|
| **IDOR** | `GET /api/invoices/1001` returns another customer's data |
| **Forced browsing** | `/admin/users` works though UI hides link |
| **Privilege escalation** | `PUT /api/users/me` with `"role": "admin"` |
| **CORS** | `Allow-Origin: *` with credentials |

**Mitigations:** deny by default; server-side checks every request; indirect references + ownership validation; centralized RBAC/ABAC; test horizontal and vertical access.

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

**AuthN** proves who you are; **AuthZ** proves what you may do.

## What are Cryptographic Failures and how do you mitigate them?

Sensitive data inadequately protected — weak algorithms, missing encryption, poor key management, cleartext transmission.

| Failure | Risk |
|---------|------|
| HTTP not HTTPS | Sniffed credentials |
| MD5/SHA1 passwords | Offline cracking |
| Hardcoded keys | Keys in Git forever |
| Logging secrets | Keys in SIEM |

| State | Practice |
|-------|----------|
| **Transit** | TLS 1.2+, HSTS |
| **Rest** | AES-256, KMS |
| **Passwords** | Argon2id/bcrypt/scrypt + salt |
| **Keys** | HSM/KMS, rotation, separate dev/prod |

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

Don't invent crypto — use vetted libraries.

## What is Injection and how do you defend against it?

Untrusted data sent to an interpreter changes intended logic — SQL, NoSQL, OS commands, LDAP, XSS.

| Type | Impact |
|------|--------|
| **SQLi** | Bypass login, dump tables |
| **NoSQLi** | Auth bypass |
| **Command injection** | RCE |
| **XSS** | Session hijack |

**Defenses:** parameterized queries; ORM with bound params; allowlist validation; output encoding; least-privilege DB accounts; never `exec` user input.

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

## What is Insecure Design and how does it differ from implementation bugs?

Flaw in **architecture or business logic** — not a one-off coding mistake.

| Insecure design | Implementation bug |
|-----------------|-------------------|
| Reset link never expires | Off-by-one in length check |
| No rate limit on coupons | SQLi in one endpoint |
| Trust client-submitted prices | Hardcoded API key |

**Mitigations:** threat modeling before build; server-side price calculation; rate limits; step-up MFA; secure reusable modules.

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

Often requires **redesign**, not a patch.

## What is Security Misconfiguration and what are common examples?

Unsafe defaults, incomplete hardening, public cloud storage, verbose errors, unnecessary features, missing headers.

| Area | Example |
|------|---------|
| **Cloud** | Public S3; `0.0.0.0/0` security group |
| **App** | Debug in prod; stack traces to users |
| **Headers** | Missing CSP, X-Frame-Options |
| **Container** | Running as root |

**Mitigations:** CIS baselines; CSPM scans; remove defaults; separate prod/staging; security headers.

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

Automate deployment to reduce config drift.

## What are Vulnerable and Outdated Components and how do you manage them?

Libraries, frameworks, OS packages, or images with known CVEs or unsupported versions.

| Practice | Detail |
|----------|--------|
| **SBOM** | Inventory direct + transitive deps |
| **Scanning** | npm audit, Dependabot, Snyk in CI |
| **Patch cadence** | Critical CVEs within days |
| **Pin** | Lockfiles; verify integrity |
| **Minimize** | Fewer packages = smaller surface |

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

Assess exploitability in your context; patch or mitigate; improve SLAs post-incident.

## What are Identification and Authentication Failures?

Weak credentials, session flaws, missing MFA — password compromise, session hijack, brute force.

| Failure | Example |
|---------|---------|
| No MFA | Credential stuffing succeeds |
| Session fixation | ID not rotated after login |
| Long-lived JWT | No revocation path |
| Weak recovery | Reset token in analytics logs |

**Mitigations:** MFA (especially admin); rate limiting; `HttpOnly`/`Secure`/`SameSite` cookies; rotate session on login; short-lived tokens + refresh rotation; OIDC from trusted IdP.

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

## What are Software and Data Integrity Failures?

Trust without verification — unsigned updates, compromised CI/CD, insecure deserialization, tampered packages.

| Scenario | Risk |
|----------|------|
| Unsigned updates | Malicious push to all clients |
| Compromised CI | Backdoored artifact |
| Unsafe deserialization | RCE |
| Webhook without signature | Fake payment confirmation |

**Mitigations:** sign artifacts (Sigstore); lock CI with OIDC + least privilege; pin deps; JSON + schema validation; verify webhook HMAC.

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

## What are Security Logging and Monitoring Failures?

Insufficient visibility — attacks undetected, poor forensics, noisy ignored alerts.

| Log | Why |
|-----|-----|
| Auth success/failure | Brute force |
| Authz denials | IDOR probes |
| Admin actions | Insider threat |
| Validation failures | Injection probes |

**Don't log:** passwords, tokens, secrets, full PANs.

**Best practices:** centralize (SIEM); structured correlation; high-signal alerts; tamper-resistant storage; runbooks; purple-team validation.

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

Detection doesn't replace prevention — but prevention without detection prolongs dwell time.

## What is Server-Side Request Forgery (SSRF) and how do you prevent it?

Server forced to request attacker-chosen destinations — internal services, cloud metadata (`169.254.169.254`), localhost admin.

| Vector | Target |
|--------|--------|
| URL fetch | AWS IMDS credentials |
| PDF renderer | `localhost:6379` Redis |
| Webhook tester | Internal admin actuator |

**Impact:** credential theft, internal scanning, RCE via internal services.

| Control | Detail |
|---------|--------|
| **Allowlist** | Approved domains only |
| **Block private IPs** | RFC1918, link-local, metadata |
| **No redirects** or re-validate after redirect |
| **Segmentation** | App can't reach admin/metadata |
| **IMDSv2** | Session-oriented metadata |

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

## Related Topics

- [Security Basics](Security%20Basics.md) — CIA triad, STRIDE, zero trust, interview framing
- React [Error Handling and Security](../React/React%20Error%20Handling%20and%20Security.md) — XSS, CSRF, tokens in SPAs
