# Designing Scalable Web Application

## Questions Covered

1. How would you design a scalable web application that handles millions of users?
2. What architecture would you choose for a high-traffic e-commerce site, and why?
3. How would you handle user authentication and authorization in a scalable web application?

## How would you design a scalable web application that handles millions of users?

**Key considerations:** model peak traffic patterns; distribute requests via load balancers; decompose into independently scalable microservices; choose databases that handle high read/write load (NoSQL or sharded SQL).

**High-level architecture:**

| Layer | Approach |
|-------|----------|
| Frontend | Responsive web/PWA (React, Angular, Vue); CDN for static assets |
| Backend | REST or GraphQL; microservices per domain (users, catalog, payments) |
| Load balancer | NGINX, HAProxy, or AWS ELB across backend servers |
| Caching | Redis/Memcached for hot data |
| Database | SQL + NoSQL; sharding and replication for horizontal scale |
| Async processing | RabbitMQ/Kafka for background work |
| Monitoring | Prometheus/Grafana for performance and proactive scaling |

## What architecture would you choose for a high-traffic e-commerce site, and why?

A high-traffic e-commerce site needs high availability, scalability, and low latency.

**Microservices architecture:**

| Layer | Components |
|-------|------------|
| Frontend | Modern JS framework; CDN for static assets |
| API Gateway | Kong or AWS API Gateway — routing, auth, rate limiting |
| Microservices | User, Product, Cart, Order, Payment, Notification services |
| Database | SQL (PostgreSQL/MySQL) for transactions; NoSQL (MongoDB/Cassandra) for catalogs/sessions; replication + sharding |
| Caching | Redis for product details and sessions |
| Load balancing | Across microservice instances |
| Search | Elasticsearch for product search |
| CDN | Global static content delivery |
| Monitoring | Prometheus/Grafana |

**Service responsibilities:**

- **User Service** — profiles, auth, authorization
- **Product Service** — catalog, inventory, search
- **Cart Service** — shopping cart, checkout
- **Order Service** — order processing, transactions
- **Payment Service** — payment gateway integration
- **Notification Service** — email/SMS confirmations

**Why this architecture:**

| Benefit | Reason |
|---------|--------|
| Scalability | Scale services independently by demand |
| Resilience | One service failure doesn't take down the whole app |
| Flexibility | Teams deploy independently; polyglot tech per service |
| Performance | Caching + CDN reduce latency; load balancing spreads traffic |

## How would you handle user authentication and authorization in a scalable web application?

1. **OAuth 2.0 + OpenID Connect** — delegated auth via third-party providers (Google, Facebook); avoids storing passwords.

2. **Centralized auth service** — dedicated service or IdP (Auth0, AWS Cognito) for sign-up, login, password management, and token issuance.

3. **JWT for stateless auth** — encode user info and authorization claims; sign/verify tokens; include roles/permissions for cross-service access control.

4. **RBAC** — roles (admin, user, guest) with per-microservice access rules; centralized role store.

5. **Session management** — short-lived access tokens + securely stored refresh tokens for long-lived sessions.

6. **API Gateway integration** — validate JWTs and enforce permissions in gateway middleware before routing to backends.

7. **Logging and monitoring** — log auth events (successes, failures); monitor for breaches and suspicious activity.

8. **Scalable infrastructure** — deploy auth components on Kubernetes or similar to handle variable load.
