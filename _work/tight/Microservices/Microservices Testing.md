# Microservices Testing

## Questions Covered

1. What are the different levels of testing in microservices (unit, integration, contract, end-to-end)?
2. What is contract testing, and why is it important for microservices?
3. How do you mock external services when testing microservices?
4. What are consumer-driven contracts, and why are they important?

## What are the different levels of testing in microservices?

| Level | Scope | Purpose | Tools |
|-------|-------|---------|-------|
| **Unit** | Individual functions/components in isolation | Catch bugs early; verify unit behavior | JUnit, NUnit, Mocha, Jasmine |
| **Integration** | Interactions between modules/services | Issues from service communication | Postman, REST-assured, Pact, Spring Test |
| **Contract** | API request/response expectations between services | Changes don't break consumers | Pact, Spring Cloud Contract |
| **End-to-End (E2E)** | Full application flow, all services | Real user scenarios in prod-like env | Selenium, Cypress, TestCafe |

## What is contract testing, and why is it important for microservices?

**Contract testing** verifies service interactions against a predefined **contract** — expected request/response formats, data types, and behaviors.

**Why it matters:**

| Benefit | Description |
|---------|-------------|
| **Service decoupling** | Services evolve independently without breaking integrations |
| **Early detection** | Catch integration issues before production |
| **Team communication** | Clear interaction expectations reduce misalignment |
| **Backward compatibility** | New versions remain compatible with existing consumers |
| **Reduced integration overhead** | Contracts guarantee compatibility, reducing full integration test needs |

## How do you mock external services when testing microservices?

| Approach | Description |
|----------|-------------|
| **Mocking libraries** | Mockito (Java), Moq (.NET) — mock objects for unit tests |
| **Stubs** | Predefined responses, no complex logic |
| **Fakes** | Working but non-production implementations |
| **Service virtualization** | WireMock, Mountebank — simulate external APIs |
| **HTTP client mocking** | Postman, MockServer — mock HTTP responses |
| **API contract mocks** | Pact-generated mocks from defined contracts |
| **Environment config** | Switch between real and mock implementations per environment |

## What are consumer-driven contracts, and why are they important?

**Consumer-Driven Contracts (CDC)** document consumer expectations as contracts specifying how the provider must behave (request/response structures).

**Why CDC matters:**

1. **Decoupled development** — Consumer defines contract; provider evolves without breaking consumers
2. **Clear expectations** — Consumer perspective reduces team misunderstandings
3. **Automated testing** — Providers validate against consumer contracts on changes
4. **Backward compatibility** — Provider changes safe as long as contracts are honored
5. **Better collaboration** — Consumer-focused agreements improve cross-team coordination
