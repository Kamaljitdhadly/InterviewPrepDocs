# Microservices Monitoring and Logging

## Questions Covered

1. How do you monitor microservices in a distributed environment?
2. What are best practices for logging in microservices?
3. How do you trace requests across multiple services (distributed tracing)?
4. Can you explain how tools like Prometheus, Grafana, or Jaeger are used for monitoring?

## How do you monitor microservices in a distributed environment?

Collect and analyze **metrics**, **logs**, and **traces** to ensure system health:

| Strategy | Tools / approach |
|----------|------------------|
| **Centralized logging** | ELK Stack, Fluentd, Graylog — aggregate logs for search and analysis |
| **Metrics collection** | Prometheus, Grafana, Datadog — CPU, memory, request/error rates, latency |
| **Distributed tracing** | OpenTelemetry, Jaeger, Zipkin — trace requests across services |
| **Health checks** | HTTP endpoints (200 = healthy, 500 = unhealthy) for each service |
| **Service mesh** | Istio, Linkerd — observability, traffic management, telemetry |
| **Alerting** | Notify on error spikes, latency, resource exhaustion |
| **Dashboards** | Grafana/Kibana for visual system health overview |
| **APM** | New Relic, Dynatrace, AppDynamics — performance and transaction traces |

## What are best practices for logging in microservices?

| Practice | Details |
|----------|---------|
| **Structured logging** | JSON format for programmatic search, filter, and analysis |
| **Contextual information** | Include service name, instance ID, request ID, user ID |
| **Log levels** | DEBUG, INFO, WARN, ERROR — filter appropriately in production |
| **Centralized aggregation** | Single system for all service logs |
| **Detailed error logs** | Stack traces and context for troubleshooting |
| **Avoid sensitive data** | No passwords, PII, or payment info in logs |
| **Rotation & retention** | Manage size; archive/delete per compliance requirements |
| **Performance** | Async logging in high-throughput systems to avoid blocking |
| **Correlation IDs** | Group logs for a single request across services |

## How do you trace requests across multiple services (distributed tracing)?

Distributed tracing monitors requests as they flow through multiple microservices:

1. **Trace ID generation** — unique ID created at request start; included in all downstream calls
2. **Context propagation** — trace ID and span IDs passed via HTTP headers or message payloads
3. **Span creation** — each service creates a span with:
   - Span ID and parent span ID
   - Start/end timestamps
   - Annotations (errors, custom tags)
4. **Storage** — spans sent to a tracing backend (Jaeger, Zipkin)
5. **Visualization** — UI shows full request flow, per-service latency, and bottlenecks
6. **Performance metrics** — per-service latency for optimization

## Can you explain how tools like Prometheus, Grafana, or Jaeger are used for monitoring?

| Tool | Role | Key features |
|------|------|--------------|
| **Prometheus** | Metrics collection | Pull model scraping HTTP endpoints; time-series storage; PromQL queries; alerting via Alertmanager |
| **Grafana** | Visualization | Dashboards (graphs, tables, charts) from Prometheus and other sources; threshold alerts; plugin ecosystem |
| **Jaeger** | Distributed tracing | Collects spans from instrumented apps (HTTP/gRPC); visualizes request flow across services; identifies latency bottlenecks and slow calls |

**Typical stack:** Prometheus scrapes metrics → Grafana visualizes and alerts; Jaeger traces request paths — together providing metrics, dashboards, and distributed tracing for microservices observability.
