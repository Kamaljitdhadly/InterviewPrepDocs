# Microservices Shadow Testing

## Questions Covered

1. What is shadow testing in the context of microservices, and how does it help in safe deployments?
2. How do you route real traffic to shadow services in production?

## What is shadow testing in the context of microservices, and how does it help in safe deployments?

**Shadow testing** (shadow traffic / shadow deployment) runs a new microservice version alongside production without affecting live users. Incoming requests are **duplicated** to the new service while the original continues serving real traffic.

**Benefits for safe deployments:**

- **Risk mitigation** — find issues under real load without impacting users.
- **Performance validation** — evaluate the new version against actual production traffic patterns.
- **Behavior comparison** — diff responses between old and new versions to catch regressions early.
- **Incremental rollout** — validate before fully switching traffic.
- **Feedback loop** — collect metrics and logs from the shadow instance to refine before go-live.

## How do you route real traffic to shadow services in production?

**1. Traffic duplication** — mirror incoming requests from production to the shadow service at the load balancer or API gateway.

**2. API gateway configuration** — route or mirror traffic via rules (NGINX, Kong, etc.); duplicate all requests or a configured portion.

**3. Service mesh integration** — Istio or Linkerd traffic splitting routes a percentage to the shadow service while the rest hits the stable version (e.g., Istio `VirtualService` routing rules).

**4. Monitoring and observability** — collect metrics, logs, and traces from both services (Prometheus, Grafana, Jaeger, Zipkin) to compare performance.

**5. Analyzing results** — compare error rates, response times, and behavioral differences; once confident, fully switch or progressively roll out.

Shadow testing validates new versions under real production conditions before they serve actual users.
