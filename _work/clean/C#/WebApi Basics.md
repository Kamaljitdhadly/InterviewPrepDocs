# WebApi Basics

## Questions Covered

1. What is the difference Rest API and Web API?
2. What are REST guidelines? What is the difference between Rest and Restful?
3. What is Content Negotiation in Web API?
4. What is MediaTypeFormatter class in Web API?
5. What are Response Codes in Web API?

## What is the difference Rest API and Web API?

The terms **REST API** and **Web API** are often used interchangeably, but they have distinct meanings and uses. Here’s a breakdown of their differences:

### Web API

1.  **Definition**:

    - A Web API is a broad term for any API (Application Programming Interface) that can be accessed over the web using HTTP protocols. It provides a way for different applications to communicate with each other over the internet.

2.  **Protocol**:

    - Web APIs can use various protocols and data formats, including HTTP, HTTPS, SOAP (Simple Object Access Protocol), and others. The data formats may include JSON, XML, or others.

3.  **Examples**:

    - SOAP-based Web Services

    - GraphQL APIs

4.  **Usage**:

    - A Web API is generally used for a range of different protocols and can be implemented in various ways.

### REST API

1.  **Definition**:

    - REST (Representational State Transfer) is an architectural style for designing networked applications. A REST API is a type of Web API that adheres to the principles and constraints of REST.

2.  **Protocol**:

    - REST APIs use HTTP methods (such as GET, POST, PUT, DELETE) and typically communicate using JSON or XML.

3.  **Principles**:

    - **Stateless**: Each request from a client to the server must contain all the information needed to understand and process the request.

    - **Client-Server Architecture**: The client and server are separate entities, and each can evolve independently.

    - **Uniform Interface**: REST APIs have a consistent interface that simplifies and decouples the architecture.

    - **Cacheable**: Responses from the server can be explicitly marked as cacheable or non-cacheable.

    - **Layered System**: The architecture is composed of layers, each with specific functionality.

4.  **Examples**:

    - Google Maps API

    - Twitter API

    - GitHub API

5.  **Usage**:

    - REST APIs are used for creating scalable web services that are easy to use and follow the principles of REST.

### Key Differences

- **Protocol Flexibility**:

  - **Web API**: Can use various protocols and formats (HTTP, HTTPS, SOAP, JSON, XML).

  - **REST API**: Specifically uses HTTP methods and typically JSON or XML for communication.

- **Architectural Constraints**:

  - **Web API**: May or may not follow REST principles.

  - **REST API**: Must follow REST principles (statelessness, uniform interface, etc.).

- **Design**:

  - **Web API**: Can be implemented using various design approaches, including REST, SOAP, or other methods.

  - **REST API**: Strictly adheres to RESTful design principles.

### Summary

- **Web API** is a general term for APIs accessible over the web using various protocols and formats.

- **REST API** is a specific type of Web API that follows REST architectural principles and uses HTTP methods and usually JSON or XML for communication.

. What are REST guidelines? What is the difference between Rest and Restful?

REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server, cacheable communications protocol, usually HTTP. Here are the key guidelines and principles of REST:

1.  **Stateless**:

    - Each request from a client to a server must contain all the information needed to understand and process the request. The server does not store any client context between requests.

2.  **Client-Server Architecture**:

    - The client and server are separate entities. The client requests resources, and the server provides them. This separation allows each to evolve independently.

3.  **Uniform Interface**:

    - REST APIs should have a consistent and uniform interface. This simplifies the architecture and decouples the client and server. The uniform interface typically includes:

      - **Resource Identification**: Resources are identified using URIs (Uniform Resource Identifiers).

      - **Resource Manipulation**: The API should support CRUD (Create, Read, Update, Delete) operations via standard HTTP methods (GET, POST, PUT, DELETE).

      - **Self-descriptive Messages**: Each request and response should contain sufficient information to describe how to process the request.

      - **Hypermedia as the Engine of Application State (HATEOAS)**: Responses should include links to related resources to enable dynamic navigation.

4.  **Cacheable**:

    - Responses from the server should explicitly define whether they are cacheable or not. Caching can improve performance and reduce server load.

5.  **Layered System**:

    - The architecture should be composed of layers, where each layer performs a specific function (e.g., security, load balancing). This layering helps in improving scalability and manageability.

6.  **Code on Demand (Optional)**:

    - Servers can provide executable code (e.g., JavaScript) that clients can use to extend their functionality. This is optional and not always used.

### Difference Between REST and RESTful

- **REST**:

  - REST is an architectural style or set of guidelines for creating networked applications. It defines how resources should be defined, manipulated, and transferred over a network, typically using HTTP.

- **RESTful**:

  - **RESTful** refers to web services or APIs that adhere to the principles and constraints of REST. An API is considered RESTful if it correctly implements the REST guidelines. Essentially, RESTful APIs are those that fully embrace REST principles and design constraints.

### Key Differences

- **REST**:

  - **Conceptual Framework**: REST is a broad architectural style and set of principles for designing networked applications.

  - **Guidelines**: REST specifies guidelines on how to structure and interact with resources using HTTP methods, stateless communication, and a uniform interface.

- **RESTful**:

  - **Implementation**: RESTful is the practical implementation of REST principles in web services or APIs. An API is called RESTful if it follows the REST principles and guidelines.

  - **Adherence**: RESTful APIs are designed to fully comply with REST constraints, making them scalable, stateless, and easily maintainable.

### Summary

- **REST** provides the theoretical framework and guidelines for designing networked applications.

- **RESTful** refers to the real-world implementation of these guidelines in web services and APIs.

## What is Content Negotiation in Web API?

**Content Negotiation** in Web API refers to the process of selecting the appropriate content format to return to the client based on the client's request. This process allows the API to serve the response in different formats, such as JSON, XML, or plain text, depending on what the client can accept and what the server can produce.

### How Content Negotiation Works

1.  **Client Request**:

    - When a client sends a request to the Web API, it includes an Accept header, which indicates the content types (media types) that the client can understand, such as application/json, application/xml, or text/plain.

    - Example of an Accept header:

```csharp
Accept: application/json
```

2.  **Server's Capability**:

    - The Web API server examines the Accept header and determines which formats it can produce for the requested resource. The server can typically produce responses in formats like JSON, XML, etc.

3.  **Content Negotiation Process**:

    - The Web API framework performs the content negotiation process by comparing the media types in the Accept header with the media types the server can produce.

    - If the server can produce one of the requested formats, it selects that format for the response.

    - If none of the requested formats are available, the server may return a 406 Not Acceptable status code, indicating that it cannot fulfill the request with any of the formats the client accepts.

4.  **Response**:

    - The Web API returns the response in the selected format, including the appropriate Content-Type header.

    - Example of a response header:

```csharp
Content-Type: application/json
```

### Example of Content Negotiation

Consider a Web API that supports both JSON and XML formats:

```csharp
[HttpGet]
public IHttpActionResult GetPerson(int id)
{
  var person = new Person { Id = id, Name = "John Doe" };
  return Ok(person); // The format (JSON or XML) will be determined by content negotiation
}
```

- **Client Request for JSON**:

Server Response

```csharp
GET /api/person/1 HTTP/1.1
Accept: application/json
{
  "Id": 1,
  "Name": "John Doe"
}
```

- **Client Request for XML**:

Server Response

```csharp
GET /api/person/1 HTTP/1.1
Accept: application/xml
<Person>
<Id>1</Id>
<Name>John Doe</Name>
</Person>
```

### Importance of Content Negotiation

1.  **Client Flexibility**: Clients can request the format they prefer, allowing them to work with the data in the most convenient way for them.

2.  **Interoperability**: APIs can serve different clients, such as browsers, mobile apps, or other services, each of which might need the data in a different format.

3.  **Scalability**: It allows a single API endpoint to serve multiple content types without duplicating logic, making it easier to maintain and scale the application.

### Configuring Content Negotiation in Web API

In ASP.NET Web API, content negotiation can be configured and extended by adding or removing media type formatters. The framework comes with built-in formatters for JSON and XML, but you can also create custom formatters if needed.

- **Adding/Removing Formatters**:

```csharp
public static void Configure(HttpConfiguration config)
{
  // Remove the XML formatter
  config.Formatters.Remove(config.Formatters.XmlFormatter);
  // Add a custom formatter
  config.Formatters.Add(new MyCustomFormatter());
}
```

## What is MediaTypeFormatter class in Web API?

The MediaTypeFormatter class in ASP.NET Web API is a key component responsible for serializing and deserializing HTTP message bodies. It determines how data is formatted when sent to or received from the client, allowing the Web API to support multiple data formats such as JSON, XML, or custom formats.

### Key Concepts of MediaTypeFormatter

1.  **Serialization**:

    - The process of converting a .NET object into a format that can be sent over HTTP (e.g., JSON or XML).

    - MediaTypeFormatter handles the serialization process based on the content type requested by the client.

2.  **Deserialization**:

    - The process of converting the incoming HTTP request body into a .NET object.

    - The MediaTypeFormatter deserializes the request content into the appropriate .NET type based on the content type of the request.

### Built-in Media Type Formatters

ASP.NET Web API provides several built-in media type formatters:

1.  **JsonMediaTypeFormatter**:

    - Handles JSON format (application/json).

    - This is the default formatter in most Web API scenarios.

2.  **XmlMediaTypeFormatter**:

    - Handles XML format (application/xml).

    - Useful when working with clients that prefer XML over JSON.

3.  **FormUrlEncodedMediaTypeFormatter**:

    - Handles URL-encoded data (application/x-www-form-urlencoded).

    - Commonly used for processing form data in HTTP POST requests.

4.  **BsonMediaTypeFormatter**:

    - Handles BSON (Binary JSON) format (application/bson).

    - Used when compact, binary representations of JSON data are needed.

### Example Usage of MediaTypeFormatter

You can use the MediaTypeFormatter directly if you want to manually serialize or deserialize objects, though in most cases the Web API framework handles this automatically.

#### Example: Manually Serializing an Object to JSON

public HttpResponseMessage Get()

```csharp
{
  var person = new Person { Id = 1, Name = "John Doe" };
  var response = new HttpResponseMessage(HttpStatusCode.OK);
  // Use JsonMediaTypeFormatter to serialize the person object
  response.Content = new ObjectContent<Person>(person, new JsonMediaTypeFormatter());
  return response;
}
```

### Configuring Media Type Formatters

You can add, remove, or configure the media type formatters in the HttpConfiguration of your Web API:

```csharp
public static void Configure(HttpConfiguration config)
{
  // Remove the XML formatter if you don't want to support XML
  config.Formatters.Remove(config.Formatters.XmlFormatter);
  // Add a custom media type formatter
  config.Formatters.Add(new MyCustomFormatter());
  // Optionally, configure settings for a built-in formatter
  config.Formatters.JsonFormatter.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
}
```

### Custom Media Type Formatters

If you need to support a custom format that is not covered by the built-in formatters, you can create your own MediaTypeFormatter by inheriting from the MediaTypeFormatter class and overriding necessary methods like CanReadType, CanWriteType, ReadFromStreamAsync, and WriteToStreamAsync.

#### Example: Custom Formatter

```csharp
public class MyCustomFormatter : MediaTypeFormatter
{
  public MyCustomFormatter()
  {
    SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/my-custom-format"));
  }
  public override bool CanReadType(Type type)
  {
    return type == typeof(MyCustomType);
  }
  public override bool CanWriteType(Type type)
  {
    return type == typeof(MyCustomType);
  }
  public override Task<object> ReadFromStreamAsync(Type type, Stream readStream, HttpContent content, IFormatterLogger formatterLogger)
  {
    // Custom deserialization logic
  }
  public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, TransportContext transportContext)
  {
    // Custom serialization logic
  }
}
```

### Summary

- **MediaTypeFormatter** is a class in ASP.NET Web API responsible for handling the serialization and deserialization of HTTP message bodies.

- **Built-in Formatters**: Includes JSON, XML, form URL-encoded, and BSON formatters.

- **Custom Formatters**: You can create custom media type formatters by inheriting from MediaTypeFormatter.

- **Configuration**: You can configure which formatters to use in your Web API application via HttpConfiguration.

## What are Response Codes in Web API?

Response codes, also known as HTTP status codes, are standardized codes returned by a Web API to indicate the result of the client's request. These codes help the client understand whether the request was successful, if an error occurred, or if additional actions are needed.

### Categories of HTTP Response Codes

HTTP response codes are grouped into five categories based on the type of response:

1.  **1xx: Informational Responses**

    - These codes indicate that the request has been received and is being processed.

    - Example: 100 Continue

2.  **2xx: Success**

    - These codes indicate that the client's request was successfully received, understood, and accepted.

    - Example: 200 OK

3.  **3xx: Redirection**

    - These codes indicate that the client needs to take additional action to complete the request.

    - Example: 301 Moved Permanently

4.  **4xx: Client Errors**

    - These codes indicate that the client made an error in the request, such as a bad URL or unauthorized access.

    - Example: 404 Not Found

5.  **5xx: Server Errors**

    - These codes indicate that the server encountered an error while processing the request.

    - Example: 500 Internal Server Error

### Common HTTP Response Codes in Web API

Here are some of the most commonly used HTTP response codes in Web API development:

#### 1xx Informational

- **100 Continue**: The server has received the request headers, and the client should proceed to send the request body.

#### 2xx Success

- **200 OK**: The request was successful, and the response body contains the requested data.

  - Example:

```csharp
return Ok(data);
```

- **201 Created**: The request was successful, and a new resource was created as a result.

  - Example:

```csharp
return Created(new Uri(Request.RequestUri, $"api/resource/{newResource.Id}"), newResource);
```

- **204 No Content**: The request was successful, but there is no content to return.

  - Example:

```csharp
return NoContent();
```

#### 3xx Redirection

- **301 Moved Permanently**: The resource requested has been permanently moved to a new URL.

- **302 Found**: The resource requested is temporarily located at a different URL.

- **304 Not Modified**: The resource has not been modified since the last request.

#### 4xx Client Errors

- **400 Bad Request**: The server cannot process the request due to a client error (e.g., malformed request syntax).

  - Example:

```csharp
return BadRequest("Invalid input data");
```

- **401 Unauthorized**: The client must authenticate itself to get the requested response.

  - Example:

```csharp
return Unauthorized();
```

- **403 Forbidden**: The server understood the request but refuses to authorize it.

  - Example:

```csharp
return Forbid();
```

- **404 Not Found**: The requested resource could not be found on the server.

  - Example:

```csharp
return NotFound();
```

- **409 Conflict**: The request could not be processed because of a conflict in the request (e.g., a resource with the same ID already exists).

  - Example:

```csharp
return Conflict("Resource already exists");
```

#### 5xx Server Errors

- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.

  - Example:

```csharp
return StatusCode(500, "An unexpected error occurred");
```

- **502 Bad Gateway**: The server received an invalid response from the upstream server.

- **503 Service Unavailable**: The server is currently unavailable (due to overload or maintenance).

### Example Usage in ASP.NET Web API

Here's an example of how these response codes might be used in a Web API controller:

[HttpGet("{id}")]

```csharp
public IActionResult GetResource(int id)
{
  var resource = _repository.GetResourceById(id);
  if (resource == null)
  {
    return NotFound(); // 404 Not Found
  }
  return Ok(resource); // 200 OK
}
[HttpPost]
public IActionResult CreateResource([FromBody] ResourceDto resourceDto)
{
  if (!ModelState.IsValid)
  {
    return BadRequest(ModelState); // 400 Bad Request
  }
  var resource = _repository.AddResource(resourceDto);
  return CreatedAtRoute("GetResource", new { id = resource.Id }, resource); // 201 Created
}
```

### Summary

- **1xx**: Informational responses.

- **2xx**: Success responses indicate the request was successfully processed.

- **3xx**: Redirection indicates the client needs to take further action.

- **4xx**: Client errors indicate the client made a mistake in the request.

- **5xx**: Server errors indicate the server failed to fulfill a valid request.
