# WebApi Basics

## Questions Covered

1. What is the difference Rest API and Web API?
2. What are REST guidelines? What is the difference between Rest and Restful?
3. What is Content Negotiation in Web API?
4. What is MediaTypeFormatter class in Web API?
5. What are Response Codes in Web API?

## What is the difference Rest API and Web API?

**Web API** — any API accessible over the web (HTTP/HTTPS). May use SOAP, GraphQL, JSON, XML, or other protocols/formats.

**REST API** — a Web API that follows REST architectural constraints. Uses HTTP methods (GET, POST, PUT, DELETE) and typically JSON or XML.

| Aspect | Web API | REST API |
|--------|---------|----------|
| Scope | General term | Specific REST-constrained style |
| Protocols | HTTP, HTTPS, SOAP, etc. | HTTP methods |
| Formats | JSON, XML, others | Typically JSON or XML |
| Constraints | May or may not follow REST | Must follow REST principles |

**REST principles:** stateless requests, client-server separation, uniform interface, cacheable responses, layered system.

**Examples:** Web API → SOAP services, GraphQL. REST API → Google Maps, Twitter, GitHub APIs.

## What are REST guidelines? What is the difference between Rest and Restful?

REST (Representational State Transfer) is an architectural style for networked apps, usually over HTTP.

**REST guidelines:**

1. **Stateless** — each request carries all context; server stores no client session state.
2. **Client-Server** — separate concerns; client requests resources, server provides them.
3. **Uniform Interface** — consistent API surface:
   - Resources identified by URIs
   - CRUD via HTTP methods (GET, POST, PUT, DELETE)
   - Self-descriptive messages
   - **HATEOAS** — responses include links to related resources
4. **Cacheable** — responses explicitly marked cacheable or not.
5. **Layered System** — security, load balancing, etc. in layers.
6. **Code on Demand (optional)** — server may send executable code (e.g., JavaScript).

**REST vs RESTful:**

| | REST | RESTful |
|---|------|---------|
| Nature | Architectural style / guidelines | Practical implementation of REST |
| Role | Defines how resources are structured and transferred | API that adheres to REST constraints |

REST is the framework; RESTful describes APIs that fully comply with it.

## What is Content Negotiation in Web API?

**Content Negotiation** selects the response format (JSON, XML, plain text) based on what the client accepts and the server can produce.

**Flow:**

1. Client sends `Accept` header with preferred media types.
2. Server matches `Accept` against supported formatters.
3. Server picks a format or returns **406 Not Acceptable**.
4. Response includes matching `Content-Type` header.

```csharp
Accept: application/json
Content-Type: application/json
```

```csharp
[HttpGet]
public IHttpActionResult GetPerson(int id)
{
    var person = new Person { Id = id, Name = "John Doe" };
    return Ok(person); // format chosen by content negotiation
}
```

**JSON request/response:**

```http
GET /api/person/1 HTTP/1.1
Accept: application/json
```

```json
{ "Id": 1, "Name": "John Doe" }
```

**XML request/response:**

```http
GET /api/person/1 HTTP/1.1
Accept: application/xml
```

```xml
<Person>
  <Id>1</Id>
  <Name>John Doe</Name>
</Person>
```

**Why it matters:** client flexibility, interoperability across browsers/apps/services, single endpoint serving multiple formats.

**Configure formatters:**

```csharp
public static void Configure(HttpConfiguration config)
{
    config.Formatters.Remove(config.Formatters.XmlFormatter);
    config.Formatters.Add(new MyCustomFormatter());
}
```

## What is MediaTypeFormatter class in Web API?

`MediaTypeFormatter` serializes .NET objects to HTTP bodies and deserializes request bodies into .NET types — enabling JSON, XML, and custom formats.

**Built-in formatters:**

| Formatter | Media Type | Use |
|-----------|------------|-----|
| `JsonMediaTypeFormatter` | `application/json` | Default in most scenarios |
| `XmlMediaTypeFormatter` | `application/xml` | XML clients |
| `FormUrlEncodedMediaTypeFormatter` | `application/x-www-form-urlencoded` | HTML form POST |
| `BsonMediaTypeFormatter` | `application/bson` | Compact binary JSON |

**Manual serialization:**

```csharp
public HttpResponseMessage Get()
{
    var person = new Person { Id = 1, Name = "John Doe" };
    var response = new HttpResponseMessage(HttpStatusCode.OK);
    response.Content = new ObjectContent<Person>(person, new JsonMediaTypeFormatter());
    return response;
}
```

**Configure via `HttpConfiguration`:**

```csharp
public static void Configure(HttpConfiguration config)
{
    config.Formatters.Remove(config.Formatters.XmlFormatter);
    config.Formatters.Add(new MyCustomFormatter());
    config.Formatters.JsonFormatter.SerializerSettings.Formatting =
        Newtonsoft.Json.Formatting.Indented;
}
```

**Custom formatter** — inherit `MediaTypeFormatter`, override `CanReadType`, `CanWriteType`, `ReadFromStreamAsync`, `WriteToStreamAsync`:

```csharp
public class MyCustomFormatter : MediaTypeFormatter
{
    public MyCustomFormatter()
    {
        SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/my-custom-format"));
    }

    public override bool CanReadType(Type type) => type == typeof(MyCustomType);
    public override bool CanWriteType(Type type) => type == typeof(MyCustomType);

    public override Task<object> ReadFromStreamAsync(
        Type type, Stream readStream, HttpContent content, IFormatterLogger formatterLogger)
    {
        // Custom deserialization logic
    }

    public override Task WriteToStreamAsync(
        Type type, object value, Stream writeStream, HttpContent content,
        TransportContext transportContext)
    {
        // Custom serialization logic
    }
}
```

## What are Response Codes in Web API?

HTTP status codes tell the client whether a request succeeded, failed, or needs further action.

| Category | Meaning | Examples |
|----------|---------|----------|
| **1xx** Informational | Request received, processing | 100 Continue |
| **2xx** Success | Request succeeded | 200 OK, 201 Created, 204 No Content |
| **3xx** Redirection | Client must take further action | 301 Moved Permanently, 302 Found, 304 Not Modified |
| **4xx** Client Error | Bad request from client | 400, 401, 403, 404, 409 |
| **5xx** Server Error | Server failure | 500, 502, 503 |

**Common codes with Web API helpers:**

```csharp
return Ok(data);                    // 200 OK
return Created(uri, newResource);   // 201 Created
return NoContent();                 // 204 No Content
return BadRequest("Invalid input"); // 400 Bad Request
return Unauthorized();              // 401 Unauthorized
return Forbid();                    // 403 Forbidden
return NotFound();                  // 404 Not Found
return Conflict("Already exists");  // 409 Conflict
return StatusCode(500, "Error");    // 500 Internal Server Error
```

**Controller example:**

```csharp
[HttpGet("{id}")]
public IActionResult GetResource(int id)
{
    var resource = _repository.GetResourceById(id);
    if (resource == null)
        return NotFound();       // 404
    return Ok(resource);         // 200
}

[HttpPost]
public IActionResult CreateResource([FromBody] ResourceDto resourceDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);  // 400

    var resource = _repository.AddResource(resourceDto);
    return CreatedAtRoute("GetResource", new { id = resource.Id }, resource); // 201
}
```
