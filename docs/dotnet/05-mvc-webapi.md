# MVC vs Web API, Model Binding & Validation

## Concept Explanation

ASP.NET Core MVC and Web API share the same framework. The difference is mostly the **base class** and **return type**:

- **MVC controllers** (`Controller`) return **Views** (HTML) via Razor — for server-rendered web pages.
- **Web API controllers** (`ControllerBase` + `[ApiController]`) return **data** (JSON) via `IActionResult`/`ActionResult<T>` — for REST APIs consumed by SPAs/mobile.

**Model binding** maps incoming HTTP data (route, query string, form, JSON body, headers) onto action method parameters/objects. **Validation** uses data annotations (`[Required]`, `[Range]`, etc.) checked into `ModelState`.

## Code Example(s)

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet("{id:int}")]                         // route binding: /api/products/5
    public ActionResult<Product> Get(int id)
    {
        var product = _repo.Find(id);
        return product is null ? NotFound() : Ok(product); // 404 or 200
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateProductDto dto) // body binding
    {
        // With [ApiController], invalid ModelState auto-returns 400 — no manual check needed
        var created = _repo.Add(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created); // 201
    }
}
```

```csharp
// Validation via data annotations
public class CreateProductDto
{
    [Required] public string Name { get; set; } = "";
    [Range(0.01, 10000)] public decimal Price { get; set; }
    [EmailAddress] public string? ContactEmail { get; set; }
}
```

## Interview Q&A

**🟢 What is the difference between MVC and Web API in ASP.NET Core?**
They use the same framework; MVC returns views (HTML) for web pages, Web API returns data (JSON) for clients. Web API controllers derive from `ControllerBase` and typically use `[ApiController]`.

**🟢 What is model binding?**
The process of mapping HTTP request data (route values, query string, form fields, JSON body, headers) to action method parameters and model objects.

**🟡 What does the `[ApiController]` attribute do?**
It enables API conventions: automatic 400 responses on invalid `ModelState`, inference of binding sources ([FromBody] for complex types), attribute routing requirement, and problem-details error responses.

**🟡 How do `[FromBody]`, `[FromQuery]`, `[FromRoute]` differ?**
They explicitly specify where a parameter is bound from: request body (JSON), query string, or route template. With `[ApiController]`, complex types default to `[FromBody]` and simple types to route/query.

**🔴 What's the difference between `IActionResult`, `ActionResult<T>`, and returning the type directly?**
`IActionResult` lets you return any status/result type but loses the response type for tooling. `ActionResult<T>` allows both a typed value and status results (e.g. `NotFound()`), and documents the return type for Swagger. Returning `T` directly always yields 200 with that body.

## ⚠️ Tricky / Gotchas

- **Without `[ApiController]` you must manually check `ModelState.IsValid`** and return `BadRequest(ModelState)`. With it, that's automatic.
- **A complex type bound from the query** requires `[FromQuery]` unless `[ApiController]` infers it; otherwise it tries the body and fails for GET.
- **You can't bind two `[FromBody]` parameters** — the body can only be read once. Combine them into one DTO.
- **`CreatedAtAction` needs the route to resolve** — a mismatched action name/route values throws at runtime.
- **Validation only runs on bound models** — manually constructed objects aren't validated automatically.

## 📌 Quick Recap

- MVC → HTML views; Web API → JSON data (`ControllerBase` + `[ApiController]`).
- Model binding maps route/query/body/form/header → parameters.
- `[ApiController]` auto-validates ModelState (400), infers binding sources.
- Use `[FromBody]`/`[FromQuery]`/`[FromRoute]` to control binding; only one `[FromBody]`.
- Prefer `ActionResult<T>` for typed + status results and good Swagger docs.
