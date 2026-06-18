# Security Basics

## Questions Covered

1. What is the CIA triad and how do you apply it in software design?
2. What is the difference between a threat, vulnerability, and risk?
3. What is defense in depth and why does it matter?
4. What is the principle of least privilege?
5. What does "fail secure" mean in application design?
6. What is security by design and how does it differ from bolt-on security?
7. What is STRIDE threat modeling and how do you use it?
8. What is attack surface and how do you reduce it?
9. What are zero trust principles and how do they apply to modern apps?
10. What is the difference between security and privacy?
11. What are common security roles (CISO, AppSec) and what do they own?
12. How should you answer security questions in technical interviews?

## What is the CIA triad and how do you apply it in software design?

The **CIA triad** is the foundational security model — every control maps to **Confidentiality**, **Integrity**, or **Availability**.

| Pillar | Definition | Software examples |
|--------|------------|-------------------|
| **Confidentiality** | Data accessible only to authorized parties | Encryption, RBAC, PII masking in logs |
| **Integrity** | Data accurate and unaltered by unauthorized parties | Checksums, signed tokens, audit trails, validation |
| **Availability** | Systems accessible when needed | HA, DDoS mitigation, rate limits, backups |

**Apply in design:** classify data; encrypt sensitive fields; TLS everywhere; validate server-side; use signed JWTs; circuit breakers and health checks for availability.

```csharp
// Example: enforcing confidentiality + integrity on an API response
public class PatientRecordDto
{
    public Guid Id { get; init; }
    public string Name { get; init; }           // returned only if caller has ReadPatient role
    public string SsnMasked { get; init; }      // confidentiality: last 4 only
    public string RecordHash { get; init; }     // integrity: detect tampering in downstream sync
}

[Authorize(Roles = "Clinician")]
[HttpGet("{id}")]
public async Task<ActionResult<PatientRecordDto>> Get(Guid id)
{
    var record = await _repo.GetAsync(id);
    if (record is null) return NotFound();
    return Ok(_mapper.ToDto(record, User));   // mapper applies field-level access rules
}
```

**Trade-offs:** strong encryption can hurt availability if key management fails; rate limiting improves availability against abuse but may block legit users. Context matters — banking prioritizes integrity/confidentiality; public blogs prioritize availability.

## What is the difference between a threat, vulnerability, and risk?

| Term | Definition | Example |
|------|------------|---------|
| **Threat** | Potential cause of harm | Ransomware group, malicious insider |
| **Vulnerability** | Exploitable weakness | SQL injection, default password, unpatched Log4j |
| **Risk** | Likelihood × impact of threat exploiting vulnerability | Public admin API with no auth |

**Formula:** `Risk = Threat × Vulnerability × Impact` (or Likelihood × Impact after controls).

```bash
# Threat modeling shorthand in a ticket
# Threat:     External attacker brute-forces login
# Vuln:       No account lockout, weak password policy
# Risk:       HIGH — credential stuffing could compromise customer accounts
# Control:    MFA, rate limiting, breached-password denylist
```

Threats exist without current vulns; vulns exist without active threats. **Risk** is what you prioritize.

## What is defense in depth and why does it matter?

**Defense in depth** assumes any single control can fail. Multiple independent layers slow attackers, limit blast radius, and enable detection.

| Layer | Controls |
|-------|----------|
| **Perimeter** | WAF, DDoS protection |
| **Network** | Segmentation, firewalls |
| **Identity** | MFA, least privilege IAM |
| **Application** | Validation, parameterized queries, CSRF tokens |
| **Data** | Encryption, backups |
| **Monitoring** | SIEM, alerting |

```javascript
// Defense in depth at the app layer — even if auth middleware fails,
// resource-level check is a second gate
async function getInvoice(req, res) {
  const session = req.user; // layer 1: authenticated session
  if (!session) return res.status(401).end();

  const invoice = await db.invoices.findById(req.params.id);
  if (!invoice) return res.status(404).end();

  // layer 2: authorization — never trust ID alone
  if (invoice.tenantId !== session.tenantId) {
    await audit.log('ACCESS_DENIED', { user: session.id, invoiceId: invoice.id });
    return res.status(403).end();
  }

  return res.json(invoice);
}
```

## What is the principle of least privilege?

Every user, service account, and process gets **only** the minimum permissions needed — for the shortest duration necessary.

| Scope | Bad | Better |
|-------|-----|--------|
| **Humans** | All engineers have prod admin | JIT elevation with approval |
| **Services** | App uses DB owner | Role limited to one schema |
| **Tokens** | PAT with broad scopes | Fine-scoped, read-only if possible |
| **Cloud IAM** | `*` on `*` | Scoped ARNs and actions |

```csharp
// ASP.NET — policy-based least privilege
services.AddAuthorization(options =>
{
    options.AddPolicy("InvoicesRead", policy =>
        policy.RequireRole("BillingViewer")
              .RequireClaim("tenant_id")); // tenant-scoped, not global admin
});

[Authorize(Policy = "InvoicesRead")]
[HttpGet]
public Task<IActionResult> List() => ...
```

Extend with **JIT access** and time-bound credentials.

## What does "fail secure" mean in application design?

On error or when authorization cannot be verified, default to the **safer** state — typically **deny access** (not fail open).

| Scenario | Fail open (bad) | Fail secure (good) |
|----------|-----------------|---------------------|
| Auth timeout | Allow request | 401/503; deny until verified |
| Firewall parse error | Permit all | Block traffic |
| Session store down | Trust client cookie | Invalidate; require re-login |

```csharp
public async Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission)
{
    try
    {
        return await _policyEngine.EvaluateAsync(user, permission);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Policy evaluation failed for {Permission}", permission);
        return false; // fail secure: deny on error
    }
}
```

Deny access but **log** failures so operators can fix root cause.

## What is security by design and how does it differ from bolt-on security?

**Security by design** embeds requirements from first architecture sketch — threat modeling, secure defaults, abuse cases are part of "done."

**Bolt-on** adds controls after build: pen-test patches, WAF compensating for missing validation, secrets moved to vault post-incident.

| Aspect | By design | Bolt-on |
|--------|-----------|---------|
| **When** | Requirements, design | Pre-launch or post-incident |
| **Cost** | Lower long-term | Higher; retrofit expensive |
| **Example** | RBAC in domain layer | Hidden admin URL |

```yaml
# CI pipeline — security gates by design, not after release
stages:
  - test
  - security
  - deploy

security:
  script:
    - npm audit --audit-level=high
    - semgrep --config=auto src/
    - gitleaks detect --source .
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## What is STRIDE threat modeling and how do you use it?

**STRIDE** — six threat categories for systematic design review:

| Letter | Threat | Question |
|--------|--------|----------|
| **S** | Spoofing | Can attacker impersonate someone? |
| **T** | Tampering | Can data be modified? |
| **R** | Repudiation | Can actions be denied without proof? |
| **I** | Information disclosure | Can unauthorized parties read data? |
| **D** | Denial of service | Can availability be disrupted? |
| **E** | Elevation of privilege | Can permissions be escalated? |

**Steps:** diagram system → per element walk STRIDE → rate and prioritize → track mitigations.

```text
Data flow: Browser --HTTPS--> API Gateway --mTLS--> Order Service --> PostgreSQL

Trust boundary: Internet → DMZ (gateway)
  S: stolen session cookie → mitigate: HttpOnly, Secure, SameSite, short TTL
  T: JWT alg=none attack → mitigate: validate alg, use library defaults
  I: verbose error leaks stack → mitigate: generic 500 to client, log server-side
  D: checkout flood → mitigate: rate limit, CAPTCHA on abuse
  E: IDOR on /orders/{id} → mitigate: server-side ownership check every request
```

Pair with **DREAD** for prioritization if asked.

## What is attack surface and how do you reduce it?

**Attack surface** = all entry points where attackers send data, trigger behavior, or extract info — APIs, ports, admin panels, uploads, integrations, debug endpoints.

| Strategy | Example |
|----------|---------|
| **Remove** | Delete unused endpoints, default accounts |
| **Reduce exposure** | Admin APIs on private network only |
| **Harden** | MFA, WAF, validation |
| **Monitor** | Alert on admin access, CVEs |
| **Segment** | Limit lateral movement |

```bash
# Attack surface inventory (interview talking point)
# Exposed:  api.example.com (443) — REST + GraphQL
#           auth.example.com (443) — OIDC
# Internal: admin-api.internal (VPN only)
# Removed:   /debug/pprof, PHPInfo, staging S3 bucket listing

# Reduce: disable GraphQL introspection in production
# Harden: require mTLS for service-to-service calls
```

Every endpoint must be maintained, authenticated, authorized, tested, and monitored.

## What are zero trust principles and how do they apply to modern apps?

**Zero trust** — never trust network location alone; verify every access request explicitly.

| Principle | Meaning |
|-----------|---------|
| **Verify explicitly** | AuthN + AuthZ every request |
| **Assume breach** | Segment and monitor as if attackers are inside |
| **Least privilege** | Limit by identity, device, context |
| **Continuous validation** | Step-up MFA for sensitive actions |

```javascript
// Zero trust at the app layer — don't trust network location alone
async function authorizeRequest(req) {
  const token = await verifyJwt(req.headers.authorization); // identity
  const device = await checkDevicePosture(req.headers['x-device-id']); // device health
  const risk = scoreRisk({ ip: req.ip, geo: req.geo, hour: req.hour, resource: req.path });

  if (!token.valid) return deny('invalid_token');
  if (device.compromised) return deny('device_failing_posture');
  if (risk > THRESHOLD && isSensitive(req.path)) {
    return stepUpMfa(req); // continuous verification for high-risk ops
  }
  return allow(token.sub, token.scopes);
}
```

Modern apps: mTLS between services, service mesh, conditional access, workload identity — no long-lived implicit trust.

## What is the difference between security and privacy?

| Dimension | Security | Privacy |
|-----------|----------|---------|
| **Focus** | Assets and threats | People and their data |
| **Goal** | Prevent breaches | Lawful, minimal processing |
| **Frameworks** | ISO 27001, NIST CSF | GDPR, CCPA, HIPAA |
| **Example** | Encrypt database | Collect only needed fields; honor deletion |

Secure but not private: encrypted vault + selling behavior without consent. Private but weak security: minimal collection stored in plaintext.

```html
<!-- Privacy by design in UI — security still required on the backend -->
<form action="/api/register" method="post">
  <label>Email (required for account)</label>
  <input name="email" type="email" required autocomplete="email" />

  <label>Marketing emails (optional — explicit consent)</label>
  <input name="marketing_opt_in" type="checkbox" value="true" />

  <p>We retain account data until deletion. See <a href="/privacy">Privacy Policy</a>.</p>
  <button type="submit">Create account</button>
</form>
```

Security: "Can attackers get in?" Privacy: "Should we have this data, and do users know?"

## What are common security roles (CISO, AppSec) and what do they own?

| Role | Ownership |
|------|-----------|
| **CISO** | Enterprise strategy, risk appetite, compliance, board reporting |
| **AppSec** | Secure SDLC, threat modeling, SAST/DAST, security requirements |
| **SecOps / SOC** | Monitoring, incident response, SIEM |
| **GRC** | Policies, audits (SOC 2, ISO) |
| **IAM** | SSO, MFA, provisioning |
| **Cloud Security** | CSPM, cloud IAM, segmentation |
| **Red Team** | Adversarial testing |
| **Security Engineer** | Security tooling, WAF, secrets platforms |

**Developers** own secure implementation; AppSec enables and verifies.

```text
Sprint example:
  PM:     user story + acceptance criteria
  Dev:    implements feature + unit tests
  AppSec: threat model for new payment flow; reviews PR for IDOR
  SecOps: adds detection rule for unusual refund volume
  CISO:   accepts residual risk if fix is deferred (documented exception)
```

## How should you answer security questions in technical interviews?

**Structure:** (1) clarify scope, (2) identify assets, (3) name threats/vulns (STRIDE/OWASP), (4) propose controls (prevent/detect/correct), (5) acknowledge trade-offs, (6) mention verification.

**XSS example skeleton:** asset = sessions; threat = injected script; prevent = encoding + CSP; detect = CSP violation logs; verify = security tests.

```javascript
// Show you can write secure code, not only theory
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Prefer: textContent / React's default escaping
// CSP header: Content-Security-Policy: default-src 'self'; script-src 'self'
```

| Mistake | Better |
|---------|--------|
| "HTTPS = secure" | Authz, validation, logging too |
| Only naming tools | Explain problem solved |
| "Security team handles it" | Show developer ownership |
| Ignoring abuse cases | Rate limits, fraud, insider |

**Depth:** Junior = definitions + OWASP names; Mid = threat modeling + CI scanning; Senior = trade-offs, zero trust, MTTD/MTTR, org change.

Close with how you stay current: OWASP, CVE feeds, postmortems.

---

## Related Topics

- **OWASP Top 10** (`Security/`)
- **Authentication and Identity** (`Security/`)
- **OWASP** (`Important Concepts/`)
