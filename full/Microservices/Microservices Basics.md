# Microservices Basics
## Questions Covered

1. What are microservices, and how do they differ from monolithic architecture?
2. What are the advantages and disadvantages of using microservices?
3. How do you decide whether to use microservices in a system design?
4. What is service granularity, and how do you define the right size of a microservice?
5. How do you ensure high cohesion and low coupling in microservices?
6. What role does domain-driven design (DDD) play in microservices architecture?
## What are microservices, and how do they differ from monolithic architecture?

**Microservices** is an architectural style in which an application is built as a collection of loosely coupled, independently deployable services, each responsible for a specific business function. These services communicate with each other via lightweight protocols, such as HTTP or messaging systems.

**Monolithic architecture**, on the other hand, is a traditional style where the entire application is built as a single, cohesive unit. All components (e.g., UI, business logic, data access) are tightly coupled and run as one large process.

**Key differences**:

- **Modularity**: Microservices break down functionality into smaller services, while a monolithic app is a single, tightly coupled unit.

- **Deployment**: Microservices can be deployed independently, whereas monolithic applications require the entire app to be redeployed.

- **Scalability**: Microservices allow independent scaling of services based on demand, while monolithic applications require scaling the entire system.

- **Technology stack**: Microservices allow for different technologies per service, while monolithic apps generally use a unified technology stack.
## What are the advantages and disadvantages of using microservices?

**Advantages**:

- **Scalability**: Microservices can be independently scaled, allowing more efficient use of resources where needed.

- **Flexibility**: Different services can use different technologies and programming languages, providing more flexibility in choosing the right tools for each task.

- **Faster development and deployment**: Teams can develop and deploy microservices independently, enabling faster releases and updates.

- **Fault isolation**: Issues in one microservice do not bring down the entire application, improving overall system resilience.

- **Improved modularity**: Microservices enable better separation of concerns, making systems easier to understand and maintain.

**Disadvantages**:

- **Increased complexity**: Managing multiple services introduces complexity in areas such as service discovery, inter-service communication, and orchestration.

- **Latency**: Microservices communicate over the network, which introduces latency and the possibility of network failures.

- **Operational overhead**: Running and monitoring many services can be operationally challenging, requiring advanced tools for deployment, monitoring, and logging.

- **Data consistency**: Managing data consistency across distributed services is more complex than in monolithic systems, especially when dealing with distributed transactions.

- **Cost**: Microservices often require more infrastructure resources, including more servers, databases, and networking components.
## How do you decide whether to use microservices in a system design?

The decision to use **microservices** should be based on the complexity, scalability, and requirements of the application. Consider microservices when:

- **Application complexity**: If the application has multiple business domains or functionalities that can be split into independently deployable modules, microservices offer better modularity.

- **Team structure**: If you have multiple teams working on different parts of the application, microservices allow teams to work independently on their respective services without interfering with each other.

- **Scalability needs**: If certain parts of the application have different scaling requirements, microservices allow you to scale individual services instead of the entire application.

- **Frequent updates**: Microservices make it easier to deploy updates to individual services without affecting the entire application, improving deployment agility.

- **Fault isolation**: If you need to isolate failures (e.g., if one component fails, it should not bring down the whole system), microservices enable better fault tolerance.

- **Technology diversity**: If different parts of the system need to use different technology stacks, microservices allow each service to use the most appropriate technology.

- **DevOps maturity**: You need to have a strong DevOps culture (e.g., automation, monitoring, CI/CD pipelines) to handle the complexity of managing multiple services.

Avoid microservices if:

- The application is small or not complex enough to benefit from splitting into services.

- The organization lacks the operational maturity (e.g., CI/CD pipelines, automated testing, monitoring) to manage the overhead of microservices.

- Performance-critical components require low-latency communication, where microservice architecture might introduce unnecessary network overhead.
## What is service granularity, and how do you define the right size of a microservice?

**Service granularity** refers to the size and scope of each microservice. Granularity defines how much functionality or responsibility a single microservice should have.

To define the **right size** of a microservice, consider the following:

- **Single Responsibility Principle (SRP)**: A microservice should have one clear responsibility and perform one business function. It should be responsible for a specific piece of functionality within a business domain.

- **Cohesion**: Each microservice should be highly cohesive, meaning that its internal components work closely together and are related to the same functionality.

- **Bounded Context** (from Domain-Driven Design): Microservices should align with **bounded contexts**, which represent a self-contained portion of the business domain. Each bounded context should be treated as a separate microservice.

- **Business Capabilities**: Services should map to specific business capabilities or features. If a microservice can be described as solving a distinct business problem, it is likely to be the right size.

- **Avoid excessive splitting**: Services that are too small (overly fine-grained) can result in high communication overhead and complexity, while too large (coarse-grained) services can lead to tightly coupled, monolithic-like services.

The balance is in keeping microservices **small enough** to be independently deployable but **large enough** to avoid unnecessary communication between services.
## How do you ensure high cohesion and low coupling in microservices?

To ensure **high cohesion** (services doing a well-defined task) and **low coupling** (minimal dependencies between services) in microservices, follow these guidelines:

- **Define services around business capabilities**: Organize microservices based on specific business domains or functionalities. Services should represent distinct parts of the business that rarely require changes at the same time.

- **Use Domain-Driven Design (DDD)**: DDD helps define service boundaries based on **bounded contexts**. Each service should encapsulate all the logic, behavior, and data relevant to its domain, promoting high cohesion within the service.

- **APIs for communication**: Microservices should communicate through well-defined APIs, ideally using REST, gRPC, or messaging systems like RabbitMQ or Kafka. This reduces dependencies on internal implementations, promoting loose coupling.

- **Encapsulate data**: Each microservice should have its own database or data store to avoid direct data sharing. Services can share data through APIs, preventing tight coupling between their databases.

- **Use asynchronous communication**: Asynchronous messaging or event-driven communication (e.g., using event buses or message brokers) reduces the need for synchronous calls, thus avoiding dependencies between services during runtime.

- **Version APIs carefully**: When changes are made to service APIs, versioning ensures that dependent services don’t break, allowing services to evolve independently without tight coupling.

- **Limit shared libraries**: Avoid sharing too much code between services. Shared libraries create tight coupling, as changes to the library can force updates across multiple services.

- **Service discovery and load balancing**: Implement dynamic service discovery and load balancing to avoid hardcoding service addresses and enable services to locate each other at runtime without tight bindings.
## What role does domain-driven design (DDD) play in microservices architecture?

**Domain-Driven Design (DDD)** is essential in microservices architecture because it provides a framework for defining service boundaries, promoting cohesion, and ensuring that services are aligned with business domains. Here's how DDD fits into microservices:

- **Bounded Contexts**: DDD emphasizes **bounded contexts**, which represent a well-defined boundary within the business domain. Each microservice is typically aligned with a bounded context, ensuring that the microservice is focused on a specific part of the business, reducing complexity and coupling with other services.

- **Ubiquitous Language**: DDD encourages using a **ubiquitous language** that is shared between domain experts and developers. This ensures that within a bounded context, everyone understands the concepts in the same way, leading to better communication and more accurate implementation of business rules in microservices.

- **Entities, Aggregates, and Value Objects**: DDD provides concepts like **entities, aggregates**, and **value objects**, which help organize the internal structure of a microservice. Aggregates group related entities and enforce business rules, ensuring cohesion within a microservice.

- **Anti-Corruption Layer (ACL)**: When integrating with external systems or other bounded contexts, DDD suggests using an **anti-corruption layer**. This pattern ensures that the microservice remains insulated from external complexities or legacy systems, maintaining loose coupling.

- **Event-Driven Architecture**: DDD aligns well with **event-driven architectures** commonly used in microservices. Events represent domain changes and are propagated across microservices, enabling loose coupling while ensuring that services remain synchronized with business state changes.

By applying DDD principles, microservices can be structured around the core business logic, promoting high cohesion within services and clear separation between services (low coupling), making the system easier to scale, maintain, and evolve.
