# Test Pyramid and Best Practices

## Questions Covered

1. What is the test pyramid, and why does it matter?
2. What is the testing trophy vs ice cream cone anti-pattern?
3. What is TDD (Test-Driven Development)?
4. What is BDD, and how does it relate to testing?
5. What is shift-left testing?
6. How do you name tests and organize test projects?
7. What is test isolation and shared fixture strategy?
8. How do you handle flaky tests in a team?
9. What is mutation testing?
10. How do testing practices differ in microservices?
11. What is contract testing (Pact)?
12. How do you balance speed and confidence in CI?

## What is the test pyramid, and why does it matter?

Mike Cohn's **test pyramid** guides investment: many fast tests at the bottom, fewer slow tests at the top.

```text
           E2E          ← expensive, full stack
        Integration    ← API + DB + messaging
           Unit        ← logic, fast feedback
```

| Layer | % of tests (guide) | Run on every commit? |
|-------|-------------------|----------------------|
| Unit | ~70% | Yes |
| Integration | ~20% | Yes (or PR merge) |
| E2E | ~10% | Main branch / nightly / pre-release |

**Goal:** Fail fast cheaply; reserve expensive tests for high-risk paths.

## What is the testing trophy vs ice cream cone anti-pattern?

| Model | Shape | Meaning |
|-------|-------|---------|
| **Pyramid** | Wide base | Many unit tests |
| **Trophy** (Kent C. Dodds) | Wide integration | RTL + MSW integration emphasis for UI |
| **Ice cream cone** (anti) | Wide E2E | Too many UI tests, few unit — slow, flaky CI |

For **React SPAs**, integration tests with MSW often give better ROI than heavy E2E — still keep a small E2E smoke set.

## What is TDD (Test-Driven Development)?

**Red → Green → Refactor:**

1. Write a failing test for the next behavior.
2. Write minimal code to pass.
3. Refactor without changing behavior.

```csharp
// Red
[Fact]
public void IsEligible_Adult_ReturnsTrue()
    => Assert.True(AgeValidator.IsEligible(18));

// Green — implement IsEligible
// Refactor — extract constants, simplify
```

| Benefit | Caveat |
|---------|--------|
| Design feedback | Learning curve |
| Living documentation | Not for spikes/prototypes |
| Regression safety | TDD ≠ no integration tests |

## What is BDD, and how does it relate to testing?

**Behavior-Driven Development** describes behavior in business language — often Gherkin:

```gherkin
Feature: Discounts
  Scenario: VIP customer gets extra discount
    Given a VIP customer with cart total 100
    When the discount is applied
    Then the total should be 85
```

Tools: **SpecFlow** (.NET), **Cucumber** (JS). BDD aligns dev, QA, and product on **scenarios**; underlying steps call production code or APIs.

BDD ≠ only UI tests — most valuable at **acceptance** level.

## What is shift-left testing?

**Shift-left** = test **earlier** in the lifecycle (design, PR, local) vs only QA at release.

| Practice | Shift-left example |
|----------|-------------------|
| Unit tests on PR | Required check |
| Static analysis | SonarQube, ESLint |
| Security scans | SAST in pipeline |
| Contract tests | Before deploy to integration env |
| Preview environments | Test PR in isolated env |

Azure DevOps / GitHub Actions: run unit + integration on every push; E2E on main or staging.

## How do you name tests and organize test projects?

**Naming:** `MethodName_Scenario_ExpectedResult` or `Should_Expected_When_Condition`

```text
src/
  MyApp.Api/
  MyApp.Domain/
tests/
  MyApp.UnitTests/
  MyApp.IntegrationTests/
  MyApp.E2E/
```

| Convention | Example |
|------------|---------|
| Mirror production structure | `OrderServiceTests` → `OrderService` |
| `[Trait("Category", "Integration")]` | Filter in CI |
| One assert focus per test | Easier failure diagnosis |

## What is test isolation and shared fixture strategy?

| xUnit fixture | Scope |
|---------------|-------|
| Constructor / `IDisposable` | Per test |
| `IClassFixture<T>` | Per class |
| `ICollectionFixture<T>` | Per collection |

**Don't share mutable state** between parallel tests. Use fresh DB name or transaction rollback per test for integration.

## How do you handle flaky tests in a team?

1. **Quarantine** — mark `[Trait("Flaky", "true")]`, exclude from gate until fixed.
2. **No retries without ticket** — retries hide bugs.
3. **Root cause** — timing, data, environment drift.
4. **Ownership** — flaky test = broken product; fix or delete.

Track flaky rate in CI dashboards; zero tolerance on main branch gates.

## What is mutation testing?

**Mutation testing** changes code slightly (mutants) and checks if tests fail — measures **assertion strength**.

```text
if (a > 0)  →  mutant: if (a >= 0)
If tests still pass → weak tests
```

Tools: **Stryker.NET**, **Stryker JS**. Run periodically — slower than coverage.

## How do testing practices differ in microservices?

| Pattern | Purpose |
|---------|---------|
| **Unit** | Domain logic per service |
| **Integration** | Service + its DB |
| **Contract (consumer-driven)** | API between services |
| **Component** | Service in isolation with mocked deps |
| **E2E** | Cross-service user journey (minimal) |

Avoid E2E for every microservice interaction — use **contract tests** (Pact) instead.

## What is contract testing (Pact)?

**Consumer** defines expected request/response; **provider** verifies it can satisfy:

```csharp
// Consumer test
_pactBuilder
    .UponReceiving("a request for user 1")
    .Given("user 1 exists")
    .WithRequest(HttpMethod.Get, "/users/1")
    .WillRespond()
    .WithStatus(200)
    .WithJsonBody(new { id = 1, name = "Ada" });
```

Catches breaking API changes **before** integration environment deploy.

## How do you balance speed and confidence in CI?

```yaml
stages:
  - fast:     unit tests (< 2 min)
  - medium:   integration + contract (< 10 min)
  - slow:     E2E smoke (parallel, staging only)
```

| Strategy | Detail |
|----------|--------|
| Test splitting | `--filter Category=Unit` |
| Caching | NuGet/npm restore cache |
| Fail fast | Stop stage on first failure |
| Required checks | Unit + integration on PR |
| Nightly | Full E2E + mutation |

**Interview answer:** Optimize for **feedback loop** — developers run unit tests locally; CI runs broader suites; production gets canary + smoke.

## Related Topics

- Testing Unit Testing.md
- Testing Integration Testing.md
- Testing E2E Testing.md
- Microservices/Microservices Testing.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
