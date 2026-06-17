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

**Authentication** = who you are; **authorization** = what you may do. Auth runs first.

| Step | Failure |
|------|---------|
| Authentication | 401 Unauthorized |
| Authorization | 403 Forbidden |

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

## What is the difference between RBAC and ABAC?

**RBAC:** permissions via **roles**. **ABAC:** decisions from **attributes** (user, resource, environment) + policies.

| Aspect | RBAC | ABAC |
|--------|------|------|
| Basis | Role | Attributes + rules |
| Example | `Admin` deletes users | `user.dept == doc.dept` |
| Fit | Coarse permissions | Fine-grained, dynamic |

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

Hybrid RBAC + ABAC is common: roles for broad gates, attributes for row-level rules.

## What is claims-based authorization?

**Claims** = name-value facts about the principal (`role`, `permission`, `tenant_id`, `department`).

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

Map roles → permissions in one place; authorize on permission claims in controllers.

## How does policy-based authorization work in .NET?

Register **policies** with **requirements**; **handlers** evaluate at runtime. Apply via `[Authorize(Policy = "...")]` or `AuthorizeAsync(User, resource, policy)`.

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

## What is the difference between resource-based and action-based permissions?

**Action-based:** can you perform this operation (`users:delete`)? **Resource-based:** can you do it on **this instance** (owner, tenant member)?

| Model | Question |
|-------|----------|
| Action | Can you do the operation at all? |
| Resource | Can you do it on this object? |

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

Combine both: action gate + resource check on `{id}` routes (IDOR prevention).

## What is horizontal vs vertical privilege escalation?

**Vertical:** gain **higher** privileges (user → admin). **Horizontal:** access **peer** data at same level (IDOR, wrong tenant).

| Type | Example |
|------|---------|
| Vertical | JWT `role` tampering, `IsAdmin=true` mass assignment |
| Horizontal | `orderId=124` instead of `123` |

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

Server-side checks every request; deny by default; scope IDs to principal (tenant, owner).

## What are OWASP broken access control examples?

OWASP Top 10 #1 (2021): users act outside intended permissions.

| Bug | Example |
|-----|---------|
| IDOR | `GET /api/users/2` as user 1 |
| Missing function control | `/admin/delete` without role check |
| JWT tampering | Unsigned `admin` claim |
| Metadata manipulation | `role=admin` in JSON body |
| Forced browsing | `/reports/internal` unauthenticated |

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

Test: user A cannot access user B's IDs; log denied attempts; periodic access reviews.

## How do you apply the principle of least privilege in APIs?

Grant minimum permissions, time, and resource scope needed for the task.

| Layer | Practice |
|-------|----------|
| OAuth | Narrow scopes (`orders:read` not `orders:*`) |
| Tokens | Short TTL, specific audience |
| DB / IAM | Task-specific credentials |
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

Default-deny; access reviews; break-glass admin with MFA + audit; integration tests for low-privilege token boundaries.
