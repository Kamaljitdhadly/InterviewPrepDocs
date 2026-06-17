# Microservices Communication

## Questions Covered

1. What are the different ways microservices can communicate with each other?
2. Can you explain synchronous vs. asynchronous communication in microservices?
3. How would you handle inter-service communication failures?
4. What is the role of circuit breaking and retry policies in communication resilience?

## What are the different ways microservices can communicate with each other?

Microservices communicate through several methods, each suited to different coupling, latency, and reliability needs:

| Method | Description | Best For |
|--------|-------------|----------|
| **HTTP/REST** | RESTful APIs over HTTP; most common synchronous option | Simple, stateless operations; leveraging HTTP infrastructure |
| **gRPC** | High-performance RPC using Protocol Buffers; supports bidirectional streaming | Low-latency, high-throughput inter-service calls |
| **Message Brokers** | Async messaging via RabbitMQ, Kafka, Azure Service Bus (topics/queues) | Decoupled, event-driven systems needing reliability and scale |
| **WebSockets** | Full-duplex, long-lived connection | Real-time updates (chat, live notifications) |
| **GraphQL** | Query language letting clients request exactly the data they need | Aggregating data from multiple services in one query |
| **Event Streaming** | Emit events to Kafka, AWS Kinesis, etc.; consumers react | Event-driven architectures with real-time stream processing |
| **RPC (Thrift, JSON-RPC)** | Invoke remote methods as if local | Strong typing and direct function-style calls between services |

## Can you explain synchronous vs. asynchronous communication in microservices?

**Synchronous** — the caller waits for a response before proceeding (REST, gRPC).

- **Immediate feedback** but **blocking**; slow or unavailable downstream services create bottlenecks.
- Use when responses are required immediately (UI interactions, transaction processing).

**Asynchronous** — the caller sends a message and continues; the receiver processes independently, often via a broker.

- **Non-blocking** and **loosely coupled**; improves resilience and scalability.
- Use when response time is not critical (background jobs, notifications, batch processing).

| Aspect | Synchronous | Asynchronous |
|--------|-------------|------------|
| Coupling | Tighter (caller depends on callee availability) | Looser (broker decouples services) |
| Latency sensitivity | Caller blocked until response | Caller proceeds immediately |
| Examples | HTTP/REST, gRPC | Message queues, event-driven architectures |

## How would you handle inter-service communication failures?

Resilience strategies for inter-service failures:

| Strategy | Purpose |
|----------|---------|
| **Retries** | Auto-retry transient failures (timeouts, brief unavailability) with **exponential backoff** to avoid overwhelming the target |
| **Circuit Breaker** | Stop calling a failing service after a threshold; fail fast, then probe recovery after a cooldown |
| **Fallbacks** | Return cached data, defaults, or route to an alternative service when the primary fails |
| **Timeouts** | Cap wait time so failures are detected quickly and recovery actions can start |
| **Bulkheads** | Isolate components (separate containers/resource pools) to prevent cascading failures |
| **Monitoring & Alerts** | Track health and call metrics (Prometheus, Grafana, ELK); alert on anomalies |
| **Graceful Degradation** | Reduce functionality instead of crashing (e.g., skip recommendations, keep core flow) |
| **Load Balancing** | Route traffic to healthy instances, avoiding unhealthy ones |

## What is the role of circuit breaking and retry policies in communication resilience?

**Circuit Breaker** — detects sustained failures and stops calling an unhealthy service, acting as a protective shell around failing dependencies.

- **Prevents resource exhaustion** by halting doomed retries that strain CPU/memory.
- **Improves fault tolerance** by giving the failing service time to recover.
- **Provides a feedback loop** — after cooldown, allows limited probe requests to test recovery before resuming normal traffic.

**Retry Policies** — automatically re-attempt failed requests based on configurable criteria.

- **Handles transient errors** (timeouts, brief network glitches) that often succeed on retry.
- **Configurable**: max attempts, linear/exponential backoff, and conditions (e.g., retry 5xx but not 404).
- **Avoids amplifying permanent failures** by limiting retries on non-transient errors.

Together, retries address short-lived glitches while circuit breakers prevent the system from hammering persistently failing services — both are essential for robust microservices communication.
