# Testing Concepts

## 1. Unit Testing

- **Focus**: Individual units/components in isolation
- **Scope**: Single function, method, or class
- **Goal**: Verify unit behavior; mock/fake dependencies
- **Speed**: Fast — no external dependencies
- **Dependencies**: Minimal — services/DBs mocked or stubbed
- **When to Use**: Validate logic and edge cases per unit

**Example**: Test discount calculation without other app parts.

```csharp
[Fact]
public void CalculateDiscount_ShouldReturnCorrectDiscount()
{
  var result = discountService.CalculateDiscount(100, 0.10);
  Assert.Equal(90, result); // Expected: 90 (10% discount)
}
```

## 2. Integration Testing

- **Focus**: How components/modules work together
- **Scope**: Multiple components — DB, APIs, services combined
- **Goal**: Correct interaction and data flow between modules
- **Speed**: Slower than unit; faster than E2E
- **Dependencies**: Real or simulated DB, services, APIs
- **When to Use**: Verify integrated behavior (e.g., controller + service)

**Example**: Service fetches data from a database for display.

```csharp
[Fact]
public void ProductService_ShouldReturnProductList()
{
  var products = productService.GetAllProducts();
  Assert.NotEmpty(products); // Check that products are fetched from the database
}
```

## 3. End-to-End (E2E) Testing

- **Focus**: Full application flow from user perspective
- **Scope**: Frontend, backend, DB — real-world scenarios
- **Goal**: Entire system works as users expect
- **Speed**: Slowest — real browsers, APIs, full stack
- **Dependencies**: Real-world setup (all services, DBs, externals)
- **When to Use**: Validate end-user workflows (login → cart → checkout)

**Example**: User logs in, adds product, checks out, confirms purchase.

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

| **Feature** | **Unit Testing** | **Integration Testing** | **End-to-End Testing (E2E)** |
|----|----|----|----|
| **Focus** | Tests individual units in isolation | Tests multiple components or modules together | Tests the full application as a user would |
| **Scope** | Smallest (single method or function) | Medium (multiple components interacting) | Largest (entire application workflow) |
| **Speed** | Fast | Moderate | Slow |
| **Dependencies** | Mocked or stubbed (no real dependencies) | Real or simulated dependencies (e.g., databases, APIs) | Real-world setup (frontend, backend, database, external APIs) |
| **Goal** | Ensure that each unit of code works correctly in isolation | Ensure that components/modules interact correctly | Ensure that the entire system functions as expected for the user |
| **When to Use** | During development to ensure specific code works correctly | After units are working to ensure their integration works | For final testing to verify the complete application’s functionality |
| **Tools** | xUnit, NUnit, MSTest | xUnit, NUnit, MSTest | Selenium, Playwright, Cypress |

- **Unit**: Individual pieces correct in isolation
- **Integration**: Parts interact correctly
- **E2E**: Full system works from user perspective

### Integration Testing in .NET Core

Verifies multiple components (services, repositories, controllers) work together — unlike unit tests that isolate single components.

**Key elements**: **Test Server** (in-memory HTTP), **DI** (test-specific setup/mocks), **Database** (real or in-memory), **Third-party services** (mocked or test accounts).

Product API example using EF Core and in-memory DB.

## 1. Setting Up the Project

- API manages products via **ProductController**
- **InMemory** database for testing

## 2. Code Example

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

In-memory DB + **TestServer** for HTTP requests to the API.

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

**Key concepts**: **WebApplicationFactory<Startup>** — in-memory app; **HttpClient** — real HTTP to in-memory app; **InMemoryDatabase** — no side effects; **Xunit [Fact]** — auto-executed tests.

**Flow**: (1) GET returns empty list when no products; (2) POST then GET confirms product added.

### Unit Testing in .NET Core

Tests methods/classes in isolation — no real DB, filesystem, or APIs. **Isolation**, **Mocking** (Moq), **Assertions** (expected vs actual).

**Scenario**: **ProductService** with business logic + **IProductRepository** — unit test without real DB.

## 1. Service Code

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

Mock **IProductRepository** with **XUnit** + **Moq**.

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

**Moq concepts**:

1. **Mock repository** — isolate service from data layer:

```csharp
_mockRepository = new Mock<IProductRepository>();
```

2. **Setup** — define mock behavior for `GetById`:

```csharp
_mockRepository.Setup(repo => repo.GetById(productId)).Returns(product);
```

3. **Assertions** — `Assert.NotNull`, `Assert.Equal(90.0m, discountedPrice)`
4. **Exception testing** — `Assert.Throws<ArgumentOutOfRangeException>` for invalid discount (-5, 150)

**Tests**: (1) `GetProductById` returns mocked product; (2) 10% discount on 100 → 90; (3) invalid percentages throw.

### Integration Testing in Angular

Tests components + services + DOM together (vs unit tests with heavy mocking). **ProductListComponent** + **ProductService** — verify component renders API data.

## 1. Application Code

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

Simulate HTTP; verify component renders product list.

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

**Key tools**:

- **HttpClientTestingModule** — mock HTTP without real API:

```typescript
imports: [HttpClientTestingModule],
```

- **HttpTestingController** — inject to assert/mock requests:

```typescript
httpTestingController = TestBed.inject(HttpTestingController);
```

- **expectOne + flush** — simulate API response:

```typescript
const req = httpTestingController.expectOne('https://api.example.com/products');
req.flush(mockProducts);
```

- **DOM query** — verify rendered list items:

```typescript
const productListItems = fixture.debugElement.queryAll(By.css('li'));
```

**Flow**: Setup → `detectChanges()` (ngOnInit) → mock HTTP response → re-render → assert DOM → `verify()` no pending requests.

### End-to-End (E2E) Testing in .NET Core

Simulates real user flows across UI, backend, DB, APIs. Tests entire system — not isolated components.

**Scenario** (.NET Core MVC/WebAPI products CRUD): navigate list → create → verify in list → update → delete. Tools: **Selenium**, **Playwright**.

## 1. Using Selenium for E2E Testing

**Packages**: `Selenium.WebDriver`, `Selenium.Support` + browser driver (e.g., **ChromeDriver**).

## 2. E2E Test Example with Selenium

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

**Selenium patterns**:

- **WebDriver** — automate browser:

```csharp
_driver = new ChromeDriver();
```

- **Navigate** — load app URL:

```csharp
_driver.Navigate().GoToUrl("https://localhost:5001");
```

- **Find + interact** — locate elements by Id/CSS:

```csharp
_driver.FindElement(By.Id("Name")).SendKeys("Test Product");
```

- **Submit** — click submit button:

```csharp
_driver.FindElement(By.CssSelector("button[type='submit']")).Click();
```

- **Assert** — verify outcome in DOM:

```csharp
Assert.Contains("Test Product", productList.Text);
```

- **Dispose** — close browser:

```csharp
_driver.Quit();
```

## 3. Advanced E2E Testing with Playwright

Modern alternative — parallel execution, multi-browser. Package: `Microsoft.Playwright`.

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

**Playwright patterns**:

- **Launch** — headless or visible browser:

```csharp
_browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = false });
```

- **Interact** — `ClickAsync`, `FillAsync`, `TextContentAsync`:

```csharp
await _page.FillAsync("#Name", "Test Product");
```

- **Assert** — verify product in list:

```csharp
Assert.Contains("Test Product", productListText);
```

E2E validates full user workflows — UI + backend + DB — via browser automation (Selenium or Playwright).
