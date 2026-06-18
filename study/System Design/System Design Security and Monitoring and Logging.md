# System Design Security and Monitoring and Logging

## Questions Covered

1. What are common security concerns in system design?
2. How would you design a system for authentication and authorization?
3. What methods can you use to secure data in transit and at rest?
4. Why is monitoring important in system design?
5. How would you implement logging and monitoring for a distributed system?
6. What are some common tools for system monitoring?

## What are common security concerns in system design?

| Concern | Description |
|---------|-------------|
| Data privacy | Encrypt sensitive data; control access |
| Authentication | Verify identity of users/systems |
| Authorization | Enforce appropriate permissions |
| Data integrity | Prevent tampering in transit or storage |
| Input validation | Block injection attacks (SQLi, XSS) |
| Network security | Firewalls, IDS, HTTPS, VPNs |
| Session management | Prevent hijacking and fixation |
| Error handling | Don't leak architecture/vulnerability details |
| Monitoring and logging | Track access for incident detection and compliance |
| Third-party dependencies | Assess security of integrated libraries/services |
| Scalability and performance | Security measures shouldn't degrade performance |

## How would you design a system for authentication and authorization?

1. **Choose auth method** — password (bcrypt/Argon2 hashing); MFA (password + token/biometrics); OAuth/OpenID Connect (third-party IdPs).

2. **Token-based auth** — JWT with claims (user ID, roles) and expiration on successful login.

3. **Authorization** — RBAC (roles → permissions) or ABAC (attributes + policies).

4. **Secure communication** — HTTPS; secure token storage (httpOnly cookies or local storage with flags).

5. **Access controls** — validate permissions on every API request; rate limiting against brute force.

6. **Logging and monitoring** — log auth attempts and sensitive access; alert on abnormal patterns.

7. **Regular audits** — penetration testing and security reviews.

## What methods can you use to secure data in transit and at rest?

### Securing data in transit

| Method | Approach |
|--------|----------|
| Encryption | TLS for network traffic; end-to-end encryption for sensitive comms |
| Secure protocols | HTTPS, SFTP, FTPS — avoid HTTP, FTP, Telnet |
| VPN | Encrypted tunnels for remote-to-internal connections |
| Message integrity | Hash functions or HMAC to detect tampering |
| Access control | Restrict who can send/receive over the network |

### Securing data at rest

| Method | Approach |
|--------|----------|
| Data encryption | AES/RSA for DBs, file systems, cloud storage; field-level encryption for PII/financial data |
| Access controls | RBAC limiting data access by role |
| Regular backups | Encrypted backups; verify integrity |
| Masking and tokenization | Obfuscate data in non-prod; tokens replace sensitive values |
| Physical security | Protect servers and storage devices |
| Integrity checks | Checksums, hashes, digital signatures on stored data |

## Why is monitoring important in system design?

| Reason | Benefit |
|--------|---------|
| Detect anomalies/threats | Rapid response to breaches, failures, performance issues |
| Performance optimization | Insights into CPU, memory, response times under load |
| Resource management | Track utilization; identify bottlenecks |
| Compliance and audit trails | Logs of user activity and system changes |
| User experience | Identify UX improvement areas |
| Capacity planning | Trend analysis for proactive scaling |
| Troubleshooting | Root-cause data for fast incident resolution |

## How would you implement logging and monitoring for a distributed system?

1. **Centralized logging** — ELK Stack or Fluentd to aggregate logs from all services; structured JSON with timestamps, service names, correlation IDs.

2. **Correlation and context** — propagate unique correlation IDs across service calls; include user IDs, session data, transaction details.

3. **Monitoring infrastructure** — Prometheus/Grafana for metrics (response times, error rates, CPU/memory); agent-based or push collection.

4. **Alerting** — threshold-based alerts via Alertmanager/Opsgenie; integrate with PagerDuty/ServiceNow for incident management.

5. **Dashboards** — Grafana/Kibana for real-time health, KPIs, and user behavior visualization.

6. **Security and compliance** — access controls on logs; regular audits for regulatory compliance.

## What are some common tools for system monitoring?

| Tool | Purpose |
|------|---------|
| **Prometheus** | Open-source time-series metrics and alerting |
| **Grafana** | Metrics visualization (including Prometheus data) |
| **ELK Stack** | Elasticsearch (search), Logstash (processing), Kibana (visualization) |
| **Fluentd** | Unified log collection and forwarding |
| **Datadog** | Cloud monitoring for infrastructure, APM, and logs |
| **New Relic** | Application, infrastructure, and UX observability |
| **Zabbix** | Open-source monitoring for networks, servers, services |
| **Nagios** | Infrastructure monitoring with alerting and reporting |
| **OpenTelemetry** | Cloud-native distributed traces and metrics framework |
