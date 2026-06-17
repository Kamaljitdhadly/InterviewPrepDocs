# System Design Concurrency and Parallelism

## Questions Covered

1. What is the difference between concurrency and parallelism?
2. How would you handle concurrency in a distributed system?
3. What are some common issues related to concurrency?

## What is the difference between concurrency and parallelism?

| Aspect | Concurrency | Parallelism |
|--------|-------------|-------------|
| Definition | Structure system to handle multiple tasks that may overlap | Simultaneous execution of multiple tasks |
| Execution | Interleaved — tasks yield control; progress without simultaneous execution | True simultaneous execution on multiple cores/processors |
| Hardware | Works on single-core (e.g., thread switching during I/O wait) | Requires multi-core/multi-processor |
| Goal | Manage many tasks at once | Speed up compute-intensive work |

**Summary:** concurrency is about *dealing with* many tasks; parallelism is about *doing* many tasks at the same time.

## How would you handle concurrency in a distributed system?

| Strategy | Approach |
|----------|----------|
| **Distributed transactions** | 2PC — all services commit or roll back together |
| **Optimistic concurrency** | Allow concurrent access; detect conflicts at commit; rollback/retry |
| **Pessimistic concurrency** | Lock resources during transactions; prevents conflicts but reduces throughput |
| **Eventual consistency** | Allow temporary inconsistency; converge over time (common in microservices) |
| **Conflict resolution** | Versioning, timestamps, or app logic to pick winning change |
| **Distributed locks** | ZooKeeper, Redis — one writer at a time on shared resources |
| **Message queuing** | RabbitMQ/Kafka — decouple services; async processing avoids contention |
| **Microservices communication** | Strict API contracts; CQRS to separate reads and writes |
| **Monitoring and alerts** | Track deadlocks, timeouts; proactive issue detection |
| **Testing and simulation** | Chaos engineering to stress-test concurrent behavior |

## What are some common issues related to concurrency?

| Issue | Description | Mitigation |
|-------|-------------|------------|
| **Race conditions** | Concurrent read/write on shared data → unpredictable results | Synchronization mechanisms |
| **Deadlocks** | Transactions wait on each other's locks indefinitely | Detection/prevention strategies |
| **Starvation** | Process perpetually denied resources by higher-priority holders | Fair scheduling, resource allocation |
| **Inconsistent data states** | Temporary inconsistency from concurrent ops | Strong or eventual consistency models |
| **Performance bottlenecks** | Heavy lock contention slows all processes | Reduce shared-resource contention |
| **Increased complexity** | Harder to reason about and debug system behavior | Clear design patterns, testing |
| **Latency** | Lock/sync overhead delays request processing | Minimize critical sections |
| **Data corruption** | Simultaneous writes leave invalid state | Proper concurrency controls |
| **Resource leaks** | Locks/connections not released | Guaranteed cleanup (try/finally, RAII) |
| **Communication overhead** | Coordination traffic in distributed systems | Async messaging, local caching |
