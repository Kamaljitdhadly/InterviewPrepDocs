# E2E Testing

## Questions Covered

1. What is end-to-end (E2E) testing?
2. When should you write E2E tests vs integration tests?
3. How does Playwright compare to Selenium and Cypress?
4. How do you set up Playwright for .NET?
5. How do you write a Playwright E2E test for a web app?
6. How do you use Playwright with TypeScript for React apps?
7. What is the Page Object Model (POM)?
8. How do you handle authentication and test data in E2E?
9. How do you run E2E tests in CI/CD?
10. What are visual regression and accessibility checks in E2E?
11. How do you debug flaky E2E tests?
12. What E2E scenarios are worth automating?

## What is end-to-end (E2E) testing?

**E2E tests** exercise the **full system** as a user would — browser (or mobile client), frontend, API, database, third-party sandboxes — in realistic environments.

```text
Browser → CDN → Web app → API → DB → message queue → email stub
```

| Characteristic | Typical value |
|----------------|---------------|
| **Speed** | Seconds to minutes per test |
| **Stability** | More flaky than unit tests |
| **Cost** | High maintenance |
| **Value** | Catches wiring bugs no lower layer sees |

## When should you write E2E tests vs integration tests?

| E2E | Integration |
|-----|-------------|
| Critical revenue paths (checkout, signup) | API contract + DB persistence |
| Cross-service user journeys | Single service boundaries |
| Smoke test after deploy | Regression on business rules |
| 5–15 scenarios, not every edge case | Broader API coverage |

**Anti-pattern:** Duplicating all unit/integration cases through the UI.

## How does Playwright compare to Selenium and Cypress?

| Tool | Strengths | Notes |
|------|-----------|-------|
| **Playwright** | Auto-wait, multi-browser, trace viewer, .NET/TS/Python | Modern default |
| **Cypress** | Great DX, time-travel debug | Chromium-family focus; multi-tab limited |
| **Selenium** | Legacy, wide language support | More boilerplate, flakier waits |

**Interview pick:** Playwright for new projects — built-in retries, network interception, codegen.

## How do you set up Playwright for .NET?

```bash
dotnet new nunit -n MyApp.E2E
cd MyApp.E2E
dotnet add package Microsoft.Playwright.NUnit
dotnet build
pwsh bin/Debug/net8.0/playwright.ps1 install
```

```csharp
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

[TestFixture]
public class CheckoutTests : PageTest
{
    [Test]
    public async Task UserCanCompleteCheckout()
    {
        await Page.GotoAsync("https://localhost:5001");
        await Page.GetByRole(AriaRole.Button, new() { Name = "Add to cart" }).ClickAsync();
        await Page.GetByRole(AriaRole.Link, new() { Name = "Checkout" }).ClickAsync();
        await Expect(Page.GetByText("Order confirmed")).ToBeVisibleAsync();
    }
}
```

Configure `PLAYWRIGHT_BASE_URL` or `PageTest` base URL in runsettings.

## How do you write a Playwright E2E test for a web app?

Prefer **role and label locators** over brittle CSS:

```csharp
await Page.GetByLabel("Email").FillAsync("user@example.com");
await Page.GetByLabel("Password").FillAsync("P@ssw0rd!");
await Page.GetByRole(AriaRole.Button, new() { Name = "Sign in" }).ClickAsync();
await Expect(Page).ToHaveURLAsync(new Regex("/dashboard"));
```

| Locator priority | Example |
|------------------|---------|
| Role | `GetByRole(Button, Name="Save")` |
| Label | `GetByLabel("Quantity")` |
| Text | `GetByText("Welcome")` |
| Test id | `GetByTestId("cart-count")` |

Playwright **auto-waits** for elements to be actionable — reduces explicit sleeps.

## How do you use Playwright with TypeScript for React apps?

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('checkout flow', async ({ page }) => {
  await page.goto('/store');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Thank you')).toBeVisible();
});
```

```json
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
});
```

## What is the Page Object Model (POM)?

Encapsulate page structure in reusable classes — tests read like user stories:

```csharp
public class LoginPage
{
    private readonly IPage _page;
    public LoginPage(IPage page) => _page = page;

    public async Task<LoginPage> GotoAsync() { await _page.GotoAsync("/login"); return this; }
    public async Task<DashboardPage> LoginAsAsync(string email, string password)
    {
        await _page.GetByLabel("Email").FillAsync(email);
        await _page.GetByLabel("Password").FillAsync(password);
        await _page.GetByRole(AriaRole.Button, new() { Name = "Sign in" }).ClickAsync();
        return new DashboardPage(_page);
    }
}

// Test
var dashboard = await new LoginPage(Page).GotoAsync().LoginAsAsync("a@b.com", "secret");
await Expect(dashboard.WelcomeMessage).ToBeVisibleAsync();
```

## How do you handle authentication and test data in E2E?

| Strategy | Use |
|----------|-----|
| **API seeding** | Create user/order via API before UI test |
| **Storage state** | Login once, save cookies to file, reuse in tests |
| **Test-only endpoint** | `/test/seed` disabled in prod |
| **Dedicated test env** | Isolated DB, reset between runs |

```typescript
// auth.setup.ts — run once
await page.goto('/login');
await page.getByLabel('Email').fill('e2e@test.com');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.context().storageState({ path: 'auth.json' });

// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /auth.setup.ts/ },
  { name: 'e2e', dependencies: ['setup'], use: { storageState: 'auth.json' } },
]
```

Never hard-code prod credentials.

## How do you run E2E tests in CI/CD?

```yaml
# GitHub Actions
- uses: actions/setup-node@v4
- run: npx playwright install --with-deps
- run: npm run build
- run: npx playwright test
  env:
    CI: true
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

| CI tip | Detail |
|--------|--------|
| Headless | Default in CI |
| Retries | `retries: process.env.CI ? 2 : 0` |
| Artifacts | Traces, screenshots on failure |
| Parallel | Sharded jobs per browser/project |

## What are visual regression and accessibility checks in E2E?

```typescript
await expect(page).toHaveScreenshot('homepage.png'); // visual diff
```

```typescript
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

Use visual snapshots sparingly — brittle with frequent UI changes. A11y checks catch WCAG issues early.

## How do you debug flaky E2E tests?

| Cause | Fix |
|-------|-----|
| Race conditions | Rely on Playwright auto-wait; avoid `sleep` |
| Test order dependency | Isolate data per test |
| Shared environment | Dedicated E2E env |
| Animations | `data-testid`, disable animations in test CSS |
| Network | Mock external APIs; stub slow third parties |

Use **trace viewer**: `npx playwright show-trace trace.zip`.

## What E2E scenarios are worth automating?

**Automate:**
- Login / logout
- Core CRUD happy path
- Payment or subscription flow (sandbox)
- Role-based access smoke tests
- Post-deploy smoke suite

**Manual or lower layer:**
- Every validation message
- Pixel-perfect layout
- Rare admin edge cases

## Related Topics

- Testing Integration Testing.md
- Testing Test Pyramid and Best Practices.md
- React/React Testing.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
