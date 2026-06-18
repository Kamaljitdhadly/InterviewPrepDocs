# Authentication and Identity

## Questions Covered

1. What is the difference between authentication and identification?
2. How does password hashing work, and why use bcrypt or Argon2?
3. What are the main types of multi-factor authentication (MFA)?
4. What is the difference between session-based and token-based authentication?
5. What is the structure of a JWT, and what are common pitfalls?
6. How do OAuth 2.0 authorization code and PKCE flows work?
7. What is OpenID Connect (OIDC), and how does it relate to OAuth 2.0?
8. What are the basics of SAML for enterprise single sign-on?
9. How do you mitigate credential stuffing and brute-force attacks?
10. What does a secure password reset flow look like?

## What is the difference between authentication and identification?

**Identification** = claiming an identity; **authentication** = proving it. Authorization decides what the proven principal may do.

| Concept | Question | Example |
|---------|----------|---------|
| Identification | Who do you claim to be? | Username |
| Authentication | Can you prove it? | Password + TOTP |
| Authorization | What may you do? | `Editor` role |

Identification alone is not security — anyone can type a username.

```csharp
// Login: identification + authentication
var result = await _signInManager.PasswordSignInAsync(
    model.Email,      // identification
    model.Password,   // authentication factor
    model.RememberMe,
    lockoutOnFailure: true);

if (result.Succeeded)
{
    var userId = _userManager.GetUserId(User); // authenticated principal
}
```

## How does password hashing work, and why use bcrypt or Argon2?

Store **salted one-way hashes**, never plaintext. Salt defeats rainbow tables; slow/memory-hard algorithms defeat brute force.

| Algorithm | Use for passwords? |
|-----------|-------------------|
| MD5 / SHA-1 | No |
| PBKDF2 | Yes (high iterations) |
| bcrypt | Yes (adaptive cost) |
| Argon2id | Yes (recommended) |

```csharp
// ASP.NET Core Identity uses PBKDF2 by default; Argon2 via package
using Konscious.Security.Cryptography;

public static string HashPasswordArgon2id(string password)
{
    var salt = RandomNumberGenerator.GetBytes(16);
    var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
    {
        Salt = salt,
        DegreeOfParallelism = 4,
        MemorySize = 65536,  // 64 MB
        Iterations = 4
    };
    var hash = argon2.GetBytes(32);
    return $"argon2id${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
}
```

```csharp
// Verifying with ASP.NET Core PasswordHasher (PBKDF2)
var hasher = new PasswordHasher<ApplicationUser>();
var user = await _userManager.FindByEmailAsync(email);
var result = hasher.VerifyHashedPassword(user, user.PasswordHash, password);

if (result == PasswordVerificationResult.SuccessRehashNeeded)
{
    user.PasswordHash = hasher.HashPassword(user, password);
    await _userManager.UpdateAsync(user);
}
```

```bash
# Generate a bcrypt hash (cost 12) for testing — never pipe real passwords in scripts
openssl passwd -bcrypt -cost 12
```

Use a library; tune work factor over time; optional pepper in HSM is defense in depth, not a salt substitute.

## What are the main types of multi-factor authentication (MFA)?

MFA = two+ factors from **different** categories: know (password), have (phone/key), are (biometric).

| Method | Security |
|--------|----------|
| TOTP | Good |
| SMS OTP | Weak (SIM swap) |
| FIDO2 / WebAuthn | Phishing-resistant — preferred |

```csharp
// ASP.NET Core Identity — enable TOTP authenticator
await _userManager.SetTwoFactorEnabledAsync(user, true);
var token = await _userManager.GenerateTwoFactorTokenAsync(
    user, TokenOptions.DefaultAuthenticatorProvider);

// Validate at login
var valid = await _userManager.VerifyTwoFactorTokenAsync(
    user, TokenOptions.DefaultAuthenticatorProvider, code);
```

```javascript
// WebAuthn registration (browser) — phishing-resistant MFA
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: Uint8Array.from(atob(challengeB64), c => c.charCodeAt(0)),
    rp: { name: 'MyApp', id: 'myapp.com' },
    user: { id: userIdBytes, name: 'alice@contoso.com', displayName: 'Alice' },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    authenticatorSelection: { authenticatorAttachment: 'cross-platform', userVerification: 'required' }
  }
});
// Send credential.response to server for attestation verification
```

## What is the difference between session-based and token-based authentication?

| Aspect | Session | Token (JWT) |
|--------|---------|-------------|
| State | Server-side store | Often stateless |
| Transport | HttpOnly cookie | Bearer header / cookie |
| Revocation | Delete session | Short TTL + refresh rotation |
| XSS | HttpOnly helps | Avoid localStorage |

```csharp
// Session cookie — ASP.NET Core
services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.IdleTimeout = TimeSpan.FromMinutes(20);
});

// After login
HttpContext.Session.SetString("UserId", user.Id);
```

```csharp
// JWT bearer — ASP.NET Core
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
        };
    });
```

Hybrid: refresh token in HttpOnly cookie; short-lived access JWT in memory; PKCE + BFF for SPAs.

## What is the structure of a JWT, and what are common pitfalls?

Format: `header.payload.signature` (Base64URL). Validate signature + `iss`, `aud`, `exp` — never trust decoded payload alone.

| Pitfall | Mitigation |
|---------|------------|
| `alg: none` / confusion | Allowlist algorithms |
| Long TTL | Short access token + refresh |
| Data in JWT | Signed ≠ encrypted |
| localStorage | HttpOnly cookie or in-memory |

```javascript
// Decoded structure (never trust payload without verifying signature!)
const header = { alg: 'RS256', typ: 'JWT' };
const payload = {
  sub: 'user-123',
  iss: 'https://auth.myapp.com',
  aud: 'https://api.myapp.com',
  exp: 1710000000,
  iat: 1709996400,
  scope: 'orders:read'
};
// signature = Sign(base64url(header) + '.' + base64url(payload), privateKey)
```

```javascript
// NEVER do this in production
const payload = JSON.parse(atob(token.split('.')[1]));
if (payload.role === 'admin') grantAccess(); // unsigned — attacker forges payload

// Correct: verify with library
import { jwtVerify, createRemoteJWKSet } from 'jose';
const JWKS = createRemoteJWKSet(new URL('https://auth.myapp.com/.well-known/jwks.json'));
const { payload } = await jwtVerify(token, JWKS, {
  issuer: 'https://auth.myapp.com',
  audience: 'https://api.myapp.com'
});
```

```csharp
// ASP.NET Core validates automatically when configured; manual check example
var handler = new JwtSecurityTokenHandler();
var principal = handler.ValidateToken(token, validationParameters, out _);
var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

## How do OAuth 2.0 authorization code and PKCE flows work?

OAuth 2.0 delegates **authorization** without sharing user passwords. Roles: resource owner, client, authorization server, resource server.

**Auth code:** redirect → user consents → `code` → exchange at `/token` with `client_secret` (confidential clients only).

**PKCE:** public clients send `code_challenge` at authorize and `code_verifier` at token — required for SPAs/mobile.

```javascript
// Step 1 — redirect to authorize (server renders or SPA initiates)
const authUrl = new URL('https://auth.example.com/oauth2/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', 'https://app.example.com/callback');
authUrl.searchParams.set('scope', 'openid profile api.read');
authUrl.searchParams.set('state', crypto.randomUUID());
window.location.href = authUrl.toString();
```

```csharp
// Step 4 — backend exchanges code (secret never in browser)
var tokenResponse = await http.PostAsync("https://auth.example.com/oauth2/token",
    new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "authorization_code",
        ["code"] = authorizationCode,
        ["redirect_uri"] = "https://app.example.com/callback",
        ["client_id"] = config["OAuth:ClientId"]!,
        ["client_secret"] = config["OAuth:ClientSecret"]!
    }));
```

```javascript
// PKCE helpers
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64UrlEncode(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
);

sessionStorage.setItem('pkce_verifier', verifier);
authUrl.searchParams.set('code_challenge', challenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
```

```javascript
// Token exchange with verifier
await fetch('https://auth.example.com/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://app.example.com/callback',
    client_id: CLIENT_ID,
    code_verifier: sessionStorage.getItem('pkce_verifier')
  })
});
```

Validate `state`; exact `redirect_uri` match; prefer auth code + PKCE over implicit.

## What is OpenID Connect (OIDC), and how does it relate to OAuth 2.0?

OAuth = **authorization** (access token for APIs). OIDC = identity layer on OAuth: **ID token** (JWT) + UserInfo.

| Token | Purpose |
|-------|---------|
| Access token | Call APIs |
| ID token | Prove authentication |
| Refresh token | Renew without re-login |

Scope `openid` triggers OIDC. APIs validate **access tokens**, not ID tokens (unless API is the audience).

```javascript
// OIDC discovery — fetch metadata
const metadata = await fetch('https://auth.example.com/.well-known/openid-configuration')
  .then(r => r.json());
// metadata.authorization_endpoint, .token_endpoint, .jwks_uri, .issuer
```

```csharp
// ASP.NET Core — OIDC middleware (Entra ID, Auth0, Keycloak)
services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
    options.Authority = "https://login.microsoftonline.com/{tenant}/v2.0";
    options.ClientId = config["AzureAd:ClientId"];
    options.ClientSecret = config["AzureAd:ClientSecret"];
    options.ResponseType = OpenIdConnectResponseType.Code;
    options.SaveTokens = true;
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("api://my-api/access");
    options.TokenValidationParameters.NameClaimType = "name";
});
```

## What are the basics of SAML for enterprise single sign-on?

SAML 2.0: XML federation. **IdP** asserts identity to **SP** via signed assertion POSTed to ACS URL.

SP-initiated: user → IdP login → SAML Response → SP validates signature, expiry, audience → local session.

```xml
<!-- Simplified assertion fragment -->
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                IssueInstant="2024-01-15T10:00:00Z">
  <saml:Issuer>https://idp.contoso.com</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
      alice@contoso.com
    </saml:NameID>
  </saml:Subject>
  <saml:AttributeStatement>
    <saml:Attribute Name="department">
      <saml:AttributeValue>Engineering</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>
```

```csharp
// ASP.NET Core SAML2 (Sustainsys.Saml2 example pattern)
services.AddAuthentication()
    .AddSaml2(options =>
    {
        options.SPOptions.EntityId = new EntityId("https://sp.myapp.com/saml");
        options.IdentityProviders.Add(new IdentityProvider(
            new EntityId("https://idp.contoso.com"), options.SPOptions)
        {
            MetadataLocation = "https://idp.contoso.com/metadata",
            LoadMetadata = true
        });
    });
```

SAML = enterprise XML SSO; OIDC = modern JSON/JWT — same federated goal, different stacks.

## How do you mitigate credential stuffing and brute-force attacks?

Stuffing = breached creds replayed; brute force = guessing. Layer: lockout, rate limits, CAPTCHA, MFA, breached-password checks, uniform errors, monitoring.

```csharp
// ASP.NET Core Identity — lockout
services.Configure<IdentityOptions>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});

// Rate limiting (.NET 7+)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10;
        opt.QueueLimit = 0;
    });
});

app.MapPost("/api/login", LoginHandler).RequireRateLimiting("login");
```

```csharp
// Check password against known breaches (k-anonymity API pattern)
public async Task<bool> IsPasswordPwnedAsync(string password)
{
    var sha1 = SHA1.HashData(Encoding.UTF8.GetBytes(password));
    var hash = Convert.ToHexString(sha1);
    var prefix = hash[..5];
    var suffix = hash[5..];
    var response = await _http.GetStringAsync(
        $"https://api.pwnedpasswords.com/range/{prefix}");
    return response.Contains(suffix, StringComparison.OrdinalIgnoreCase);
}
```

Exponential backoff; limits per IP and account; avoid permanent lockout without admin recovery.

## What does a secure password reset flow look like?

Random token (≥128 bits), store **hash** server-side, short expiry, single use, generic response ("if account exists…"), invalidate all sessions on success.

| Anti-pattern | Why |
|--------------|-----|
| Security questions | Guessable |
| Long-lived links | Wide window |
| Token in response body | Log leakage |

```csharp
public async Task<IActionResult> RequestReset(string email)
{
    var user = await _userManager.FindByEmailAsync(email);
    if (user != null)
    {
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var link = Url.Action("ResetPassword", "Account",
            new { userId = user.Id, token }, Request.Scheme);
        await _emailSender.SendAsync(email, "Reset password", link);
    }
    // Always same response
    return Ok(new { message = "If an account exists, instructions were sent." });
}

[HttpPost("reset")]
public async Task<IActionResult> Reset(ResetPasswordModel model)
{
    var user = await _userManager.FindByIdAsync(model.UserId);
    if (user == null) return BadRequest();

    var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
    if (!result.Succeeded) return BadRequest(result.Errors);

    await _userManager.UpdateSecurityStampAsync(user); // invalidate existing sessions
    return Ok();
}
```

```bash
# Generate a URL-safe random token for custom implementations
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

After reset: strong policy, breached-password check, email notification, step-up MFA for sensitive changes.

---

## Related Topics

- **Authorization and Access Control** (`Security/`)
- **.NET Core JSON Web Token** (`C#/`)
- **.NET Core OAuth 2.0** (`C#/`)
