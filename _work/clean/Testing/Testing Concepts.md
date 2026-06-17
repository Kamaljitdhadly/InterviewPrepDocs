# Testing Concepts
## 1. Unit Testing

- **Focus**: Tests individual units or components in isolation.

- **Scope**: Smallest possible scope, typically a single function, method, or class.

- **Goal**: Verify that the unit of code works as expected in isolation, often using mock or fake dependencies.

- **Speed**: Fast, because they focus on a small part of the system without external dependencies.

- **Dependencies**: Minimal, as real services or databases are usually mocked or stubbed.

- **When to Use**: To ensure that individual units of logic are correct and handle all edge cases.

**Example**:

- Test a method in a class that calculates discounts without worrying about how it interacts with other parts of the application.

```csharp
[Fact]
public void CalculateDiscount_ShouldReturnCorrectDiscount()
{
  var result = discountService.CalculateDiscount(100, 0.10);
  Assert.Equal(90, result); // Expected: 90 (10% discount)
}
```
## 2. Integration Testing

- **Focus**: Tests how different components or modules work together.

- **Scope**: Larger scope than unit tests, typically multiple components or systems like databases, APIs, or services working in combination.

- **Goal**: Ensure that the interaction between different modules works as expected and data flows correctly between them.

- **Speed**: Slower than unit tests due to the involvement of multiple components, but faster than E2E tests.

- **Dependencies**: Requires real or simulated interactions with external components like databases, services, or APIs.

- **When to Use**: To verify that integrated components function together properly (e.g., controller and service interaction).

**Example**:

- Test how a service interacts with a database to fetch and display data in a component.

```csharp
[Fact]
public void ProductService_ShouldReturnProductList()
{
  var products = productService.GetAllProducts();
  Assert.NotEmpty(products); // Check that products are fetched from the database
}
```
## 3. End-to-End (E2E) Testing

- **Focus**: Tests the entire application flow from the user’s perspective.

- **Scope**: Largest scope, covering the entire application including frontend, backend, and databases, simulating real-world scenarios.

- **Goal**: Verify that the complete system works as expected when used in real-life situations, ensuring all components (UI, services, databases, etc.) work together properly.

- **Speed**: Slowest of the three, as it involves interacting with all parts of the system, often with real browsers and APIs.

- **Dependencies**: Real-world setup, including all services, databases, and external dependencies.

- **When to Use**: To ensure that the entire application works as expected for the end-user (e.g., adding a product to the cart and checking out).

**Example**:

- Simulate a user’s behavior: logging in, adding a product to the cart, checking out, and confirming the purchase.

```csharp
[Fact]
public void User_ShouldBeAbleToCheckout()
{
  // Open browser and navigate to the store
  _driver.Navigate().GoToUrl("https://localhost:5001/store");
  // Add item to cart
  _driver.FindElement(By.Id("AddToCart")).Click();
  // Checkout and verify the order was placed
  _driver.FindElement(By.Id("CheckoutButton")).Click();
  var confirmationMessage = _driver.FindElement(By.Id("OrderConfirmation")).Text;
  Assert.Equal("Order Confirmed", confirmationMessage);
}
```

### Key Differences

| **Feature** | **Unit Testing** | **Integration Testing** | **End-to-End Testing (E2E)** |
|----|----|----|----|
| **Focus** | Tests individual units in isolation | Tests multiple components or modules together | Tests the full application as a user would |
| **Scope** | Smallest (single method or function) | Medium (multiple components interacting) | Largest (entire application workflow) |
| **Speed** | Fast | Moderate | Slow |
| **Dependencies** | Mocked or stubbed (no real dependencies) | Real or simulated dependencies (e.g., databases, APIs) | Real-world setup (frontend, backend, database, external APIs) |
| **Goal** | Ensure that each unit of code works correctly in isolation | Ensure that components/modules interact correctly | Ensure that the entire system functions as expected for the user |
| **When to Use** | During development to ensure specific code works correctly | After units are working to ensure their integration works | For final testing to verify the complete application’s functionality |
| **Tools** | xUnit, NUnit, MSTest | xUnit, NUnit, MSTest | Selenium, Playwright, Cypress |

### Conclusion

- **Unit Testing** ensures individual pieces of code are correct.

- **Integration Testing** verifies that the interaction between various parts of the system works.

- **End-to-End Testing** ensures that the entire system functions as expected from the user’s perspective, simulating real-world usage scenarios.

### What is integration testing in .net core give me good example to understand

### Integration Testing in .NET Core

**Integration testing** ensures that various components of an application work together as expected. While unit testing focuses on testing individual components (e.g., methods or classes) in isolation, integration testing verifies that multiple components, such as services, repositories, and controllers, interact correctly.

In **.NET Core**, integration tests usually involve testing how the application’s components (like database, API controllers, or external services) behave together.

### Key Elements in .NET Core Integration Testing

1.  **Test Server:** Runs your application in-memory, allowing you to simulate real HTTP requests.

2.  **Dependency Injection:** Use a testing-specific DI setup to inject mock services if necessary.

3.  **Database Interaction:** Test whether the app interacts with a real or in-memory database.

4.  **Third-Party Services:** Test integration with external services like APIs, but often by mocking or using test accounts.

### Example of Integration Testing in .NET Core

Let's create a simple integration test for a **Web API** in a **.NET Core** project that uses Entity Framework Core to interact with a database.
## 1. Setting Up the Project

### Assume

- You have an API that manages products.

- It uses a ProductController to handle HTTP requests.

- The application uses an InMemory database for testing.
## 2. Code Example

// Product model

```csharp
public class Product
{
  public int Id { get; set; }
  public string Name { get; set; }
  public decimal Price { get; set; }
}
// ProductDbContext
public class ProductDbContext : DbContext
{
  public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }
  public DbSet<Product> Products { get; set; }
}
// ProductController
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
  private readonly ProductDbContext _context;
  public ProductController(ProductDbContext context)
  {
    _context = context;
  }
  [HttpGet]
  public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
  {
    return await _context.Products.ToListAsync();
  }
  [HttpPost]
  public async Task<ActionResult<Product>> PostProduct(Product product)
  {
    _context.Products.Add(product);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
  }
}
```
## 3. Integration Test Setup

In this test, we will:

- Set up an in-memory database.

- Use the **TestServer** provided by ASP.NET Core to make HTTP requests to the API.

```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Newtonsoft.Json;
using System.Text;
using System.Collections.Generic;
using System.Linq;
public class ProductIntegrationTests : IClassFixture<WebApplicationFactory<Startup>>
{
  private readonly HttpClient _client;
  private readonly WebApplicationFactory<Startup> _factory;
  public ProductIntegrationTests(WebApplicationFactory<Startup> factory)
  {
    _factory = factory.WithWebHostBuilder(builder =>
    {
      builder.ConfigureServices(services =>
      {
        var descriptor = services.SingleOrDefault(
        d => d.ServiceType == typeof(DbContextOptions<ProductDbContext>));
        services.Remove(descriptor);
        services.AddDbContext<ProductDbContext>(options =>
        {
          options.UseInMemoryDatabase("InMemoryDbForTesting");
        });
      });
    });
    _client = _factory.CreateClient();
  }
  [Fact]
  public async Task GetProducts_ReturnsEmptyList_WhenNoProductsExist()
  {
    // Act
    var response = await _client.GetAsync("/api/Product");
    // Assert
    response.EnsureSuccessStatusCode();
    var stringResponse = await response.Content.ReadAsStringAsync();
    var products = JsonConvert.DeserializeObject<IEnumerable<Product>>(stringResponse);
    Assert.Empty(products);
  }
  [Fact]
  public async Task PostProduct_AddsProductSuccessfully()
  {
    // Arrange
    var product = new Product { Name = "Test Product", Price = 10.0m };
    var jsonContent = new StringContent(JsonConvert.SerializeObject(product), Encoding.UTF8, "application/json");
    // Act
    var postResponse = await _client.PostAsync("/api/Product", jsonContent);
    postResponse.EnsureSuccessStatusCode();
    var getResponse = await _client.GetAsync("/api/Product");
    getResponse.EnsureSuccessStatusCode();
    var stringResponse = await getResponse.Content.ReadAsStringAsync();
    var products = JsonConvert.DeserializeObject<IEnumerable<Product>>(stringResponse);
    // Assert
    Assert.Single(products);
    Assert.Equal("Test Product", products.First().Name);
  }
}
```

### Key Concepts in the Example

- **WebApplicationFactory<Startup>:** Spins up an in-memory version of the web app for testing.

- **HttpClient:** Used to make real HTTP requests to your in-memory app.

- **InMemoryDatabase:** Replaces the actual database to avoid side effects during testing.

- **Xunit [Fact]:** Marks individual test cases that are automatically executed.

### Flow

1.  The GetProducts_ReturnsEmptyList_WhenNoProductsExist test verifies that the GET /api/Product endpoint returns an empty list when no products exist.

2.  The PostProduct_AddsProductSuccessfully test verifies that after a POST /api/Product request, the product is successfully added and returned by the GET /api/Product endpoint.

### Conclusion

In **integration testing** for .NET Core, you test how different components, like your API controllers and the database, work together. You can simulate real-world interactions with your application using TestServer and HttpClient, ensuring your application behaves as expected when multiple parts are combined.

4o

### You said

what is unit testing in .net core give me good example to understand

### ChatGPT said

ChatGPT

### Unit Testing in .NET Core

**Unit testing** is a type of software testing where individual units or components of the application are tested in isolation. In **.NET Core**, unit tests focus on testing specific methods or classes to ensure they behave as expected, without depending on external services like databases, file systems, or APIs.

### Key Concepts of Unit Testing in .NET Core

1.  **Isolation:** Each unit test should focus on a single component or function, without dependencies on external resources.

2.  **Mocking:** Dependencies (like services or repositories) can be mocked to isolate the behavior of the unit being tested.

3.  **Assertion:** After running the test, assertions are used to check if the actual result matches the expected result.

### Example of Unit Testing in .NET Core

Let’s create a basic example for unit testing a service in a **.NET Core** project.

### Scenario

We have a **ProductService** that performs business logic on products and interacts with a repository (data access layer). We'll write unit tests for this service without depending on an actual database.
## 1. Service Code

// Product model

```csharp
public class Product
{
  public int Id { get; set; }
  public string Name { get; set; }
  public decimal Price { get; set; }
}
// ProductService
public interface IProductService
{
  Product GetProductById(int id);
  decimal CalculateDiscount(Product product, decimal discountPercentage);
}
public class ProductService : IProductService
{
  private readonly IProductRepository _productRepository;
  public ProductService(IProductRepository productRepository)
  {
    _productRepository = productRepository;
  }
  public Product GetProductById(int id)
  {
    return _productRepository.GetById(id);
  }
  public decimal CalculateDiscount(Product product, decimal discountPercentage)
  {
    if (discountPercentage < 0 || discountPercentage > 100)
    throw new ArgumentOutOfRangeException("Discount percentage must be between 0 and 100.");
    return product.Price - (product.Price * (discountPercentage / 100));
  }
}
// ProductRepository
public interface IProductRepository
{
  Product GetById(int id);
}
```
## 2. Unit Test Setup

Now, let’s write unit tests for the ProductService. We'll mock the IProductRepository dependency to isolate the service behavior.

We will use **XUnit** for testing and **Moq** for mocking dependencies.
## 3. Unit Test Example

```csharp
using Moq;
using Xunit;
public class ProductServiceTests
{
  private readonly Mock<IProductRepository> _mockRepository;
  private readonly ProductService _productService;
  public ProductServiceTests()
  {
    _mockRepository = new Mock<IProductRepository>();
    _productService = new ProductService(_mockRepository.Object);
  }
  [Fact]
  public void GetProductById_ShouldReturnProduct_WhenProductExists()
  {
    // Arrange
    var productId = 1;
    var product = new Product { Id = productId, Name = "Test Product", Price = 100.0m };
    _mockRepository.Setup(repo => repo.GetById(productId)).Returns(product);
    // Act
    var result = _productService.GetProductById(productId);
    // Assert
    Assert.NotNull(result);
    Assert.Equal("Test Product", result.Name);
    Assert.Equal(100.0m, result.Price);
  }
  [Fact]
  public void CalculateDiscount_ShouldReturnCorrectDiscountedPrice()
  {
    // Arrange
    var product = new Product { Id = 1, Name = "Test Product", Price = 100.0m };
    var discountPercentage = 10;
    // Act
    var discountedPrice = _productService.CalculateDiscount(product, discountPercentage);
    // Assert
    Assert.Equal(90.0m, discountedPrice);
  }
  [Fact]
  public void CalculateDiscount_ShouldThrowArgumentOutOfRangeException_WhenDiscountIsInvalid()
  {
    // Arrange
    var product = new Product { Id = 1, Name = "Test Product", Price = 100.0m };
    // Act & Assert
    Assert.Throws<ArgumentOutOfRangeException>(() => _productService.CalculateDiscount(product, -5));
    Assert.Throws<ArgumentOutOfRangeException>(() => _productService.CalculateDiscount(product, 150));
  }
}
```

### Key Concepts in the Unit Test Example

1.  **Moq Library**: We use Moq to mock the IProductRepository. This ensures the service is tested in isolation, without interacting with the real data layer.

```csharp
_mockRepository = new Mock<IProductRepository>();
```

2.  **Setup Method**: Using the Setup method of Moq, we specify the behavior of the mocked repository when the GetById method is called with a specific productId.

```csharp
_mockRepository.Setup(repo => repo.GetById(productId)).Returns(product);
```

3.  **Assertions**: In each test, we use assertions to verify that the actual result matches the expected result.

    - Assert.NotNull(result) ensures that a valid product is returned.

    - Assert.Equal(90.0m, discountedPrice) checks if the correct discounted price is calculated.

4.  **Exception Testing**: In the last test case, we use Assert.Throws<ArgumentOutOfRangeException> to ensure that invalid discount percentages throw the expected exception.

### Explanation of Each Test

1.  **GetProductById_ShouldReturnProduct_WhenProductExists**:

    - This test verifies that the GetProductById method returns the correct product when a valid product ID is provided.

    - We mock the IProductRepository.GetById method to return a predefined product.

2.  **CalculateDiscount_ShouldReturnCorrectDiscountedPrice**:

    - This test checks if the CalculateDiscount method correctly calculates the discounted price based on the given percentage.

    - We pass a product with a price of 100 and apply a 10% discount, so the expected discounted price is 90.

3.  **CalculateDiscount_ShouldThrowArgumentOutOfRangeException_WhenDiscountIsInvalid**:

    - This test ensures that invalid discount percentages (less than 0 or greater than 100) result in an ArgumentOutOfRangeException.

### Conclusion

**Unit testing** in .NET Core focuses on testing individual methods or components in isolation. Using mocking frameworks like **Moq**, you can replace dependencies with mock objects to ensure tests remain isolated and independent of external factors. In this example, we tested both the normal and edge cases for methods in a service, ensuring the business logic behaves as expected under different scenarios.

4o

### You said

what is integration testing in angulare give me good example to understand

### ChatGPT said

ChatGPT

Memory updated

### Integration Testing in Angular

**Integration testing** in Angular verifies how various parts of an application work together, such as services, components, and the DOM. It ensures that different modules or components interact correctly and that the application behaves as expected when integrated.

In **unit testing**, individual components are tested in isolation using mocks or stubs for dependencies. In contrast, **integration testing** tests multiple components together, often with real services or minimal stubbing, ensuring everything works when combined.

### Example Scenario

Let's assume we have a simple Angular app with:

- A **ProductListComponent** that displays a list of products.

- A **ProductService** that fetches product data from an API.

- The goal of the integration test is to ensure that the component correctly renders the product data from the service.
## 1. Application Code

Here's a basic Angular setup for the ProductService and ProductListComponent.

// product.model.ts

```csharp
export interface Product {
  id: number;
  name: string;
  price: number;
}
// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.model';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('https://api.example.com/products');
  }
}
// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from './product.model';
@Component({
  selector: 'app-product-list',
  template: `
  <ul *ngIf="products.length > 0">
  <li *ngFor="let product of products">{{ product.name }} - ${{ product.price }}</li>
  </ul>
  <p *ngIf="products.length === 0">No products available.</p>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }
}
```
## 2. Integration Test Example

To test how the ProductListComponent and ProductService work together, we’ll create an **integration test**. We will simulate HTTP requests and ensure that the component renders product data correctly.

Here's how to set up an integration test for the ProductListComponent:

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductListComponent } from './product-list.component';

import { ProductService } from './product.service';

import { Product } from './product.model';

import { By } from '@angular/platform-browser';

```csharp
describe('ProductListComponent Integration Test', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let httpTestingController: HttpTestingController;
  let mockProducts: Product[];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    mockProducts = [
    { id: 1, name: 'Product A', price: 50 },
    { id: 2, name: 'Product B', price: 100 },
    ];
  });
  it('should display a list of products when the service fetches data', () => {
    // Trigger ngOnInit
    fixture.detectChanges();
    // Expect an HTTP request and respond with mock data
    const req = httpTestingController.expectOne('https://api.example.com/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
    // Detect changes after the mock data is set
    fixture.detectChanges();
    // Get the rendered product list elements
    const productListItems = fixture.debugElement.queryAll(By.css('li'));
    expect(productListItems.length).toBe(2);
    // Check the content of the rendered list
    expect(productListItems[0].nativeElement.textContent).toContain('Product A - $50');
    expect(productListItems[1].nativeElement.textContent).toContain('Product B - $100');
  });
  afterEach(() => {
    // Ensure no outstanding HTTP requests
    httpTestingController.verify();
  });
});
```

### Explanation of Key Concepts

1.  **HttpClientTestingModule:** This is used to mock HTTP requests during testing. It ensures we can test the behavior of components that rely on HTTP services without actually hitting a real API.

```typescript
imports: [HttpClientTestingModule],
```

2.  **HttpTestingController:** This is a testing tool provided by HttpClientTestingModule to mock and assert HTTP requests. It allows us to simulate API responses and verify that the service is making the expected HTTP calls.

```typescript
httpTestingController = TestBed.inject(HttpTestingController);
```

3.  **Mocking HTTP Requests:** The HttpTestingController.expectOne() method expects an HTTP request to a specific URL and allows us to provide a mock response.

```typescript
const req = httpTestingController.expectOne('https://api.example.com/products');
req.flush(mockProducts);
```

4.  **Component Rendering:** After the mock HTTP response is flushed, we call fixture.detectChanges() to ensure the component re-renders with the new data. Then, we use Angular's By.css() selector to query the DOM for the rendered list items and verify their content.

```typescript
const productListItems = fixture.debugElement.queryAll(By.css('li'));
```

### Flow of the Test

1.  **Setup:** The ProductListComponent is created and the HTTP call is mocked using HttpTestingController.

2.  **ngOnInit Call:** The component's ngOnInit is triggered by calling fixture.detectChanges(), which simulates the component’s initialization process.

3.  **Simulated HTTP Response:** We mock the API response using req.flush() to return a predefined list of products.

4.  **Check Rendering:** The component should now have rendered the list of products, and we verify this by querying the DOM for list items and checking their content.

5.  **Verification:** Ensure no outstanding HTTP requests are pending by calling httpTestingController.verify().

### Conclusion

In **integration testing** in Angular, you test how components, services, and other parts of the app work together. Using tools like HttpClientTestingModule, you can simulate real HTTP requests and responses, ensuring the component's behavior matches expectations in a fully integrated setup. This example verifies that the ProductListComponent fetches data correctly from the ProductService and renders it in the template.

4o

### You said

what is end to end testing in .net core give me good example to understand

### ChatGPT said

ChatGPT

### End-to-End (E2E) Testing in .NET Core

**End-to-End (E2E) testing** is a type of testing that simulates real user scenarios by testing the entire flow of an application, from start to finish. It ensures that the application’s workflow works as expected by interacting with all layers, including the UI, backend, database, APIs, and other external services.

In **E2E testing** for a **.NET Core** application, the test simulates user actions, verifying that all parts of the system work together. Unlike unit tests or integration tests, E2E tests are concerned with the entire system’s functionality rather than isolated components.

### Example Scenario

Let’s consider a **.NET Core MVC or WebAPI** application where users can view, create, update, and delete products.

For **E2E testing**, we will simulate a user’s interaction, such as:

1.  Navigating to the product list page.

2.  Creating a new product.

3.  Checking if the new product appears in the product list.

4.  Updating the product information.

5.  Deleting the product.

For E2E testing, we can use tools like **Selenium** for browser automation or **Playwright** to automate UI tests in a .NET Core web application.
## 1. Using Selenium for E2E Testing

Here’s an example of an E2E test using **Selenium** to automate a browser and interact with a **.NET Core** application.

### Setup

You’ll need to install the **Selenium WebDriver** and **Selenium.Support** NuGet packages:

dotnet add package Selenium.WebDriver

dotnet add package Selenium.Support

You'll also need a browser driver like **ChromeDriver** to control Chrome during tests.
## 2. E2E Test Example with Selenium

This example shows how to test a basic product creation flow.

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Xunit;
public class ProductEndToEndTests : IDisposable
{
  private readonly IWebDriver _driver;
  public ProductEndToEndTests()
  {
    // Setup WebDriver (Chrome in this case)
    _driver = new ChromeDriver();
    _driver.Navigate().GoToUrl("https://localhost:5001"); // URL of your .NET Core application
  }
  [Fact]
  public void CreateProduct_ShouldAddProductToList()
  {
    // Navigate to the product creation page
    _driver.FindElement(By.LinkText("Create New Product")).Click();
    // Fill out the form
    _driver.FindElement(By.Id("Name")).SendKeys("Test Product");
    _driver.FindElement(By.Id("Price")).SendKeys("99.99");
    _driver.FindElement(By.Id("Description")).SendKeys("Test Description");
    // Submit the form
    _driver.FindElement(By.CssSelector("button[type='submit']")).Click();
    // Check if the product was added to the list
    var productList = _driver.FindElement(By.Id("product-list"));
    Assert.Contains("Test Product", productList.Text);
  }
  [Fact]
  public void DeleteProduct_ShouldRemoveProductFromList()
  {
    // Navigate to the product list
    _driver.Navigate().GoToUrl("https://localhost:5001/products");
    // Click the delete button for the first product
    _driver.FindElement(By.CssSelector("button.delete-product")).Click();
    // Confirm deletion (handling alert)
    _driver.SwitchTo().Alert().Accept();
    // Check if the product was removed from the list
    var productList = _driver.FindElement(By.Id("product-list"));
    Assert.DoesNotContain("Test Product", productList.Text);
  }
  public void Dispose()
  {
    // Cleanup the WebDriver after test execution
    _driver.Quit();
  }
}
```

### Explanation

1.  **Selenium WebDriver**: The WebDriver is used to automate the browser. In this case, we use **ChromeDriver** to automate Chrome.

```csharp
_driver = new ChromeDriver();
```

2.  **Navigation**: The Navigate().GoToUrl() method is used to load the URL of your .NET Core web application.

```csharp
_driver.Navigate().GoToUrl("https://localhost:5001");
```

3.  **Interacting with Elements**: We use various By selectors to locate elements on the page and interact with them. For example, finding form input fields by their Id and sending keystrokes:

```csharp
_driver.FindElement(By.Id("Name")).SendKeys("Test Product");
```

4.  **Submitting Forms**: The form is submitted by finding the submit button using a CSS selector.

```csharp
_driver.FindElement(By.CssSelector("button[type='submit']")).Click();
```

5.  **Assertions**: After performing actions, assertions are made to verify the expected outcome, such as checking if the product appears in the product list.

```csharp
Assert.Contains("Test Product", productList.Text);
```

6.  **Disposing Resources**: Once the test is complete, the Dispose method is called to close the browser and clean up resources.

```csharp
_driver.Quit();
```
## 3. Advanced E2E Testing with Playwright

Alternatively, you can use **Playwright** for more advanced E2E testing. Playwright supports modern web features, parallel execution, and can handle multiple browsers (Chrome, Firefox, Safari).

### Example with Playwright

dotnet add package Microsoft.Playwright

```csharp
using Microsoft.Playwright;
using Xunit;
public class ProductEndToEndTests : IAsyncLifetime
{
  private IBrowser _browser;
  private IPage _page;
  public async Task InitializeAsync()
  {
    // Setup Playwright and browser
    var playwright = await Playwright.CreateAsync();
    _browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = false });
    _page = await _browser.NewPageAsync();
    await _page.GotoAsync("https://localhost:5001");
  }
  [Fact]
  public async Task CreateProduct_ShouldAddProductToList()
  {
    // Navigate and fill out the form
    await _page.ClickAsync("text=Create New Product");
    await _page.FillAsync("#Name", "Test Product");
    await _page.FillAsync("#Price", "99.99");
    await _page.FillAsync("#Description", "Test Description");
    // Submit form and check if product is added to the list
    await _page.ClickAsync("button[type='submit']");
    var productListText = await _page.TextContentAsync("#product-list");
    Assert.Contains("Test Product", productListText);
  }
  public async Task DisposeAsync()
  {
    // Cleanup resources after tests
    await _browser.CloseAsync();
  }
}
```

### Explanation of Playwright Example

1.  **Playwright Setup**: Playwright launches a browser and opens a new page. This can be done in **headless mode** (without a UI) or with the UI visible for debugging purposes.

```csharp
_browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = false });
```

2.  **Interaction with Elements**: Similar to Selenium, Playwright provides methods to interact with elements, such as ClickAsync(), FillAsync(), and TextContentAsync() for clicking buttons, filling out forms, and getting text from the page.

```csharp
await _page.FillAsync("#Name", "Test Product");
```

3.  **Assertions**: After actions, assertions ensure that the expected result, such as the product appearing in the list, is correct.

```csharp
Assert.Contains("Test Product", productListText);
```

### Conclusion

**End-to-End (E2E) testing** in .NET Core allows you to simulate real user actions and verify that all components of the system (UI, backend, database) work together. Tools like **Selenium** and **Playwright** enable browser automation, allowing you to test user scenarios from a high-level perspective, ensuring the overall system behaves as expected.

E2E testing focuses on the application's behavior as a whole and ensures that each part of the system (frontend and backend) works well together, covering the entire user workflow.
