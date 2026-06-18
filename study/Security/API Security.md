# API Security

## Questions Covered

1. What API authentication patterns should you know for interviews?
2. How do OAuth scopes differ from API keys, and when do you use each?
3. How do rate limiting and throttling protect APIs?
4. Why is input validation critical at the API boundary?
5. What is the OWASP API Security Top 10 overview?
6. What is mTLS and when should APIs use it?
7. What are BOLA and IDOR in APIs, and how do you prevent them?
8. How do API versioning and deprecation affect security?

## What API authentication patterns should you know for interviews?

Authentication proves **who** calls; authorization proves **what** they may do.

| Pattern | Best for |
|---------|----------|
| API key | Server-to-server, low sensitivity |
| Bearer JWT | SPAs, mobile, microservices |
| OAuth 2.0 / OIDC | Third-party, delegated user access |
| mTLS | B2B, service mesh |
| HMAC signatures | Webhooks, tamper-proof requests |
| Session cookie | Same-site browser apps |

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://login.example.com";
        options.Audience = "orders-api";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

[Authorize]
[HttpGet("orders/{id}")]
public async Task<OrderDto> GetOrder(int id) => await _service.GetAsync(id);
```

```csharp
public class ApiKeyMiddleware
{
    private const string HeaderName = "X-Api-Key";

    public async Task InvokeAsync(HttpContext context, IApiKeyValidator validator)
    {
        if (!context.Request.Headers.TryGetValue(HeaderName, out var key))
        {
            context.Response.StatusCode = 401;
            return;
        }
        if (!await validator.IsValidAsync(key))
        {
            context.Response.StatusCode = 401;
            return;
        }
        await _next(context);
    }
}
```

```http
GET /api/v1/inventory HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-Api-Key: sk_live_abc123   # alternative for service accounts
```

Principles: no secrets in client binaries; short-lived tokens; authenticate every request; `401` invalid creds, `403` missing permission.

**Interview:** OAuth/OIDC for users; JWT/mTLS for services; API keys only for low-risk internal calls with rotation.

## How do OAuth scopes differ from API keys, and when do you use each?

**API keys** = static app credential. **OAuth scopes** = delegated, expiring permission labels on a token.

| Aspect | API key | OAuth scope |
|--------|---------|-------------|
| Identity | App/integration | User + client |
| Granularity | Often all-or-nothing | `orders:read`, `orders:write` |
| User consent | None | Authorization screen |
| Revocation | Delete key | Revoke refresh token |

```http
# Authorization request
GET /authorize?
  response_type=code&
  client_id=mobile-app&
  redirect_uri=https://app.example.com/callback&
  scope=openid profile orders:read payments:write&
  state=xyz&
  code_challenge=...&
  code_challenge_method=S256
```

```json
// Access token claims
{
  "sub": "user-42",
  "client_id": "mobile-app",
  "scope": "openid profile orders:read",
  "exp": 1718650000,
  "aud": "orders-api"
}
```

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OrdersRead", policy =>
        policy.RequireClaim("scope", "orders:read")
              .RequireAuthenticatedUser());
    options.AddPolicy("OrdersWrite", policy =>
        policy.RequireClaim("scope", "orders:write"));
});

[Authorize(Policy = "OrdersWrite")]
[HttpPost("orders")]
public async Task<IActionResult> CreateOrder(CreateOrderDto dto) => Ok();
```

```csharp
public record ApiKeyRecord(string KeyHash, string ClientId, IReadOnlyList<string> Permissions);

public bool HasPermission(ApiKeyRecord key, string permission) =>
    key.Permissions.Contains(permission);

// Key scoped to read-only inventory — not equivalent to OAuth user delegation
```

**Interview:** Scopes for user data and third-party access; API keys for simple machine integrations with tight scope and rotation.

## How do rate limiting and throttling protect APIs?

Rate limiting caps requests per IP, client, user, or endpoint — defending brute force, scraping, DoS, and cost blowout.

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10;
        opt.QueueLimit = 0;
    });
    options.AddSlidingWindowLimiter("api", opt =>
    {
        opt.Window = TimeSpan.FromSeconds(60);
        opt.SegmentsPerWindow = 6;
        opt.PermitLimit = 100;
    });
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests", token);
    };
});

app.UseRateLimiter();

[EnableRateLimiting("auth")]
[HttpPost("login")]
public IActionResult Login(LoginDto dto) => Ok();

[EnableRateLimiting("api")]
[HttpGet("products")]
public IActionResult ListProducts() => Ok();
```

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 42
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718650060
```

Algorithms: fixed window (simple), sliding window (smoother), token bucket (bursts).

```yaml
# nginx limit_req
http {
  limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
  server {
    location /api/login {
      limit_req zone=login burst=3 nodelay;
    }
  }
}
```

```javascript
// Redis sliding window (conceptual)
const key = `rate:${clientId}:${Math.floor(Date.now() / 60000)}`;
const count = await redis.incr(key);
await redis.expire(key, 60);
if (count > 100) return res.status(429).json({ error: 'rate_limit_exceeded' });
```

Tighten limits on login/OTP/password-reset; return `429` + `Retry-After`.

## Why is input validation at the API boundary?

The API edge is the trust perimeter — all input is hostile until validated. Client-side checks are UX only.

| Layer | Checks |
|-------|--------|
| Schema | Types, length, enums |
| Business rules | Quantity > 0, valid state transitions |
| Authorization | Caller cannot set privileged fields |
| Context | Safe for DB/shell/HTML |

```csharp
public class CreateOrderDto
{
    [Required, StringLength(100)]
    public string ProductSku { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; }

    [EmailAddress]
    public string ContactEmail { get; set; }
}

[HttpPost("orders")]
public IActionResult Create([FromBody] CreateOrderDto dto)
{
    if (!ModelState.IsValid)
        return ValidationProblem(ModelState);
    // never trust client-supplied UserId or Price — set server-side
    var order = new Order
    {
        UserId = User.GetUserId(),
        ProductSku = dto.ProductSku,
        Quantity = dto.Quantity,
        Price = _pricing.GetCurrentPrice(dto.ProductSku)
    };
    return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
}
```

```javascript
// Express + zod — validate before handler logic
const createOrderSchema = z.object({
  productSku: z.string().min(1).max(100).regex(/^[A-Z0-9-]+$/),
  quantity: z.number().int().min(1).max(100),
  contactEmail: z.string().email()
});

app.post('/orders', (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  // handler uses parsed.data only
});
```

```csharp
// VULNERABLE — binds all JSON properties including IsAdmin
public class UserDto { public string Name { get; set; } public bool IsAdmin { get; set; } }

// SAFE — explicit DTO without privileged fields; map to entity manually
public class UpdateProfileDto { public string DisplayName { get; set; } }
```

```json
// Request with unexpected fields should fail or be stripped explicitly
{
  "productSku": "WIDGET-1",
  "quantity": 2,
  "discountPercent": 100,
  "isInternal": true
}
```

**Interview:** Validate schema + business rules + authZ at edge; never bind privileged fields from JSON.

## What is the OWASP API Security Top 10 overview?

OWASP API Security Top 10 (2023) — know name, impact, and fix for each.

| ID | Risk | Key mitigation |
|----|------|----------------|
| API1 | BOLA/IDOR | Per-object authorization |
| API2 | Broken Authentication | Strong auth, short TTL, MFA |
| API3 | Broken Property AuthZ | DTOs, response filtering |
| API4 | Unrestricted Consumption | Rate limits, pagination caps |
| API5 | Broken Function AuthZ | Role checks on every route |
| API6 | Sensitive Business Flows | Rate limit, CAPTCHA, bots |
| API7 | SSRF | Block private IPs, URL allowlist |
| API8 | Security Misconfiguration | Harden defaults, no debug in prod |
| API9 | Improper Inventory | Gateway inventory, retire old versions |
| API10 | Unsafe Consumption of APIs | Validate upstream API data |

```csharp
// BAD — returns full entity including internal fields
return Ok(user);

// GOOD — projection DTO
return Ok(new UserResponseDto(user.Id, user.DisplayName, user.Email));
```

```csharp
// VULNERABLE
var html = await httpClient.GetStringAsync(userSuppliedUrl);

// SAFE — resolve DNS, reject private ranges, allowlist hosts
if (!UrlAllowlist.IsPermitted(userSuppliedUrl))
    throw new SecurityException("URL not allowed");
```

```yaml
# API gateway — block metadata endpoints
plugins:
  - name: request-termination
    config:
      status_code: 403
    route: /fetch-url  # deprecated endpoint
```

**Interview:** Top three: BOLA (API1), broken auth (API2), unrestricted consumption (API4).

## What is mTLS and when should APIs use it?

**mTLS** requires client + server certificates at TLS handshake — strong service/B2B identity.

```csharp
builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.AllowedCertificateTypes = CertificateTypes.Chained;
        options.RevocationMode = X509RevocationMode.Online;
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                var cn = context.ClientCertificate.Subject;
                if (!TrustedClients.Contains(cn))
                    context.Fail("Unknown client");
                return Task.CompletedTask;
            }
        };
    });

[Authorize(AuthenticationSchemes = CertificateAuthenticationDefaults.AuthenticationScheme)]
[HttpPost("internal/sync")]
public IActionResult Sync(SyncDto dto) => Ok();
```

```yaml
# Kubernetes ingress — optional client cert verification
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-tls-verify-client: "on"
    nginx.ingress.kubernetes.io/auth-tls-secret: "default/ca-secret"
spec:
  tls:
    - hosts: [api.internal.example.com]
      secretName: api-tls
```

Use for service mesh and B2B; not public mobile/SPA (certs extractable). Pair mTLS with authorization.

## What are BOLA and IDOR in APIs, and how do you prevent them?

**BOLA** (OWASP) = **IDOR** (legacy): changing object ID accesses another user's resource because only authentication — not ownership — is checked.

```http
GET /api/orders/1001 HTTP/1.1
Authorization: Bearer <user-A-token>

# Attacker changes ID
GET /api/orders/1002 HTTP/1.1
Authorization: Bearer <user-A-token>
# Returns user B's order if server only checks "is logged in"
```

```http
GET /api/users/55/invoices/3/download HTTP/1.1
# Missing check: does user 55 own invoice 3?
```

```csharp
// VULNERABLE — any authenticated user can read any order
[HttpGet("orders/{id}")]
public async Task<Order> Get(int id) =>
    await _db.Orders.FindAsync(id);

// SECURE — enforce ownership or role
[HttpGet("orders/{id}")]
public async Task<ActionResult<OrderDto>> Get(int id)
{
    var userId = User.GetUserId();
    var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
    if (order == null) return NotFound();
    if (order.UserId != userId && !User.IsInRole("Admin"))
        return Forbid();
    return Ok(new OrderDto(order));
}
```

```javascript
// GraphQL — scope resolver to caller
orders: (_, { id }, { user }) => {
  const order = await db.orders.findByPk(id);
  if (!order || order.userId !== user.id) throw new ForbiddenError();
  return order;
}
```

```csharp
public class OrderOwnerHandler : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Order resource)
    {
        var userId = context.User.GetUserId();
        if (resource.UserId == userId || context.User.IsInRole("Admin"))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

Fix: authorize every object access; UUIDs reduce enumeration but don't replace authZ; test with two user tokens.

## How do API versioning and deprecation affect security?

Old unpatched API versions remain attack surfaces (OWASP API9) — missing auth fixes, verbose errors, shadow endpoints.

| Strategy | Example |
|----------|---------|
| URL path | `/api/v1/orders` |
| Header | `Api-Version: 2` |
| Media type | `Accept: application/vnd.example.v2+json` |

```http
GET /api/v1/orders HTTP/1.1

HTTP/1.1 200 OK
Sunset: Sat, 01 Nov 2025 00:00:00 GMT
Deprecation: true
Link: </api/v2/orders>; rel="successor-version"
Warning: 299 - "v1 deprecated; migrate to v2 by 2025-11-01"
```

```yaml
# Kong / similar — sunset enforcement
routes:
  - name: orders-v1
    paths: [/api/v1/orders]
    plugins:
      - name: request-termination
        config:
          status_code: 410
          message: "API v1 retired. Use /api/v2/orders"
  - name: orders-v2
    paths: [/api/v2/orders]
    plugins:
      - name: rate-limiting
        config: { minute: 100 }
      - name: jwt
```

```csharp
// ASP.NET Core API versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(2, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/orders")]
public class OrdersController : ControllerBase { }
```

```http
# v2 requires additional scope introduced in security hardening
GET /api/v2/admin/users HTTP/1.1
Authorization: Bearer <token-with-admin:users-read-scope>
```

Practices: inventory all versions; backport security fixes or force migration; `410 Gone` after sunset; one identity provider across versions.

**Interview:** Retire old versions aggressively; Sunset headers + gateway enforcement; same security bar on all active versions.
