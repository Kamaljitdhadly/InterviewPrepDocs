# Authorization and Access Control

## Questions Covered

1. What is the difference between authentication and authorization?
2. What is the difference between RBAC and ABAC?
3. What is claims-based authorization?
4. How does policy-based authorization work in .NET?
5. What is the difference between resource-based and action-based permissions?
6. What is horizontal vs vertical privilege escalation?
7. What are OWASP broken access control examples?
8. How do you apply the principle of least privilege in APIs?

## What is the difference between authentication and authorization?

**Authentication** verifies identity ("who are you?"). **Authorization** decides what an authenticated principal may do ("what are you allowed to access?").

| Step | Purpose | Failure result |
|------|---------|----------------|
| Authentication | Prove identity | 401 Unauthorized |
| Authorization | Enforce permissions | 403 Forbidden |

Authentication runs first. A valid login does not imply access to every resource — authorization evaluates roles, claims, policies, and ownership on each request.

```csharp
[Authorize] // must be authenticated
[HttpGet("orders/{id}")]
public async Task<IActionResult> GetOrder(int id)
{
    var order = await _db.Orders.FindAsync(id);
    if (order == null) return NotFound();

    // Authorization: can this user access THIS order?
    if (order.CustomerId != User.GetUserId() && !User.IsInRole("Admin"))
        return Forbid();

    return Ok(order);
}
```

**401** = not authenticated; **403** = authenticated but not permitted.

## What is the difference between RBAC and ABAC?

**RBAC (Role-Based Access Control)** assigns permissions to **roles**; users inherit permissions through role membership. Simple to administer; can lead to role explosion in complex orgs.

**ABAC (Attribute-Based Access Control)** evaluates **attributes** of subject, resource, action, and environment against policies. More flexible; harder to audit without good tooling.

| Aspect | RBAC | ABAC |
|--------|------|------|
| Decision basis | Role membership | Attributes + policy rules |
| Example | `Admin` can delete users | `department == resource.department` |
| Scalability | Good for coarse permissions | Good for fine-grained, dynamic rules |
| Audit | "User has role X" | "Policy P matched attributes A,B,C" |

```csharp
// RBAC — role check
[Authorize(Roles = "Manager,Admin")]
public IActionResult ApproveExpense(int id) => Ok();

// ABAC-style — policy uses claims + resource attributes
public class DepartmentAccessHandler : AuthorizationHandler<DepartmentRequirement, Document>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DepartmentRequirement requirement,
        Document resource)
    {
        var userDept = context.User.FindFirst("department")?.Value;
        if (userDept == resource.Department && context.User.IsInRole("Employee"))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

Many systems use **hybrid RBAC + ABAC**: roles for broad gates, attributes for row-level or contextual rules (tenant ID, ownership, clearance level).

## What is claims-based authorization?

A **claim** is a name-value pair about the principal (user or service), issued by the identity provider or enriched by the app after login.

| Claim type | Example value | Use |
|------------|---------------|-----|
| `sub` / NameIdentifier | `user-42` | User identity |
| `role` | `Editor` | RBAC |
| `permission` | `invoices:approve` | Fine-grained |
| `tenant_id` | `acme-corp` | Multi-tenancy |
| `department` | `Finance` | ABAC |

Claims travel in cookies, JWT access tokens, or server session after federation (OIDC/SAML).

```csharp
// Map JWT claims to ClaimsPrincipal (automatic with JwtBearer)
// Custom claims transformation after OIDC login
public class AppClaimsTransformation : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity!;
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var dbUser = await _userRepo.GetAsync(userId);

        identity.AddClaim(new Claim("tenant_id", dbUser.TenantId));
        foreach (var perm in dbUser.Permissions)
            identity.AddClaim(new Claim("permission", perm));

        return principal;
    }
}
```

```csharp
// Authorize by claim
[Authorize(Policy = "CanApproveInvoices")]
// Policy registered as: policy.RequireClaim("permission", "invoices:approve")
public IActionResult Approve(int id) => Ok();
```

Prefer **permissions as claims** over hardcoding role names in every controller — roles map to permission sets in one place.

## How does policy-based authorization work in .NET?

ASP.NET Core **policy-based authorization** registers named policies with requirements; **handlers** evaluate them at runtime. More expressive than `[Authorize(Roles)]` alone.

**Components:**

| Piece | Role |
|-------|------|
| `AuthorizationPolicy` | Named rule (requirements + optional auth schemes) |
| `IAuthorizationRequirement` | Marker for a condition to satisfy |
| `AuthorizationHandler<T>` | Implements evaluation logic |
| `[Authorize(Policy = "...")]` | Applies policy to endpoint |

```csharp
// Startup — register policies and handlers
services.AddAuthorization(options =>
{
    options.AddPolicy("MinimumAge18", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(18)));

    options.AddPolicy("CanEditDocument", policy =>
        policy.Requirements.Add(new DocumentOwnerRequirement()));

    options.AddPolicy("TenantMember", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim("tenant_id", ctx.Resource as string ?? "")));
});

services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
services.AddSingleton<IAuthorizationHandler, DocumentOwnerHandler>();
```

```csharp
public class MinimumAgeRequirement : IAuthorizationRequirement
{
    public int MinimumAge { get; }
    public MinimumAgeRequirement(int age) => MinimumAge = age;
}

public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MinimumAgeRequirement requirement)
    {
        var dob = context.User.FindFirst("birthdate")?.Value;
        if (dob != null && CalculateAge(dob) >= requirement.MinimumAge)
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

```csharp
[Authorize(Policy = "CanEditDocument")]
public async Task<IActionResult> Update(int id, DocumentDto dto)
{
    var doc = await _db.Documents.FindAsync(id);
    var authResult = await _authService.AuthorizeAsync(User, doc, "CanEditDocument");
    if (!authResult.Succeeded) return Forbid();
    // update...
    return Ok();
}
```

Use **resource-based** invocation (`AuthorizeAsync(User, resource, policy)`) when ownership depends on the entity being accessed.

## What is the difference between resource-based and action-based permissions?

**Action-based** (functional) permissions control **what operations** a user can perform: `users:create`, `reports:export`, `orders:delete`.

**Resource-based** permissions control access to **a specific instance**: "Alice may edit Document #7 because she owns it" or "Bob may read Project X because he is a member."

| Model | Question | Example |
|-------|----------|---------|
| Action-based | Can you do this operation at all? | `DELETE /users` requires `users:delete` |
| Resource-based | Can you do it on this object? | `DELETE /users/5` only if self or admin |

```csharp
// Action-based — endpoint gate
[Authorize(Policy = "OrdersWrite")]
[HttpPost("orders")]
public IActionResult CreateOrder(CreateOrderDto dto) => Ok();

// Resource-based — check against loaded entity
[HttpPut("orders/{id}")]
public async Task<IActionResult> UpdateOrder(int id, UpdateOrderDto dto)
{
    var order = await _db.Orders.FindAsync(id);
    if (order == null) return NotFound();

    var authorized = await _authService.AuthorizeAsync(
        User, order, new OrderOwnerRequirement());
    if (!authorized.Succeeded) return Forbid();

    // apply update
    return Ok();
}
```

```csharp
public class OrderOwnerRequirement : IAuthorizationRequirement { }

public class OrderOwnerHandler : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Order order)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (order.CustomerId == userId || context.User.IsInRole("Support"))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

**Best practice:** Combine both — action permission to enter the controller area, resource check for IDOR prevention on `{id}` routes.

## What is horizontal vs vertical privilege escalation?

**Vertical privilege escalation** — a lower-privileged user gains **higher** privileges (user → admin). Example: modifying JWT `role` claim, accessing `/admin` endpoints, exploiting mass-assignment to set `IsAdmin=true`.

**Horizontal privilege escalation** — a user accesses **another user's data at the same privilege level**. Example: changing `orderId=123` to `orderId=124` (IDOR), viewing another tenant's records.

| Type | Direction | Classic bug |
|------|-----------|-------------|
| Vertical | Up (more power) | Hidden admin API, role injection |
| Horizontal | Sideways (peer data) | Insecure direct object reference (IDOR) |

```csharp
// VULNERABLE — no ownership check (horizontal escalation)
[HttpGet("invoices/{id}")]
public async Task<Invoice> Get(int id) =>
    await _db.Invoices.FindAsync(id);

// SECURE — enforce resource ownership
[HttpGet("invoices/{id}")]
public async Task<IActionResult> Get(int id)
{
    var invoice = await _db.Invoices.FindAsync(id);
    if (invoice == null) return NotFound();
    if (invoice.OwnerId != User.GetUserId()) return Forbid();
    return Ok(invoice);
}
```

```csharp
// VULNERABLE — vertical escalation via mass assignment
public class UpdateProfileDto
{
    public string Name { get; set; }
    public bool IsAdmin { get; set; }  // attacker sets true
}

// SECURE — separate DTOs; never bind privileged fields from client input
public class UpdateProfileDto
{
    public string Name { get; set; }
}
// Admin flag changed only via admin-only endpoint + policy
```

Defense: server-side authorization on every request, deny by default, validate IDs against the authenticated principal's scope (tenant, owner).

## What are OWASP broken access control examples?

**Broken Access Control** is OWASP Top 10 #1 (2021). Users act outside their intended permissions because enforcement is missing, misconfigured, or bypassable.

| Vulnerability | Description | Example |
|---------------|-------------|---------|
| IDOR | Access objects by changing IDs | `GET /api/users/2` as user 1 |
| Missing function-level control | Admin APIs exposed to regular users | `POST /admin/delete` without role check |
| Path traversal | Access files outside allowed dir | `?file=../../etc/passwd` |
| JWT tampering | Trust unverified claims | Decode payload, set `admin: true` |
| CORS misconfiguration | Evil site reads authenticated responses | `Access-Control-Allow-Origin: *` with credentials |
| Metadata manipulation | Change hidden fields | `price=0` or `role=admin` in JSON body |
| Forced browsing | Guess URLs | `/reports/internal` unauthenticated |

```javascript
// Client-side "security" — easily bypassed
if (user.role !== 'admin') {
  hideAdminMenu();
}
// Attacker calls API directly — server must enforce
```

```csharp
// SECURE API pattern — default deny
app.MapControllers().RequireAuthorization();

// Explicit anonymous only where intended
[AllowAnonymous]
[HttpPost("login")]
public IActionResult Login(LoginDto dto) => Ok();

// Every mutating endpoint: authenticate + authorize + resource check
[Authorize(Policy = "AdminOnly")]
[HttpDelete("users/{id}")]
public async Task<IActionResult> DeleteUser(string id) { /* ... */ }
```

**Testing:** Automated policy tests per endpoint; integration tests that user A cannot access user B's IDs; periodic access reviews; log denied access attempts.

## How do you apply the principle of least privilege in APIs?

**Least privilege** — grant only the minimum permissions required to perform a task, for the minimum time, on the minimum resources.

| Layer | Practice |
|-------|----------|
| Identity | Scoped OAuth scopes (`orders:read` not `orders:*`) |
| API keys / service accounts | One key per integration; rotate; IP restrict |
| Database | App uses DB user with CRUD on needed tables only |
| Cloud IAM | Task roles, not admin keys on instances |
| Tokens | Short-lived access tokens; narrow audience |
| Endpoints | Separate read vs write policies |

```csharp
// Scope-based API authorization
services.AddAuthorization(options =>
{
    options.AddPolicy("OrdersRead", p =>
        p.RequireAssertion(ctx =>
            ctx.User.HasClaim("scope", "orders:read") ||
            ctx.User.HasClaim("scope", "orders:write")));

    options.AddPolicy("OrdersWrite", p =>
        p.RequireClaim("scope", "orders:write"));
});

[Authorize(Policy = "OrdersRead")]
[HttpGet("orders")]
public IActionResult List() => Ok();

[Authorize(Policy = "OrdersWrite")]
[HttpPost("orders")]
public IActionResult Create(CreateOrderDto dto) => Ok();
```

```csharp
// Service-to-service — client credentials with narrow scope (OAuth 2.0)
// Token request: scope=inventory:read (not full API access)
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = "https://api.myapp.com/inventory",
            RoleClaimType = "scope"
        };
    });
```

```bash
# Generate restricted API key material (store hash server-side)
openssl rand -hex 32
```

**Operational habits:** Regular access reviews; remove unused roles; break-glass admin with MFA and audit logging; default-deny IAM policies; integration tests proving low-privilege tokens cannot call high-privilege routes.
