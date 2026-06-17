# Application Security by Stack

## Questions Covered

1. How do you secure ASP.NET Core applications?
2. How do you secure React single-page applications?
3. How do you secure Angular applications?
4. What are essential SQL Server security practices for application backends?
5. How do you secure Docker images and containers?
6. What is a Kubernetes Pod Security Context, and how do you use it?
7. How should secrets be managed in microservices architectures?
8. What is the security testing pyramid, and how do you apply it?

## How do you secure ASP.NET Core applications?

Layer transport, identity, validation, headers, and vault-backed secrets.

### Security Middleware Pipeline

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts(); // Strict-Transport-Security
}

app.UseHttpsRedirection();
app.UseSecurityHeaders(); // custom or NWebsec / NetEscapades
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

### Authentication and Authorization

```csharp
// Program.cs — JWT for APIs (see .NET Core OAuth 2.0)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://login.example.com";
        options.Audience = "order-api";
        options.RequireHttpsMetadata = true;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));
});
```

```csharp
[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var order = await _repo.GetAsync(id);
        if (order == null) return NotFound();
        if (order.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier))
            return Forbid();
        return Ok(order);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id) { /* ... */ }
}
```

### Input Validation and Headers

```csharp
public class CreateOrderRequest
{
    [Required, StringLength(100)]
    public string ProductSku { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; }
}

// EF Core — parameterized by default; avoid FromSqlRaw with concat
var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
```

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; script-src 'self'; frame-ancestors 'none'");
    await next();
});
```

### Secrets

```csharp
// User Secrets in dev; Key Vault in production
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{vaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// Never: "Password=sa123" in appsettings.Production.json committed to git
```

| Area | Practice |
|------|----------|
| Transport | HTTPS only; HSTS in production |
| Auth | JWT/OAuth; short-lived tokens; refresh rotation |
| Authz | Policy per endpoint; prevent IDOR |
| Data | Parameterized queries; encrypt sensitive columns |
| CORS | Explicit origins — never `AllowAnyOrigin` with credentials |

See `_work/tight/C#/.NET Core Basics.md`, `_work/tight/C#/.NET Core OAuth 2.0.md`.

## How do you secure React single-page applications?

All client code is visible — focus on XSS, safe tokens, API-side authorization.

### XSS Prevention

```jsx
// Safe
<div>{userComment}</div>

// Dangerous without sanitization
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Safer pattern
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userComment, { ALLOWED_TAGS: ['b', 'p', 'a'] });
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### Environment Variables and Auth

```js
// .env — SAFE: public API URL
VITE_API_BASE=https://api.example.com

// NEVER in client bundle
VITE_STRIPE_SECRET_KEY=sk_live_xxx  // visible in Sources tab
```

```jsx
// Prefer: access token in memory, refresh in HttpOnly cookie (BFF)
let accessToken = null;

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    credentials: 'include', // for cookie-based refresh
  });
  if (res.status === 401) {
    accessToken = await refreshToken();
    return apiFetch(url, options);
  }
  return res;
}
```

| Storage | XSS | CSRF | Notes |
|---------|-----|------|-------|
| localStorage | High | Low | Avoid for tokens |
| HttpOnly cookie | JS cannot read | Mitigate SameSite + CSRF | Best for refresh |
| Memory | Lower | Low | Good for access token |

### CSRF and CSP

```jsx
async function postMutation(url, body) {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
    body: JSON.stringify(body),
  });
}
```

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none'
```

```bash
npm audit
npm ls --depth=0  # know your direct deps
```

Client route guards are UX only.

```jsx
// UX only — not security
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user?.roles.includes('admin')) return <Navigate to="/" />;
  return children;
}
```

Full patterns: `_work/tight/React/React Error Handling and Security.md`.

## How do you secure Angular applications?

Built-in sanitization, interceptors, XSRF — API enforces authorization.

### XSS and Auth Interceptor

```typescript
// Angular sanitizes binding by default
<p>{{ userInput }}</p>

// Bypass ONLY with trusted content — dangerous with user data
<div [innerHTML]="trustedHtml"></div>

import { DomSanitizer, SecurityContext } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

getSafeHtml(html: string) {
  return this.sanitizer.sanitize(SecurityContext.HTML, html);
}
```

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.auth.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) this.auth.logout();
        return throwError(() => err);
      })
    );
  }
}
```

### CSRF, Environment, Guards

```typescript
// Angular sends XSRF-TOKEN cookie as X-XSRF-TOKEN header automatically
// when server sets cookie and HttpClientXsrfModule is imported
import { HttpClientXsrfModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
})
export class AppModule {}
```

```typescript
// environment.prod.ts — no secrets
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
```

```typescript
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasRole('admin')) return true;
  return router.createUrlTree(['/forbidden']);
};
```

Never use `bypassSecurityTrust*` with user-controlled strings. See `_work/tight/Angular/Angular Animations and Error Handling and Security.md`.

## What are essential SQL Server security practices for application backends?

```csharp
// Prefer Windows or Azure AD over SQL auth with password in connection string
"Server=sql.prod;Database=Orders;Integrated Security=true;Encrypt=true;TrustServerCertificate=false"
```

```sql
-- Application login — not db_owner
CREATE LOGIN [order_api] WITH PASSWORD = '...' MUST_CHANGE, CHECK_POLICY = ON;
CREATE USER [order_api] FOR LOGIN [order_api];

GRANT SELECT, INSERT, UPDATE ON dbo.Orders TO [order_api];
GRANT EXECUTE ON dbo.usp_CreateOrder TO [order_api];
-- No DROP, no xp_cmdshell, no sysadmin
```

```csharp
// EF Core — safe
await _context.Orders.Where(o => o.UserId == userId).ToListAsync();

// Dapper — safe
await conn.QueryAsync<Order>(
    "SELECT * FROM Orders WHERE UserId = @UserId",
    new { UserId = userId });

// NEVER
var sql = $"SELECT * FROM Users WHERE Email = '{email}'";
```

| Layer | Feature |
|-------|---------|
| In transit | `Encrypt=true`; TLS 1.2+ |
| At rest | Transparent Data Encryption (TDE) |
| Column-level | Always Encrypted for SSN, PAN |

```sql
-- TDE (admin task)
CREATE DATABASE ENCRYPTION KEY WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE TDE_Cert;
ALTER DATABASE OrdersDB SET ENCRYPTION ON;
```

```sql
CREATE SERVER AUDIT OrdersAudit TO FILE (FILEPATH = 'D:\Audit\');
CREATE DATABASE AUDIT SPECIFICATION OrdersDbSpec FOR SERVER AUDIT OrdersAudit
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Orders BY [public]);
ALTER SERVER AUDIT OrdersAudit WITH (STATE = ON);
```

Keep SQL Server off the public internet; separate login per app; disable `xp_cmdshell`; no `sa` for apps.

## How do you secure Docker images and containers?

```dockerfile
# Multi-stage build — small final image, no SDK in prod
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app .

# Non-root user
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["dotnet", "OrderApi.dll"]
```

```yaml
- name: Build image
  run: docker build -t myapp:${{ github.sha }} .

- name: Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

```bash
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --user 1000:1000 \
  myapp:1.0
```

```bash
# Docker Swarm secrets (see Docker Secrets and Configs)
echo "dbpassword" | docker secret create db_password -

# Kubernetes — use Secrets, not ENV in image
```

See `_work/tight/Docker/Docker Images and Dockerfile.md`, `_work/tight/Docker/Docker Build and CICD Integration.md`.

## What is a Kubernetes Pod Security Context, and how do you use it?

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: myregistry/order-api:2.1.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: order-api-ingress
spec:
  podSelector:
    matchLabels:
      app: order-api
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - port: 8080
```

See `_work/tight/Kubernetes/Kubernetes Controllers and Security.md`.

## How should secrets be managed in microservices architectures?

```csharp
// NEVER — secret in source or ConfigMap
"ConnectionStrings": {
  "Orders": "Server=sql;User=sa;Password=ProductionPassword123"
}
```

```yaml
# ConfigMaps are NOT for secrets — they are base64, not encrypted by default
apiVersion: v1
kind: ConfigMap
data:
  api-key: c3VwZXJzZWNyZXQ=  # still wrong place
```

| Tool | Use case |
|------|----------|
| HashiCorp Vault | Multi-cloud, dynamic secrets |
| Azure Key Vault | Azure / .NET native |
| AWS Secrets Manager | AWS workloads |
| External Secrets Operator | Sync vault → K8s Secret |

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri("https://myvault.vault.azure.net/"),
    new DefaultAzureCredential());

// Access in code
var conn = builder.Configuration.GetConnectionString("Orders");
```

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: order-api-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-keyvault
    kind: ClusterSecretStore
  target:
    name: order-api-db-secret
  data:
    - secretKey: connection-string
      remoteRef:
        key: orders-db-connection
```

```bash
# Short-lived DB credential — TTL 1 hour
vault read database/creds/orders-role
# username: v-token-orders-abc, password: random
```

mTLS for service-to-service; OAuth client credentials for M2M. See `_work/tight/Microservices/Microservices Security.md`.

## What is the security testing pyramid, and how do you apply it?

Many fast automated checks at the base; fewer slow manual tests at the top.

```text
                    ┌─────────────┐
                    │  Pen test   │  Few / yearly / major releases
                    │  Red team   │
                    ├─────────────┤
                    │    DAST     │  Staging, nightly/weekly
                    │  API fuzz   │
                    ├─────────────┤
                    │ SAST + SCA  │  Every PR / commit
                    │ Secret scan │
                    ├─────────────┤
                    │ Unit + int  │  Every PR — authz, validation
                    │   tests     │
                    └─────────────┘
```

```csharp
[Fact]
public async Task GetOrder_OtherUsersOrder_Returns403()
{
    var client = _factory.CreateClient();
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", TokenForUser("user-a"));

    var response = await client.GetAsync("/api/orders/999"); // belongs to user-b

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

```typescript
// React Testing Library — ensure sensitive data not rendered for wrong role
it('hides admin panel for standard user', () => {
  render(<App />, { wrapper: authWrapper({ roles: ['user'] }) });
  expect(screen.queryByText('Admin Console')).not.toBeInTheDocument();
});
```

```yaml
# Every PR — SAST + SCA
- run: dotnet build /warnaserror
- uses: github/codeql-action/analyze@v3
- run: npm audit --audit-level=high
- uses: gitleaks/gitleaks-action@v2
```

```bash
zap-api-scan.py -t https://staging.example.com/openapi.json -f openapi
```

| OWASP risk | Pyramid layer |
|------------|---------------|
| Injection | SAST + unit tests (parameterized queries) |
| Broken auth | Integration tests + DAST login flows |
| XSS | SAST + DAST + framework defaults |
| Vulnerable components | SCA every build |
| Security misconfig | DAST headers + IaC policy |

**Authz integration tests and dependency scans** beat pen tests alone for incident prevention. Align with `_work/tight/Security/Secure Development Lifecycle.md`.
