# Observability: Logging, Metrics & Tracing

## Concept Explanation

In a monolith you can attach a debugger; across dozens of services you need **observability** — the ability to understand the system's internal state from its outputs. The **three pillars**:

- **Logs** — discrete, timestamped event records. In microservices, use **structured logging** (JSON) and **centralized aggregation** (ELK, Loki, App Insights) so you can search across services.
- **Metrics** — numeric time-series (request rate, error rate, latency, CPU). Cheap to store, great for dashboards and alerts (Prometheus, Grafana).
- **Distributed Tracing** — follows a single request across service boundaries using a propagated **correlation/trace ID**, showing the end-to-end path and where time/errors occur (OpenTelemetry, Jaeger, Zipkin).

A useful framing: **the four golden signals** — latency, traffic, errors, saturation.

## Code Example(s)

```text
DISTRIBUTED TRACE for one request (trace-id: abc123):
  [Gateway 5ms] ─▶ [Orders 40ms] ─▶ [Payment 120ms ⚠ slow] ─▶ [Inventory 15ms]
                                        └─ span shows the bottleneck
  Same trace-id flows through every service via request headers.
```

```csharp
// Structured logging with a correlation id (so logs across services are linkable)
logger.LogInformation("Order {OrderId} placed by {CustomerId} for {Total}",
    order.Id, order.CustomerId, order.Total);

// OpenTelemetry auto-propagates trace context across HTTP/gRPC calls
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation());
```

## Interview Q&A

**🟢 What are the three pillars of observability?**
Logs (event records), metrics (numeric time-series), and traces (request flow across services). Together they let you detect, diagnose, and understand issues.

**🟢 Why is observability harder in microservices?**
A single user request spans many services and machines; there's no single log file or call stack. You need centralized, correlated telemetry to follow requests and pinpoint failures across the distributed system.

**🟡 What is distributed tracing and how does it work?**
It tracks a request end-to-end across services by propagating a trace/correlation ID (in headers). Each service records spans (timed operations) under that trace, so you can visualize the full path, latency per hop, and where errors occur.

**🟡 What's the difference between logs and metrics?**
Logs are detailed, high-cardinality discrete events (good for diagnosis). Metrics are aggregated numeric series (good for dashboards, trends, and alerting). Logs answer "what happened in this request"; metrics answer "how is the system behaving overall".

**🔴 What is a correlation ID and why is it essential?**
A unique identifier attached to a request and propagated through all downstream calls, so all logs/traces for that request can be tied together across services. Without it, correlating events for one user request across services is nearly impossible.

## ⚠️ Tricky / Gotchas

- **Logs without correlation IDs are nearly useless** across services — you can't reconstruct a request's journey. Propagate the ID everywhere.
- **Unstructured (plain string) logs don't aggregate/query well** — use structured (key-value/JSON) logging.
- **Tracing everything is expensive** — high-volume systems use **sampling**; but over-sampling hides rare errors. Balance cost vs visibility (tail-based sampling helps).
- **Metrics cardinality explosion:** adding high-cardinality labels (user id, request id) to metrics blows up storage — keep those in logs/traces, not metric labels.
- **Alerting on the wrong thing:** alert on symptoms users feel (latency, error rate — golden signals), not just CPU; noisy alerts cause fatigue.

## 📌 Quick Recap

- Observability = understand the system from its outputs; essential because requests span many services.
- Three pillars: Logs (events, structured + centralized), Metrics (numeric time-series, dashboards/alerts), Traces (end-to-end request flow).
- Distributed tracing propagates a trace/correlation ID across services (OpenTelemetry).
- Always propagate correlation IDs; use structured logging.
- Sample traces to control cost; keep high-cardinality data out of metric labels.
- Alert on golden signals: latency, traffic, errors, saturation.
