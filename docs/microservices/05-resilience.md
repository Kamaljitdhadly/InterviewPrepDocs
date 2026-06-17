# Resilience Patterns (Circuit Breaker, Retry, Bulkhead)

## Concept Explanation

In distributed systems, **failures are normal** — networks drop, services slow down, dependencies go offline. Resilience patterns keep failures from cascading:

- **Retry** — retry a transient failure, ideally with **exponential backoff + jitter** to avoid hammering a struggling service.
- **Timeout** — never wait forever; fail fast so threads/resources aren't tied up.
- **Circuit Breaker** — after repeated failures, "open" the circuit and fail fast for a while (stop calling the failing service), then "half-open" to test recovery. Prevents cascading failure and gives the dependency time to recover.
- **Bulkhead** — isolate resources (thread pools/connections) per dependency so one slow dependency can't exhaust everything (like watertight compartments in a ship).
- **Fallback** — return a default/cached response when a dependency fails (graceful degradation).

## Code Example(s)

```text
CIRCUIT BREAKER states:
  CLOSED ──(failures exceed threshold)──▶ OPEN ──(after cooldown)──▶ HALF-OPEN
     ▲                                                                  │
     └──────────────(trial call succeeds)──────────────────────────────┘
  OPEN = fail fast immediately (don't call the dependency)
```

```csharp
// Polly (.NET) — combine retry + circuit breaker + timeout
var retry = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(3, attempt =>
        TimeSpan.FromMilliseconds(200 * Math.Pow(2, attempt))); // exponential backoff

var breaker = Policy
    .Handle<HttpRequestException>()
    .CircuitBreakerAsync(
        handledEventsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30));

var resilient = Policy.WrapAsync(retry, breaker);
await resilient.ExecuteAsync(() => httpClient.GetAsync("https://payment/charge"));
```

## Interview Q&A

**🟢 Why are resilience patterns important in microservices?**
Because services depend on each other over unreliable networks; without resilience, one slow/failing service can cascade and bring down the whole system. These patterns contain failures and degrade gracefully.

**🟢 What is a circuit breaker?**
A pattern that monitors failures; once they exceed a threshold it "opens" and fails fast (stops calling the failing dependency) for a cooldown, then half-opens to test recovery. It prevents wasting resources on calls likely to fail and gives the dependency time to recover.

**🟡 What's the danger of naive retries?**
Retrying without backoff can amplify load on an already-struggling service (a "retry storm"), making things worse. Use exponential backoff + jitter, cap retries, and only retry idempotent/transient operations.

**🟡 What is the bulkhead pattern?**
Isolating resources (e.g. separate thread/connection pools) per dependency so a failure or slowdown in one can't consume all resources and take down unrelated functionality.

**🔴 How do retries and circuit breakers interact, and why combine them?**
Retries handle brief transient blips; circuit breakers handle sustained failures. Combined, retries cover quick hiccups while the breaker trips on persistent problems to stop retry storms and cascading failures. Order matters — typically retry *inside* the breaker so repeated failures count toward tripping it.

## ⚠️ Tricky / Gotchas

- **Retrying non-idempotent operations causes duplicates** (double charges, double orders). Only retry idempotent calls, or ensure idempotency keys.
- **Retry storms:** synchronized retries without jitter from many clients hammer a recovering service — always add jitter.
- **Timeouts too long = resource exhaustion**; threads pile up waiting. Set aggressive, sensible timeouts.
- **Circuit breaker tuning is hard** — too sensitive trips on normal blips; too lax doesn't protect. Base thresholds on real metrics.
- **Resilience without observability is blind** — you need metrics/alerts to know when breakers open or retries spike (see Observability).

## 📌 Quick Recap

- Failures are normal in distributed systems; contain them, don't let them cascade.
- Retry (with exponential backoff + jitter, idempotent only), Timeout (fail fast), Circuit Breaker (closed→open→half-open), Bulkhead (resource isolation), Fallback (graceful degradation).
- Combine retry + circuit breaker (retry for blips, breaker for sustained failure) to avoid retry storms.
- Only retry idempotent operations; always add jitter; set aggressive timeouts.
- Tune breakers with real metrics; pair resilience with observability.
