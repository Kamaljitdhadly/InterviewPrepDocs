# Microservices Resilience and Fault Tolerance

## Questions Covered

1. How do you design microservices to be fault-tolerant?
2. How does circuit breaking work in microservices?
3. What is a fallback mechanism, and how does it enhance resilience?
4. How do you implement retry policies in microservices?

## How do you design microservices to be fault-tolerant?

Fault tolerance keeps distributed systems reliable and available. Key strategies:

| Strategy | Purpose |
|----------|---------|
| **Service redundancy** | Multiple instances across servers/clusters; failover on instance failure |
| **Load balancing** | Distribute traffic; route away from failed instances |
| **Graceful degradation** | Return meaningful errors or defaults instead of total failure |
| **Retry logic** | Exponential backoff for transient failures (network glitches) |
| **Timeouts** | Prevent indefinite blocking on unresponsive services |
| **Circuit breaker** | Stop calls to failing services; fail fast |
| **Health checks** | Orchestrators (Kubernetes) route traffic away from unhealthy instances |
| **Event sourcing / CQRS** | Replay events to recover state; ensure consistency |
| **Isolation** | Separate critical from non-critical services to prevent cascading failures |
| **Logging & monitoring** | Real-time detection via observability tools |

## How does circuit breaking work in microservices?

The **circuit breaker** prevents calls to failing services, improving stability and resilience.

**Three states:**

1. **Closed** — Requests pass through; success/failure rates monitored.
2. **Open** — Failure rate exceeds threshold (e.g., 50%); all requests blocked for a timeout; returns error or fallback immediately.
3. **Half-Open** — After timeout, limited test requests allowed. Success → closed; failure → reopens.

**Fallback:** When open, return cached data, defaults, or clear error messages.

**Benefits:** Prevents cascading failures, keeps the app responsive, manages load on failing services.

**Implementation:** Hystrix, Resilience4j, or service mesh built-in support with configurable thresholds.

## What is a fallback mechanism, and how does it enhance resilience?

A **fallback** provides alternative responses when a service call fails, preventing total outage and maintaining user experience.

| Strategy | Description |
|----------|-------------|
| **Default/cached responses** | Return stale or static data when live service fails |
| **Graceful degradation** | Limit functionality (e.g., browse without recommendations) |
| **Circuit breaker integration** | Auto-invoke fallback when circuit opens |
| **Clear error messages** | Inform users of limitations |

**Benefits:** Better UX during failures, system stability, insight into service health for proactive monitoring.

## How do you implement retry policies in microservices?

Retries handle **transient failures** — network timeouts, temporary unavailability, DB connection errors.

**Policy parameters:**

| Parameter | Guidance |
|-----------|----------|
| **Retry count** | Typically 3–5 max attempts |
| **Delay** | Fixed (e.g., 1s) or **exponential backoff** (1s, 2s, 4s) |
| **Timeout** | Overall operation timeout including all retries |

**Implementation approaches:**

- **Synchronous** — Loops or retry libraries wrapping calls
- **Asynchronous** — Promise chaining or async/await with error handling
- **Libraries** — Polly (.NET), Resilience4j (Java), Istio retry policies

**Best practices:** Exponential backoff reduces load on recovering services; integrate with circuit breaker (open after max retries fail); log retry attempts to identify systemic issues.
