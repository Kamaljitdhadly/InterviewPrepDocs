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

The **CIA triad** is the foundational model for information security. Every control, threat, and design decision maps to one or more of its three pillars:

| Pillar | Definition | Software examples |
|--------|------------|-------------------|
| **Confidentiality** | Data is accessible only to authorized parties | Encryption at rest/transit, RBAC, masking PII in logs |
| **Integrity** | Data is accurate, complete, and unaltered by unauthorized parties | Checksums, digital signatures, audit trails, input validation |
| **Availability** | Systems and data are accessible when needed by authorized users | HA/failover, DDoS mitigation, rate limiting, backups |

### Applying CIA in design

**Confidentiality** — classify data (public, internal, confidential, restricted). Encrypt sensitive fields in the database. Use TLS everywhere. Never log secrets or full credit card numbers.

**Integrity** — validate all input server-side. Use HMAC or signed JWTs so tokens cannot be tampered with. Version APIs and enforce schema validation.

**Availability** — design for graceful degradation. Circuit breakers prevent cascade failures. Health checks and autoscaling keep services reachable under load.

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

### CIA trade-offs in interviews

Real systems balance the three pillars. Strong encryption improves confidentiality but can hurt availability if key management fails. Aggressive rate limiting improves availability against abuse but may block legitimate users. Mention **context**: a public blog prioritizes availability; a banking ledger prioritizes integrity and confidentiality over raw uptime.

## What is the difference between a threat, vulnerability, and risk?

These terms are often conflated. In interviews, define each precisely and show how they relate.

| Term | Definition | Example |
|------|------------|---------|
| **Threat** | A potential cause of an unwanted incident — who or what could harm the system | Malicious insider, ransomware group, misconfigured CI pipeline |
| **Vulnerability** | A weakness that can be exploited — a flaw in code, config, or process | SQL injection in search endpoint, default admin password, unpatched Log4j |
| **Risk** | Likelihood × impact of a threat exploiting a vulnerability | High: unauthenticated admin API on the public internet |

**Formula (simplified):** `Risk = Threat × Vulnerability × Impact` (some frameworks use Likelihood × Impact after controls).

```bash
# Threat modeling shorthand in a ticket
# Threat:     External attacker brute-forces login
# Vuln:       No account lockout, weak password policy
# Risk:       HIGH — credential stuffing could compromise customer accounts
# Control:    MFA, rate limiting, breached-password denylist
```

A **threat** exists even if no vulnerability is present today (e.g., quantum computing vs current RSA). A **vulnerability** exists even if no active threat targets it (latent risk). **Risk** is what you prioritize — it combines both with business impact.

### Interview tip

When discussing an incident, separate layers: "The **threat** was a supply-chain attacker. The **vulnerability** was an unsigned npm package in our build. The **risk** we accepted was medium because we had no integrity checks on dependencies."

## What is defense in depth and why does it matter?

**Defense in depth** (layered security) assumes any single control can fail. Multiple independent layers slow attackers, limit blast radius, and provide detection opportunities.

### Typical layers

| Layer | Controls |
|-------|----------|
| **Perimeter** | WAF, DDoS protection, geo-blocking |
| **Network** | Segmentation, private subnets, firewalls |
| **Identity** | MFA, SSO, least privilege IAM |
| **Application** | Input validation, parameterized queries, CSRF tokens |
| **Data** | Encryption, tokenization, backups |
| **Monitoring** | SIEM, alerting, audit logs |

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

No single layer is sufficient. A WAF blocks many injection attempts; parameterized queries catch what slips through. MFA protects stolen passwords; session timeout limits hijacked sessions.

## What is the principle of least privilege?

**Least privilege** means every user, service account, and process receives only the minimum permissions required to perform its function — nothing more, for the shortest duration necessary.

### Why it matters

Over-privileged accounts are high-value targets. A compromised CI token with `Owner` on production AWS can exfiltrate all data. A database connection using `sa`/`root` turns one SQL injection into full schema compromise.

| Scope | Bad | Better |
|-------|-----|--------|
| **Human users** | Everyone in engineering has production admin | Just-in-time elevation with approval |
| **Service accounts** | App uses DB owner role | App uses role limited to `SELECT/INSERT/UPDATE` on one schema |
| **API tokens** | GitHub PAT with `repo` + `admin:org` | Fine-scoped token for one repo, read-only if possible |
| **Cloud IAM** | `*` actions on `*` resources | Policy scoped to specific ARNs and actions |

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

**Just-in-time (JIT) access** and **time-bound credentials** extend least privilege: break-glass production access expires after 2 hours and is fully logged.

## What does "fail secure" mean in application design?

**Fail secure** means when a system errors, loses power, or cannot verify authorization, it defaults to the **safer** state — typically **deny access** rather than grant it.

Contrast with **fail open**: a broken auth check allows everyone in. That is almost never acceptable for security-sensitive paths.

| Scenario | Fail open (bad) | Fail secure (good) |
|----------|-----------------|---------------------|
| Auth service timeout | Allow request through | Return 503 or 401; deny until verified |
| Firewall rule parse error | Permit all traffic | Block traffic |
| License validation offline | Unlock premium features | Restrict to free tier |
| Session store unreachable | Trust client-side cookie alone | Invalidate session; require re-login |

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

**Fail secure ≠ fail silent.** Deny access but log the failure so operators can fix the root cause. For availability-critical read paths, some systems use cached policy decisions with short TTL — still defaulting to deny when cache is stale and engine is down.

## What is security by design and how does it differ from bolt-on security?

**Security by design** embeds security requirements from the first architecture sketch through deployment — threat modeling, secure defaults, privacy reviews, and abuse cases are part of "done," not a pre-release scan.

**Bolt-on security** adds controls after the system is built: penetration test findings patched under deadline pressure, WAF rules compensating for missing input validation, secrets hardcoded then moved to a vault.

| Aspect | Security by design | Bolt-on |
|--------|-------------------|---------|
| **When** | Requirements, design, sprint planning | Pre-launch or post-incident |
| **Cost** | Lower long-term; fewer rewrites | Higher; retrofit is expensive |
| **Effectiveness** | Controls match architecture | Compensating controls leave gaps |
| **Example** | RBAC modeled in domain layer | Admin URL hidden but not protected |

### Practices

- **Threat modeling** in design reviews (STRIDE — see below).
- **Secure defaults**: HTTPS on, debug off, strict CSP, no default credentials.
- **Abuse cases** in user stories: "What if someone uploads a 10 GB file?" "What if they replay this payment request?"
- **Shift left**: SAST in CI, dependency scanning, security champions in teams.

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

Interview framing: "We don't 'add security' at the end; we define security requirements alongside functional requirements and verify them in CI."

## What is STRIDE threat modeling and how do you use it?

**STRIDE** is a mnemonic for six threat categories pioneered at Microsoft. Use it to systematically ask "what can go wrong?" for each component, data flow, and trust boundary.

| Letter | Threat | Question to ask |
|--------|--------|-----------------|
| **S** | Spoofing | Can an attacker pretend to be someone/something else? |
| **T** | Tampering | Can data be modified in transit or at rest? |
| **R** | Repudiation | Can someone deny an action with no proof? |
| **I** | Information disclosure | Can unauthorized parties read sensitive data? |
| **D** | Denial of service | Can availability be disrupted? |
| **E** | Elevation of privilege | Can a user gain permissions they should not have? |

### How to run STRIDE (practical steps)

1. **Diagram** the system: actors, processes, data stores, data flows, trust boundaries.
2. **Per element**, walk STRIDE and note threats.
3. **Rate** likelihood and impact; prioritize mitigations.
4. **Track** mitigations as work items; re-model when architecture changes.

```text
Data flow: Browser --HTTPS--> API Gateway --mTLS--> Order Service --> PostgreSQL

Trust boundary: Internet → DMZ (gateway)
  S: stolen session cookie → mitigate: HttpOnly, Secure, SameSite, short TTL
  T: JWT alg=none attack → mitigate: validate alg, use library defaults
  I: verbose error leaks stack → mitigate: generic 500 to client, log server-side
  D: checkout flood → mitigate: rate limit, CAPTCHA on abuse
  E: IDOR on /orders/{id} → mitigate: server-side ownership check every request
```

STRIDE is not a checklist you run once — it is a **conversation structure** for design reviews. Pair it with **DREAD** (Damage, Reproducibility, Exploitability, Affected users, Discoverability) for prioritization if the interviewer asks.

## What is attack surface and how do you reduce it?

**Attack surface** is the sum of all entry points where an attacker can send data, trigger behavior, or extract information — APIs, open ports, admin panels, file uploads, third-party integrations, debug endpoints, mobile apps, and even employees (social engineering).

### Reduction strategies

| Strategy | Example |
|----------|---------|
| **Remove** | Delete unused endpoints, disable default accounts, turn off directory listing |
| **Reduce exposure** | Internal admin APIs on private network only; no public Swagger in prod |
| **Harden** | MFA on admin, WAF, input validation |
| **Monitor** | Log and alert on admin path access, dependency CVEs |
| **Segment** | Separate prod/staging; limit lateral movement |

```bash
# Attack surface inventory (interview talking point)
# Exposed:  api.example.com (443) — REST + GraphQL
#           auth.example.com (443) — OIDC
# Internal: admin-api.internal (VPN only)
# Removed:   /debug/pprof, PHPInfo, staging S3 bucket listing

# Reduce: disable GraphQL introspection in production
# Harden: require mTLS for service-to-service calls
```

**Minimal API principle**: every endpoint is maintained, authenticated, authorized, tested, and monitored. Dead code and "temporary" debug routes are classic surface expanders.

Microservices increase **logical** surface (more services to patch) but can **decrease blast radius** when properly segmented — mention both sides in interviews.

## What are zero trust principles and how do they apply to modern apps?

**Zero trust** rejects the idea that anything inside the corporate network is automatically trustworthy. Every access request is verified explicitly — identity, device health, context — regardless of whether the caller is "on VPN" or "in the office."

### Core principles (NIST SP 800-207)

| Principle | Meaning |
|-----------|---------|
| **Verify explicitly** | Authenticate and authorize every request; use least privilege |
| **Assume breach** | Design as if attackers are already inside; segment and monitor |
| **Least privilege access** | Limit access by identity, device, location, data sensitivity |
| **Continuous validation** | Session risk scoring, step-up auth for sensitive actions |

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

**Modern apps**: mTLS between services, service mesh policies, identity-aware proxies, conditional access (MFA if new device), and **no long-lived implicit trust** for service accounts — rotate credentials, use workload identity.

Zero trust complements defense in depth; it does not replace encryption or secure coding.

## What is the difference between security and privacy?

**Security** protects systems and data against unauthorized access, modification, and disruption — confidentiality, integrity, availability.

**Privacy** governs how **personal data** is collected, used, stored, shared, and deleted — rights of individuals over information about them.

| Dimension | Security | Privacy |
|-----------|----------|---------|
| **Focus** | Assets and threats | People and their data |
| **Goal** | Prevent breaches and abuse | Lawful, transparent, minimal processing |
| **Frameworks** | ISO 27001, NIST CSF, SOC 2 | GDPR, CCPA, HIPAA (privacy provisions) |
| **Example control** | Encrypt database | Collect only fields needed; honor deletion requests |

You can be **secure but not private**: vault is encrypted (good security) but you sell user behavior to third parties without consent (bad privacy).

You can pursue **privacy but weak security**: minimize collection (good privacy) but store leftovers in plaintext (bad security → breach exposes everything).

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

In interviews: security answers "Can attackers get in?" Privacy answers "Should we have this data at all, and do users know how we use it?"

## What are common security roles (CISO, AppSec) and what do they own?

Security is a team sport. Know who owns what when describing your collaboration in interviews.

| Role | Typical ownership |
|------|-------------------|
| **CISO** (Chief Information Security Officer) | Enterprise security strategy, risk appetite, compliance, board reporting, budget |
| **AppSec / Product Security** | Secure SDLC, threat modeling, code review, SAST/DAST, security requirements for products |
| **SecOps / SOC** | Monitoring, incident response, SIEM, on-call for alerts |
| **GRC** (Governance, Risk, Compliance) | Policies, audits (SOC 2, ISO), risk registers |
| **IAM** | Identity platforms, SSO, MFA, provisioning/deprovisioning |
| **Cloud Security** | CSPM, IAM in AWS/Azure/GCP, network segmentation in cloud |
| **Red Team / Pen Test** | Adversarial testing, exploit chains, report critical findings |
| **Security Engineer** | Build security tooling, WAF rules, secrets management platforms |

**Developers** own secure implementation: input validation, authz checks, dependency updates. AppSec enables and verifies; they do not write every line of product code.

```text
Sprint example:
  PM:     user story + acceptance criteria
  Dev:    implements feature + unit tests
  AppSec: threat model for new payment flow; reviews PR for IDOR
  SecOps: adds detection rule for unusual refund volume
  CISO:   accepts residual risk if fix is deferred (documented exception)
```

When asked "How did you work with security?": name the role, the artifact (threat model, pen test report, policy), and your action (fixed IDOR, added rate limiting, rotated keys).

## How should you answer security questions in technical interviews?

Interviewers want **structured thinking**, not buzzwords. Use a repeatable framework.

### Recommended structure

1. **Clarify scope** — web app, API, mobile, cloud, insider threat?
2. **Identify assets** — what must be protected (PII, payments, credentials)?
3. **Name threats and vulnerabilities** — STRIDE or OWASP categories.
4. **Propose controls** — preventive, detective, corrective; defense in depth.
5. **Acknowledge trade-offs** — UX vs security, cost, latency; fail secure.
6. **Mention verification** — tests, pen test, monitoring, incident playbooks.

### Example answer skeleton (XSS)

> "For stored XSS in a comment field, the **asset** is other users' sessions. The **threat** is an attacker injecting script. I'd **prevent** with context-aware output encoding and a strict CSP, **detect** with logging on CSP violations, and **verify** with security tests and periodic scans. I'd avoid `innerHTML` with raw user input and sanitize only as defense in depth — encoding on output is primary."

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

### Common mistakes to avoid

| Mistake | Better approach |
|---------|-----------------|
| "We're secure because we use HTTPS" | HTTPS is necessary, not sufficient — mention authz, validation, logging |
| Only naming tools | Explain the problem the tool solves |
| "Security team handles that" | Show developer ownership of secure coding |
| Ignoring abuse cases | Discuss rate limits, fraud, insider scenarios |

### Depth calibration

- **Junior**: correct definitions, one concrete example, knows OWASP Top 10 names.
- **Mid**: threat modeling, code-level mitigations, CI scanning, incident basics.
- **Senior**: trade-offs, zero trust architecture, metrics (MTTD/MTTR), driving org change.

Close with **how you stay current**: OWASP, CVE feeds, postmortems, internal security champions — shows sustained practice, not cramming.
