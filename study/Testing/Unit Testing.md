# Unit Testing

## Questions Covered

1. What is unit testing, and what makes a good unit test?
2. What is the test pyramid, and where do unit tests fit?
3. How do xUnit, NUnit, and MSTest compare in .NET?
4. What are Arrange-Act-Assert (AAA) and Given-When-Then?
5. What is a test double — mock, stub, fake, and spy?
6. How do you mock dependencies with Moq in .NET?
7. How do you unit test async code in C#?
8. What are parameterized tests and theory data?
9. How do you unit test with Jest in TypeScript/React?
10. What is test coverage, and what is a sensible target?
11. What makes code hard to unit test, and how do you fix it?
12. How do you test exceptions and edge cases?

## What is unit testing, and what makes a good unit test?

**Unit testing** verifies a single unit of behavior (method, class, pure function) **in isolation** — external I/O is mocked or avoided.

| Good unit test | Bad unit test |
|----------------|---------------|
| Fast (< 10 ms typical) | Hits real DB or network |
| Deterministic | Depends on clock or random without control |
| One logical assertion focus | Tests entire stack |
| Readable name describes scenario | `Test1`, `MethodWorks` |
| Independent (any order) | Shared mutable global state |

```csharp
// Good — tests discount logic only
[Fact]
public void CalculateDiscount_WhenTenPercent_ReturnsNinety()
{
    var sut = new DiscountService();
    var result = sut.Apply(100m, 0.10m);
    Assert.Equal(90m, result);
}
```

**FIRST:** Fast, Independent, Repeatable, Self-validating, Timely (write with or just after code).

## What is the test pyramid, and where do unit tests fit?

```text
        /\
       /E2E\        few, slow, high confidence
      /------\
     /Integr.\     some, medium speed
    /----------\
   /   Unit     \  many, fast, narrow scope
  /--------------\
```

| Layer | Ratio (rule of thumb) | Purpose |
|-------|----------------------|---------|
| **Unit** | ~70% | Logic, branches, edge cases |
| **Integration** | ~20% | DB, HTTP, messaging wiring |
| **E2E** | ~10% | Critical user journeys |

Unit tests are the **base** — cheap feedback on every commit.

## How do xUnit, NUnit, and MSTest compare in .NET?

| Feature | xUnit | NUnit | MSTest |
|---------|-------|-------|--------|
| **Default in .NET SDK templates** | ✓ | | |
| **Test method attr** | `[Fact]`, `[Theory]` | `[Test]`, `[TestCase]` | `[TestMethod]`, `[DataRow]` |
| **Parallel by default** | ✓ (per class) | Configurable | Limited |
| **Fixture lifecycle** | Constructor + `IDisposable` | `[SetUp]` / `[TearDown]` | `[TestInitialize]` |

```csharp
// xUnit — most common in modern .NET
public class OrderTests
{
    [Theory]
    [InlineData(0, false)]
    [InlineData(1, true)]
    public void IsValidQuantity(int qty, bool expected)
        => Assert.Equal(expected, OrderValidator.IsValidQuantity(qty));
}
```

**Interview tip:** xUnit is the default choice for new ASP.NET Core projects; know `[Fact]` vs `[Theory]`.

## What are Arrange-Act-Assert (AAA) and Given-When-Then?

Both structure tests for readability:

```csharp
[Fact]
public void AddItem_IncreasesCartTotal()
{
    // Arrange
    var cart = new Cart();
    var item = new CartItem { Price = 10m, Quantity = 2 };

    // Act
    cart.Add(item);

    // Assert
    Assert.Equal(20m, cart.Total);
}
```

**Given-When-Then** (BDD style) maps to the same phases — often used in spec names: `GivenEmptyCart_WhenAddTwoItems_ThenTotalIsTwenty`.

## What is a test double — mock, stub, fake, and spy?

| Double | Purpose | Example |
|--------|---------|---------|
| **Stub** | Returns canned answers | `GetById` always returns fixed user |
| **Mock** | Verifies interactions were called | Assert `Save` called once |
| **Fake** | Working simplified impl | In-memory repository |
| **Spy** | Records calls on real/partial object | Wrapper around logger |

Use **stubs** for state verification; **mocks** for behavior verification — avoid over-mocking (testing implementation, not outcome).

## How do you mock dependencies with Moq in .NET?

```csharp
public class OrderServiceTests
{
    [Fact]
    public void PlaceOrder_CallsRepositorySave()
    {
        var repo = new Mock<IOrderRepository>();
        repo.Setup(r => r.Save(It.IsAny<Order>()))
            .ReturnsAsync(1);

        var sut = new OrderService(repo.Object);
        await sut.PlaceOrder(new Order { CustomerId = 42 });

        repo.Verify(r => r.Save(It.Is<Order>(o => o.CustomerId == 42)), Times.Once);
    }
}
```

| Moq API | Use |
|---------|-----|
| `Setup(...).Returns(...)` | Stub return value |
| `Setup(...).Throws(...)` | Error paths |
| `Verify(..., Times.Once)` | Interaction assertion |
| `It.IsAny<T>()` | Match any argument |

Register `Moq` + `Microsoft.NET.Test.Sdk` + `xunit` in test project.

## How do you unit test async code in C#?

```csharp
[Fact]
public async Task GetUserAsync_WhenFound_ReturnsUser()
{
    var repo = new Mock<IUserRepository>();
    repo.Setup(r => r.GetByIdAsync(1))
        .ReturnsAsync(new User { Id = 1, Name = "Ada" });

    var sut = new UserService(repo.Object);
    var user = await sut.GetUserAsync(1);

    Assert.Equal("Ada", user.Name);
}
```

- Test methods return `Task` or `Task<T>` (xUnit supports async `[Fact]`).
- Avoid `.Result` / `.Wait()` in tests — can deadlock.
- Use `Assert.ThrowsAsync<T>` for async exceptions.

## What are parameterized tests and theory data?

Run one test logic with multiple inputs:

```csharp
public class PasswordValidatorTests
{
    public static IEnumerable<object[]> WeakPasswords =>
        new List<object[]>
        {
            new object[] { "" },
            new object[] { "123" },
            new object[] { "password" },
        };

    [Theory]
    [MemberData(nameof(WeakPasswords))]
    public void Validate_RejectsWeakPassword(string password)
        => Assert.False(PasswordValidator.IsStrong(password));
}
```

Jest equivalent: `test.each([[''], ['123']])('rejects %s', ...)`.

## How do you unit test with Jest in TypeScript/React?

```typescript
// sum.ts
export function sum(a: number, b: number) {
  return a + b;
}

// sum.test.ts
import { sum } from './sum';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

**React component** (React Testing Library — test behavior, not implementation):

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('increments count on click', async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole('button', { name: /increment/i }));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

| Tool | Role |
|------|------|
| **Jest / Vitest** | Runner + assertions |
| **@testing-library/react** | DOM-centric component tests |
| **msw** | Mock HTTP at network boundary |

## What is test coverage, and what is a sensible target?

**Coverage** measures which lines/branches execute during tests — not quality of assertions.

| Metric | Meaning |
|--------|---------|
| **Line** | Lines executed |
| **Branch** | if/else paths taken |
| **Mutation testing** | Are assertions meaningful? (Stryker, etc.) |

**Pragmatic target:** 70–80% on business logic; 100% on critical paths (payments, auth). Don't chase 100% everywhere — diminishing returns.

```bash
dotnet test /p:CollectCoverage=true
npm test -- --coverage
```

## What makes code hard to unit test, and how do you fix it?

| Problem | Fix |
|---------|-----|
| Static singletons | Inject dependencies (DI) |
| `new SqlConnection()` in method | Constructor injection of `IDbConnection` factory |
| God classes | Single responsibility, smaller units |
| DateTime.UtcNow | Inject `TimeProvider` / `IClock` |
| Private logic untestable | Extract pure functions |

**Design for testability:** depend on **interfaces**, keep domain logic **free of I/O**.

## How do you test exceptions and edge cases?

```csharp
[Fact]
public void Divide_ByZero_Throws()
{
    var sut = new Calculator();
    Assert.Throws<DivideByZeroException>(() => sut.Divide(1, 0));
}

[Fact]
public async Task GetUser_NotFound_ThrowsNotFoundException()
{
    var repo = new Mock<IUserRepository>();
    repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

    var sut = new UserService(repo.Object);
    await Assert.ThrowsAsync<NotFoundException>(() => sut.GetUserAsync(99));
}
```

Cover: null inputs, empty collections, boundary values (0, max int), concurrent access where relevant.

## Related Topics

- Testing Integration Testing.md
- Testing E2E Testing.md
- Testing Test Pyramid and Best Practices.md
- React/React Testing.md
- C#/C# SOLID Principles.md
