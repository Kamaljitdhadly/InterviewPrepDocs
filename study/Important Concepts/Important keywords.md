# Important keywords
## 1. Throughput

**Definition:** Data volume or request count a system processes per unit time — measures **capacity** and **efficiency**.

| Context | Example |
|---------|---------|
| **Web server** | 200 requests/second |
| **Network link** | 1 Gbps = 1 gigabit/second |

**Usage:** High throughput = handles heavy traffic; critical for **scaling** and **performance under load**.

## 2. SSL Termination

**Definition:** Decrypt **SSL/TLS** traffic at a **gateway or load balancer**, then forward **unencrypted** traffic to backend servers.

- **Example:** Azure Application Gateway decrypts HTTPS → passes HTTP to backend web servers.

**Usage:** Offloads decryption CPU from backends; centralizes **certificate management**; improves performance.

## 3. Web Application Firewall (WAF)

**Definition:** Security layer that **filters/monitors HTTP/S traffic** to block web vulnerabilities and attacks.

- **Example:** Azure Application Gateway WAF blocks **SQL injection** and **XSS** via predefined security rules.

**Usage:** Defends against **application-layer attacks**; ensures only legitimate traffic reaches apps.

## 4. Rate Limiting

**Definition:** Caps requests a user/app can make to an API/service within a time window — prevents abuse, ensures fair usage.

- **Example:** API allows **100 requests/hour**; excess requests blocked until reset.

**Usage:** Prevents overload, mitigates **DoS**, ensures equitable resource access.

## 5. Throttling

**Definition:** Controls request/operation rate to avoid overwhelming a system. Unlike rate limiting, throttling **delays or slows** requests rather than blocking outright.

- **Example:** API introduces **delays between responses** or reduces request rate under excessive traffic.

**Usage:** Maintains stability under high load by managing resources and smoothing demand spikes.

## 6. Debouncing

**Definition:** Delays function/event execution until a period of **inactivity** passes — prevents rapid repeated triggers.

- **Example:** Search input waits until user **stops typing** (few ms) before querying.

**Usage:** Reduces unnecessary calls and resource usage during frequent user interactions.

## 7. Idempotent

**Definition:** Operation produces the **same result** whether executed once or multiple times — no additional side effects beyond the first application.

| Method | Behavior |
|--------|----------|
| **HTTP GET** | Same resource returned every time |
| **HTTP PUT** | Same data → same state regardless of repeat count |

**Usage:** Ensures consistency/reliability in **distributed systems** with retries and network failures.

## 8. Forward Proxy

**Definition:** **Forward proxy hides the client.** Intermediary for **outbound** client requests — forwards to internet, returns responses.

- **Example:** Corporate proxy enforces security policies and content filtering for employees.

**Usage:** Controls outbound traffic; hides client IPs; enables **caching** and filtering.

## 9. Reverse Proxy

**Definition:** **Reverse proxy hides the server.** Intermediary for **backend servers** — receives client requests, forwards to backends, returns responses.

- **Example:** **Nginx** distributes requests across backends, load balances, handles SSL termination.

**Usage:** **Load balancing**, SSL termination, caching, centralized backend management.

## 10. Observability

- **Logging & Monitoring:** Kubernetes integrates with Prometheus, Grafana, ELK Stack for microservice health/performance visibility.

## Reliability vs Resilience

| Concept | Focus |
|---------|-------|
| **Reliability** | **Preventing failures**; consistent performance over time |
| **Resilience** | **Recovering from failures**; continuing service despite issues |

## Service-Oriented Architecture (SOA)

Design pattern where software **components (services)** communicate over a network via a protocol. Emphasizes **modular, loosely coupled, reusable** services — each performs a specific business function.

**Service Contract:** Each service defines what it does and how clients interact — expressed via APIs (WSDL for SOAP, OpenAPI for REST).
