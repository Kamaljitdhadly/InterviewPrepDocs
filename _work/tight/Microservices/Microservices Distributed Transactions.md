# Microservices Distributed Transactions

## Questions Covered

1. What are distributed transactions, and why are they challenging in microservices?
2. How does the Saga pattern help manage distributed transactions?
3. What is the difference between the choreography and orchestration approaches in the Saga pattern?
4. How do you handle compensating transactions in case of failures?

## What are distributed transactions, and why are they challenging in microservices?

**Distributed transactions** coordinate operations across multiple databases or services that must all succeed or all fail. In microservices, each service typically has its own database, so transactions span separate systems.

**Challenges:**

| Challenge | Why it matters |
|-----------|----------------|
| **Data consistency** | Independent services with different data models are hard to keep in sync |
| **Network latency** | Delays cause timeouts and coordination failures |
| **Error handling** | Partial failure requires compensating/rolling back actions in other services |
| **Limited ACID** | Cross-DB ACID guarantees are difficult with separated databases |
| **Complexity** | Orchestration and coordination add significant system overhead |

## How does the Saga pattern help manage distributed transactions?

The **Saga pattern** breaks a distributed transaction into a sequence of **local transactions**, each followed by compensating transactions that undo prior steps on failure.

**How it works:**

- **Choreography** — each service publishes events after its local transaction; other services react autonomously (loose coupling)
- **Orchestration** — a central orchestrator controls the sequence, invokes services in order, and triggers compensations on failure

**Benefits:**

- **Decoupling** — services operate independently within the saga
- **Error handling** — compensating transactions reverse failed workflows
- **Flexibility** — choreographed or orchestrated implementation
- **Resilience** — local transaction failure doesn't block the entire system

## What is the difference between the choreography and orchestration approaches in the Saga pattern?

| Aspect | Choreography | Orchestration |
|--------|--------------|---------------|
| **Control** | Decentralized — no central coordinator | Centralized — single orchestrator |
| **Communication** | Events via messaging/event bus | Orchestrator sends commands, receives responses |
| **Coupling** | Loose; services react to events | Tighter; orchestrator knows all steps |
| **Flexibility** | Easy to add/modify services | Workflow changes require orchestrator updates |
| **Complexity** | Harder to trace/debug as services grow | Easier to manage complex workflows and errors |
| **Error handling** | Failing service publishes failure event | Orchestrator explicitly triggers compensations |
| **Example** | Payment publishes "paid" → order fulfills | Orchestrator calls payment → inventory → shipping in sequence |

**Choreography** suits simple, event-driven flows with few services. **Orchestration** suits complex workflows needing centralized visibility and rollback control.

## How do you handle compensating transactions in case of failures?

**Compensating transactions** revert completed local transactions when a later step fails, maintaining consistency in sagas.

| Step | Approach |
|------|----------|
| **1. Define compensations** | Every local transaction has a corresponding undo (e.g., debit → credit back) |
| **2. Implement logic** | Use established patterns; compensations must be **idempotent** |
| **3. Trigger on failure** | **Choreography**: failing service publishes failure event; others compensate. **Orchestration**: orchestrator detects failure and calls compensations |
| **4. Ensure idempotency** | Safe to retry compensations without further inconsistency |
| **5. Maintain state** | Track each transaction's status to know which compensations to run |
| **6. Logging and monitoring** | Trace execution and compensations for debugging |
| **7. User notification** | Inform users of failures and corrective actions when appropriate |
