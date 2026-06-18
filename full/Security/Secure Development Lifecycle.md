# Secure Development Lifecycle

## Questions Covered

1. What is shift-left security, and how do you implement it in a development team?
2. How does threat modeling fit into the SDLC, and what is a practical approach?
3. What are SAST, DAST, and IAST, and when should you use each?
4. How do dependency scanning and SBOMs reduce supply-chain risk?
5. What should a security-focused code review checklist cover?
6. What are the basics of security incident response for engineering teams?
7. How do you integrate security into CI/CD pipelines without blocking delivery?

## What is shift-left security, and how do you implement it in a development team?

**Shift-left security** moves security activities earlier in the software development lifecycle — from design and coding through build and test — instead of treating security as a gate just before production. The goal is to find and fix vulnerabilities when they are cheapest to remediate and before they reach users.

### Traditional vs Shift-Left

| Phase | Traditional (shift-right) | Shift-left |
|-------|---------------------------|------------|
| Design | Security review at release | Threat modeling, security requirements |
| Code | Pen test after feature freeze | Secure coding standards, peer review |
| Build | Manual scan before deploy | SAST, dependency scan in every PR |
| Operate | Incident-driven fixes | Monitoring, IR playbooks, postmortems |

### Practical Implementation

Embed security in user stories, secure scaffolding, developer training (OWASP Top 10 — see `study/Important Concepts/OWASP.md`; stack pitfalls in C#, React, Angular), and automated local checks.

```markdown
## Story: User password reset
- Acceptance: rate-limit reset requests (5/hour per IP)
- Acceptance: reset tokens expire in 15 minutes, single-use
- Acceptance: no user enumeration in API responses
- Threat: OWASP A07 — identification and authentication failures
```

```csharp
// ASP.NET Core template — enable security middleware from day one
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseHsts();
app.UseAuthentication();
app.UseAuthorization();
```

```yaml
# Pre-commit or local dev — fast feedback before push
# package.json scripts
{
  "scripts": {
    "lint:security": "eslint . --plugin security",
    "audit": "npm audit --audit-level=high"
  }
}
```

**Org practices:** security champions, security in Definition of Done, blameless postmortems. Developers share responsibility with automated guardrails.

## How does threat modeling fit into the SDLC, and what is a practical approach?

**Threat modeling** is a structured process to identify assets, trust boundaries, potential attackers, and mitigations. It answers: *What can go wrong? Who might attack? What do we do about it?*

| Trigger | Scope |
|---------|-------|
| New service or major feature | Full STRIDE pass on architecture |
| New external integration (OAuth, payment) | Data flow + auth boundary review |
| Architecture change (monolith → microservices) | Trust boundaries, service-to-service auth |
| Post-incident | Update model with lessons learned |

### STRIDE Framework

| Threat | Example | Mitigation |
|--------|---------|------------|
| **S**poofing | Fake JWT or session cookie | Strong auth, mTLS |
| **T**ampering | Modified API payload | HTTPS, signed tokens, input validation |
| **R**epudiation | User denies placing order | Audit logs |
| **I**nformation disclosure | DB dump via SQL injection | Parameterized queries, least privilege |
| **D**enial of service | Flood login endpoint | Rate limiting, WAF |
| **E**levation of privilege | User calls admin API | RBAC, policy checks on every request |

```text
[Browser/React SPA] --HTTPS--> [API Gateway] --mTLS--> [Order Service]
                                      |
                                      v
                              [SQL Server - Orders DB]
```

Trust boundaries: browser ↔ API (untrusted client), API ↔ services (authenticated), service ↔ DB (least-privilege login).

```markdown
## Feature: Export user data (GDPR)
### Assets
- PII: email, address, order history
### Entry points
- GET /api/users/{id}/export (authenticated)
### Threats
1. IDOR — user A exports user B's data
2. Mass export via scripted requests
3. Export file stored unencrypted in blob storage
### Mitigations
- Authorize: caller.id == route id OR admin role
- Rate limit: 1 export / user / day
- Encrypt export at rest; signed download URL, 1-hour TTL
### Residual risk
- Compromised admin account — monitor audit log alerts
```

Map threats to backlog and authz tests. Keep the model **living** (see `study/Microservices/Microservices Security.md`).

## What are SAST, DAST, and IAST, and when should you use each?

Mature programs use **static** (code), **dynamic** (running app), and **interactive** (instrumented runtime) testing — none replaces the others.

| Dimension | SAST | DAST | IAST |
|-----------|------|------|------|
| **When** | Build / PR | Staging / pre-prod | QA / staging with agent |
| **Needs running app** | No | Yes | Yes |
| **Finds** | Coding flaws, secrets in code | Runtime config, HTTP issues | Confirmed exploitable paths |
| **False positives** | Higher | Medium | Lower |
| **Examples** | CodeQL, Semgrep, SonarQube | OWASP ZAP, Burp CI | Contrast, Seeker |

### SAST

```yaml
# GitHub Actions — CodeQL for C# / JavaScript
- uses: github/codeql-action/init@v3
  with:
    languages: csharp, javascript
- uses: github/codeql-action/analyze@v3
```

```bash
# Semgrep — custom rules for React dangerous patterns
semgrep --config p/react --config p/owasp-top-ten ./src
```

### DAST

```yaml
# OWASP ZAP baseline scan in CI (staging URL)
- name: ZAP Scan
  uses: zaproxy/action-baseline@v0.12.0
  with:
    target: 'https://staging.example.com'
    rules_file_name: '.zap/rules.tsv'
```

### IAST

Agent correlates HTTP with code execution — lower SAST noise, runtime overhead.

```text
PR merge  → SAST + secret scan + dependency audit
Nightly   → DAST against staging
Release   → Pen test / bug bounty for critical apps
Always    → Unit + integration tests for authz boundaries
```

**Interview:** SAST every PR; DAST before prod; IAST for tier-1 legacy with high SAST noise. Baseline legacy findings; prioritize exploitable internet-facing issues.

## How do dependency scanning and SBOMs reduce supply-chain risk?

Applications are mostly third-party code (npm, NuGet, base images). **Dependency scanning** finds known CVEs; an **SBOM** inventories components so you can answer *"Are we affected?"* in minutes when a new CVE drops (e.g., Log4Shell).

```bash
# .NET
dotnet list package --vulnerable --include-transitive

# Node / React
npm audit
npx audit-ci --high

# Docker image
trivy image myapp:1.2.3
```

```yaml
# Azure DevOps / GitHub — fail build on critical CVEs
- name: Trivy filesystem scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

```bash
# Generate SBOM for a container image
syft packages docker:myregistry/order-api:2.1.0 -o cyclonedx-json > sbom.json
```

```json
// CycloneDX excerpt — traceability when CVE-2024-XXXX is published
{
  "components": [
    {
      "type": "library",
      "name": "Newtonsoft.Json",
      "version": "13.0.1",
      "purl": "pkg:nuget/Newtonsoft.Json@13.0.1"
    }
  ]
}
```

| Situation | Action |
|-----------|--------|
| Fix available | Upgrade; regression test |
| No fix yet | Compensating control (WAF, disable feature) |
| Transitive only | `dotnet nuget why` / `npm ls`; override parent |
| Accepted risk | Document exception with expiry and owner |

Generate SBOM per release artifact; scan continuously — new CVEs affect old versions without code changes. Pin lockfiles (`package-lock.json`, `packages.lock.json`).

## What should a security-focused code review checklist cover?

Human review catches **business-logic flaws** and **authorization gaps** SAST misses. Focus on data flows and *"what if the attacker controls this field?"*

| Area | Review questions |
|------|------------------|
| **Input validation** | Server-side validation on all external input? |
| **Output encoding** | HTML/JSON/SQL encoded for context? |
| **Authentication** | Short-lived tokens? Secure cookie flags? |
| **Authorization** | IDOR prevented on every endpoint? |
| **Secrets** | No keys or connection strings in source? |
| **Logging** | No PII/passwords in logs? |

```csharp
// BAD — SQL injection via string concat
var sql = $"SELECT * FROM Users WHERE Email = '{email}'";

// GOOD — parameterized (see C# ADO.NET and Entity Framework)
await connection.QueryAsync<User>(
    "SELECT * FROM Users WHERE Email = @Email",
    new { Email = email });
```

```csharp
// BAD — missing authorization on detail endpoint
[HttpGet("{id}")]
public async Task<Order> Get(int id) => await _repo.GetAsync(id);

// GOOD
[HttpGet("{id}")]
[Authorize]
public async Task<Order> Get(int id)
{
    var order = await _repo.GetAsync(id);
    if (order.UserId != User.GetUserId()) return Forbid();
    return order;
}
```

**SPAs:** no secrets in `VITE_*` / `environment.ts`; sanitize `innerHTML` (see `study/React/React Error Handling and Security.md`). **SQL Server:** least-privilege login per app, not `sa`.

```markdown
## PR Security Review (copy into template)
- [ ] Threat model updated if architecture changed
- [ ] Authz tested for horizontal + vertical privilege escalation
- [ ] New endpoints documented in OpenAPI; security schemes defined
- [ ] Rate limiting considered for auth and expensive operations
- [ ] File uploads: type/size limits, virus scan, stored outside web root
```

| Finding | Action |
|---------|--------|
| SQLi, missing admin auth | Block merge |
| Missing login rate limit | Release blocker |
| Verbose error to client | Follow-up ticket |

## What are the basics of security incident response for engineering teams?

**Incident response (IR)** detects, contains, eradicates, and recovers from breaches — then prevents recurrence. Engineering is often first on scene.

| Phase | Engineering actions |
|-------|---------------------|
| **Prepare** | Runbooks, on-call, logging baseline |
| **Detect** | Auth anomaly alerts, WAF blocks |
| **Contain** | Revoke tokens, isolate instance, block IP |
| **Eradicate** | Patch, rotate secrets |
| **Recover** | Clean backup, gradual traffic restore |
| **Learn** | Postmortem, update threat model |

```markdown
1. Assign incident commander (IC) — single decision maker
2. Preserve evidence — snapshot logs, don't reboot prod blindly
3. Assess scope — which systems, data classes, users affected?
4. Contain — disable compromised credentials; WAF block; scale down if needed
5. Communicate — internal channel; legal/PR per severity; regulatory if PII breach
6. Document timeline — every action with timestamp
```

```bash
# Rotate Kubernetes secret and restart affected deployments
kubectl create secret generic api-db --from-literal=password='NEW' --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/order-api -n production

# Revoke all refresh tokens for user (application-specific)
# SQL Server — disable login pending investigation
ALTER LOGIN [compromised_app] DISABLE;
```

```csharp
// Emergency: invalidate all JWTs by rotating signing key
// appsettings — new key forces re-login (plan for user impact)
"Jwt": {
  "SigningKey": "<new-key-from-secrets-manager>",
  "ValidIssuer": "https://auth.example.com"
}
```

Centralize logs (WAF, app audit, CloudTrail, SQL Server Audit) in a tamper-resistant SIEM. GDPR may require 72-hour breach notification. Feed postmortem action items back into SDLC (SAST rules, training, threat model updates).

```markdown
## Postmortem template
### Summary
- What happened, customer impact, duration
### Timeline
- Detection → containment → resolution
### Root cause
- Technical + process gaps
### What went well / poorly
### Action items (owner + due date)
- Patch, detection rule, IR drill, training
```

## How do you integrate security into CI/CD pipelines without blocking delivery?

Security in CI/CD means **automated, fast feedback** on every change with **risk-based gates** — not a single manual approval blocking all releases.

```text
Commit → Lint/SAST/Secrets → Unit tests → Build → Image scan → Deploy staging
                                                              → DAST (nightly)
Deploy prod → Gate on critical findings + smoke tests
```

```yaml
name: security-pr
on: [pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript, csharp }
      - uses: github/codeql-action/analyze@v3

  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2

  dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm audit --audit-level=high
```

```yaml
  container-scan:
    needs: build
    steps:
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          severity: 'CRITICAL'
          exit-code: '1'   # block only on CRITICAL
```

```yaml
# CODEOWNERS — security team reviews auth changes
/src/Auth/     @security-team
/infrastructure/ @platform-team @security-team
```

```yaml
# GitHub OIDC → Azure (no stored Azure password in GitHub)
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

| Gate policy | Rationale |
|-------------|-----------|
| Block on CRITICAL + leaked secrets | Non-negotiable |
| Warn on HIGH CVE | Fix in sprint; override with ticket |
| Nightly DAST on staging | Deep scan without slowing every PR |
| SBOM per release | Future CVE lookup |

Use local rule parity with CI, Dependabot/Renovate, immutable signed artifacts, vault-backed secrets, and admission controllers (Kyverno/OPA) in Kubernetes. Security should improve signal without killing deploy frequency.
