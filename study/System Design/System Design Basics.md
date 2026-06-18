# System Design Basics

## Questions Covered

1. What is scalability, and why is it important?
2. Explain horizontal scaling vs. vertical scaling.
3. How would you design a system to handle increasing amounts of data or traffic?
4. What is a load balancer, and how does it work?
5. Describe different load balancing algorithms?
6. What is consistent hashing?
7. How would you implement load balancing for a web application?
8. What is caching, and why is it used?
9. Explain different caching strategies (write-through, write-around, write-back).
10. How do you decide what data to cache?
11. What are the differences between SQL and NoSQL databases?
12. How would you design a schema for a relational database?
13. Explain database normalization and denormalization.
14. What is data partitioning, and why is it used?
15. How does sharding work, and when would you use it?
16. What are the challenges associated with data sharding?
17. What is high availability, and how can it be achieved?
18. How would you design a fault-tolerant system?
19. Describe common techniques for ensuring fault tolerance.

## What is Scalability, and Why is it Important?

**Scalability** is a system's ability to handle growing workloads or accommodate growth without degrading. It applies to both software and hardware.

**Why it matters:**

- **Future-proofing** — adapt to growth without major infrastructure overhauls.
- **Cost-effectiveness** — scale capacity incrementally instead of large upfront investments.
- **Performance** — maintain throughput as users/transactions increase; avoid bottlenecks.
- **Flexibility** — adjust resources to match fluctuating demand.

## Explain Horizontal Scaling vs. Vertical Scaling

| Aspect | Horizontal (Scale Out/In) | Vertical (Scale Up/Down) |
|--------|---------------------------|--------------------------|
| Definition | Add more machines/instances | Add CPU/RAM/storage to one machine |
| Redundancy | High — other nodes absorb failure | Low — single point of failure |
| Load distribution | Traffic spread across instances | All load on one machine |
| Management | More nodes to operate | Simpler — fewer machines |
| Limits | Scales with cluster size | Hard ceiling per machine |
| Cost model | Pay-as-you-go in cloud | Often expensive at top tier |
| Examples | More web servers, DB replicas | Upgrade server RAM/CPU |

**When to use:** horizontal for distributed, high-traffic systems; vertical for simpler apps with moderate growth.

## How Would You Design a System to Handle Increasing Amounts of Data or Traffic?

Combine architectural, data, and operational strategies:

1. **Architecture** — microservices (independent deploy/scale); event-driven design with message queues (RabbitMQ, Kafka) to decouple components and absorb traffic spikes.
2. **Database scaling** — horizontal sharding; read replicas; NoSQL (MongoDB, Cassandra) for unstructured data at scale.
3. **Caching** — in-memory cache (Redis, Memcached); CDNs for static assets at the edge.
4. **Load balancing** — distribute traffic via round-robin, least connections, or IP hashing.
5. **Auto-scaling** — dynamically adjust instance count from traffic/resource metrics.
6. **Monitoring** — Prometheus/Grafana for metrics; alerts on anomalies.
7. **Testing** — load testing and query optimization to find and fix bottlenecks.

## What is a Load Balancer, and How Does It Work?

A **load balancer** distributes incoming traffic across multiple backend servers so no single server becomes a bottleneck.

**How it works:**

1. **Traffic distribution** — forwards requests using an algorithm (round robin, least connections, IP hash).
2. **Health monitoring** — health checks remove failed servers from rotation.
3. **Session persistence** — sticky sessions route the same client to the same server.
4. **SSL termination** — handles TLS encryption/decryption, offloading CPU from backends.
5. **Scalability & redundancy** — enables horizontal scaling; reroutes traffic on failure.

**Types:**

| Type | Examples | Trade-off |
|------|----------|-----------|
| Hardware | Dedicated appliances | High performance, high cost |
| Software | NGINX, HAProxy | Flexible, lower cost |
| Cloud | AWS ELB, Azure/GCP LB | Auto-scales with demand |

## Describe Different Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|--------------|----------|
| Round Robin | Rotates requests evenly across servers | Homogeneous servers, similar request times |
| Least Connections | Routes to server with fewest active connections | Varying request durations |
| IP Hash | Hashes client IP to a fixed server | Session persistence |
| Weighted Round Robin | Round robin weighted by server capacity | Heterogeneous server sizes |
| Weighted Least Connections | Least connections adjusted by weight | Mixed capacity + varying load |
| Random | Random server selection | Simple; uneven under mixed capacity |
| Latency-Based | Routes to lowest-latency server | Latency-sensitive apps |
| Least Response Time | Routes by measured response time | Real-time applications |
| Geographic | Routes to nearest data center | Global user base |

## What is Consistent Hashing?

**Consistent hashing** distributes data across a dynamic set of nodes (servers, caches) while minimizing redistribution when nodes are added or removed.

**Key concepts:**

1. **Hash ring** — nodes and keys are hashed onto a virtual circle; each key maps to the next node clockwise.
2. **Node add/remove** — only keys in the affected range move (not the entire dataset).
3. **Load balancing** — hash function spreads keys evenly across nodes.
4. **Virtual nodes** — multiple ring positions per physical node improve balance for uneven capacities.

**Use cases:** distributed caches (Memcached), DynamoDB, any cluster that grows/shrinks dynamically.

## How Would You Implement Load Balancing for a Web Application?

1. **Requirements** — analyze traffic patterns, latency needs, and whether session persistence is required.
2. **Choose type** — hardware (high throughput), software (NGINX/HAProxy), or cloud (AWS ALB, Azure/GCP LB).
3. **Pick algorithm** — round robin/least connections for stateless apps; IP hash/sticky sessions for stateful apps.
4. **Deploy** — cloud console (e.g., AWS ALB → EC2/containers) or on-prem NGINX/HAProxy config with backend server list.
5. **Health checks** — ping or HTTP checks; remove unhealthy backends automatically.
6. **SSL termination** — terminate TLS at the LB; install certificates there.
7. **Monitor & scale** — CloudWatch/Azure Monitor; auto-scale backend pools on traffic.

## What is Caching, and Why Is It Used?

**Caching** stores frequently accessed data in fast temporary storage (the **cache**) instead of fetching from slower sources (DB, API, disk).

**Why cache:**

- **Performance** — memory reads are orders of magnitude faster than DB/API calls.
- **Reduced backend load** — fewer queries under heavy traffic.
- **Lower cost** — fewer billable DB reads and API calls in cloud environments.
- **Scalability** — serve hot data without scaling every backend tier.

**Cache types:**

| Type | Storage | Examples / Use |
|------|---------|----------------|
| In-memory | RAM | Redis, Memcached — sessions, API responses |
| Database | Query result cache | Repeated expensive queries |
| CDN | Edge locations | Static assets (images, CSS, JS) |
| Browser | Client local | Repeat-visit page assets |

**Read strategies:**

| Strategy | Behavior |
|----------|----------|
| Cache-aside (lazy) | Load on miss; write to cache after DB fetch |
| Write-through | Write to cache and DB simultaneously |
| Write-behind | Write to cache first; async DB sync |
| TTL | Expire entries; refresh on next access |

**Common use cases:** API responses, session/profile data, hot DB queries, CDN-served static content.

## Explain different caching strategies (write-through, write-around, write-back).

| Strategy | Write Path | Read Path | Pros | Cons |
|----------|-----------|-----------|------|------|
| **Write-through** | Cache + backing store updated together | Always from cache (consistent) | Strong consistency; simple reads | Write latency; poor for write-heavy workloads |
| **Write-around** | Bypass cache → DB directly | DB fetch on miss, then cache | Avoids cache pollution on writes | Stale cache until first read; read latency after write |
| **Write-back** (write-behind) | Cache first; async/batched DB write | From cache | Fast writes; reduced DB write load | Data loss risk on cache failure; eventual consistency complexity |

## How do you decide what data to cache?

| Factor | Cache When… |
|--------|-------------|
| Access frequency | Data is read often (hot data) |
| Data size | Fits cache budget relative to value |
| Read/write ratio | Reads ≫ writes |
| Volatility | Data is stable or changes infrequently |
| Latency requirements | Sub-millisecond response needed |
| Retrieval cost | DB/API fetch is expensive |
| Data relationships | Related items accessed together — cache as a unit |
| User sessions/profiles | Per-user data needed on every request |

Monitor hit rates and access patterns continuously; evict or skip caching data with poor ROI.

## What are the differences between SQL and NoSQL databases?

| **Feature** | **SQL Databases** | **NoSQL Databases** |
|----|----|----|
| **Data Model** | Structured data in tables with rows and columns | Flexible schemas (document, key-value, graph, column-family) |
| **Schema** | Fixed schema; requires defining structure in advance | Dynamic schema; structure can evolve over time |
| **Query Language** | Uses Structured Query Language (SQL) for queries | Uses various query languages, often more flexible and JSON-like |
| **Transactions** | Supports ACID transactions for reliability | Often uses BASE (Basically Available, Soft state, Eventually consistent) |
| **Scalability** | Typically scales vertically (adding more resources to a single server) | Scales horizontally (adding more servers to handle increased load) |
| **Data Relationships** | Strong support for relationships via foreign keys and joins | May support relationships but often denormalizes data for performance |
| **Use Cases** | Best for structured data and complex queries (e.g., banking, CRM) | Suited for unstructured or semi-structured data (e.g., social media, big data) |
| **Examples** | MySQL, PostgreSQL, Oracle, Microsoft SQL Server | MongoDB, Cassandra, Couchbase, Redis, DynamoDB |

## How would you design a schema for a relational database?

1. **Requirements** — business rules, data types, entity relationships.
2. **Identify entities** — e.g., Students, Courses, Enrollments, Professors.
3. **Define attributes** — columns and types per entity.
4. **Establish relationships** — 1:1, 1:N, M:N via junction tables and foreign keys.
5. **Normalize** — aim for 3NF (atomic values, no partial/transitive dependencies).
6. **Primary keys** — unique identifier per table.
7. **Indexes** — on frequently queried columns (e.g., Email).
8. **Constraints** — NOT NULL, UNIQUE, CHECK, FK for integrity.
9. **Document** — entities, relationships, design decisions.
10. **Review** — validate with stakeholders; iterate.

#### Example Schema for a University Management System

sql

Copy code

-- Students Table

CREATE TABLE Students (

StudentID INT PRIMARY KEY AUTO_INCREMENT,

FirstName VARCHAR(50) NOT NULL,

LastName VARCHAR(50) NOT NULL,

Email VARCHAR(100) UNIQUE NOT NULL,

DateOfBirth DATE

```json
);
```

-- Courses Table

CREATE TABLE Courses (

CourseID INT PRIMARY KEY AUTO_INCREMENT,

CourseName VARCHAR(100) NOT NULL,

Credits INT NOT NULL

```json
);
-- Enrollments Table (Many-to-Many Relationship)
```

CREATE TABLE Enrollments (

EnrollmentID INT PRIMARY KEY AUTO_INCREMENT,

StudentID INT,

CourseID INT,

EnrollmentDate DATE NOT NULL,

FOREIGN KEY (StudentID) REFERENCES Students(StudentID),

FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)

```json
);
```

## Explain database normalization and denormalization.

| Aspect | Normalization | Denormalization |
|--------|---------------|-----------------|
| Goal | Reduce redundancy; ensure integrity | Optimize read performance |
| Approach | Split into related tables (1NF → 2NF → 3NF) | Merge tables / duplicate columns |
| Reads | May require joins | Fewer joins, faster queries |
| Writes | Simpler updates (single source of truth) | Must update redundant copies |
| Best for | OLTP, frequently updated data | Read-heavy reporting/analytics |

**Normalization rules:**

- **1NF** — atomic column values; unique rows.
- **2NF** — 1NF + no partial key dependencies.
- **3NF** — 2NF + no transitive dependencies.

*Example:* normalize student courses into separate Courses + Enrollments tables; denormalize by storing course names directly in Enrollments to skip a join.

## What is data partitioning, and why is it used?

**Data partitioning** splits a large dataset into smaller, independently managed segments (partitions) for performance and operability.

| Type | Splits By | Example |
|------|-----------|---------|
| Horizontal | Rows | Customers by region |
| Vertical | Columns | Hot columns vs. cold columns |
| Range | Value range | Sales by date range |
| List | Discrete values | Orders by category |
| Hash | Hash function | Even distribution across partitions |

**Why partition:**

- **Performance** — smaller scans, faster queries.
- **Scalability** — partitions grow independently across servers.
- **Load balancing** — spread workload evenly.
- **Maintenance** — archive/drop old partitions without row-by-row deletes.
- **Availability** — one partition failure doesn't take down all data.

*Example:* retail sales partitioned by year — current-year queries hit only the active partition.

## How does sharding work, and when would you use it?

**Sharding** horizontally partitions data across multiple independent databases (shards), each holding a subset keyed by a **sharding key** (user ID, region, etc.).

**How it works:**

1. Data split into shards by sharding key.
2. Each shard lives on its own DB/server instance.
3. Router (app or middleware) directs queries to the correct shard.
4. Add shards to scale horizontally as data/traffic grows.

**When to shard:**

- Single DB exceeds storage or performance limits.
- High read/write throughput needs distribution.
- Geo-distributed users benefit from data locality.
- Bottlenecks from monolithic DB size.

## What are the challenges associated with data sharding?

| Challenge | Impact |
|-----------|--------|
| Complexity | Harder architecture, routing, and ops |
| Hot shards | Poor key choice → uneven load |
| Cross-shard queries | Slow aggregations across shards |
| Management overhead | Backups, schema changes × N shards |
| Distributed transactions | ACID across shards is difficult |
| Failover/recovery | Per-shard redundancy required |
| Routing latency | Lookup overhead if routing isn't optimized |
| Rebalancing | Data migration is costly and risky |

## What is high availability, and how can it be achieved?

**High Availability (HA)** means a system stays operational with minimal downtime — critical for mission-critical apps.

| Technique | Purpose |
|-----------|---------|
| Redundancy | Duplicate servers, DBs, network paths |
| Load balancing | No single-server failure point |
| Clustering | Multiple servers act as one unit |
| Failover | Auto-switch to standby (active-passive/active-active) |
| Data replication | Cross-region/cross-zone data copies |
| Health monitoring | Early failure detection and remediation |
| Backups | Fast recovery from catastrophic loss |
| DR drills | Validate failover under real conditions |
| Geographic redundancy | Survive regional outages |

## How would you design a fault-tolerant system?

A **fault-tolerant system** continues operating (fully or partially) despite component failures.

1. **Identify critical components** — what must never fail vs. what can degrade.
2. **Redundancy** — duplicate hardware and software instances.
3. **Graceful degradation** — partial failure doesn't kill the whole system (e.g., one microservice down, others serve).
4. **Error handling** — robust logging and exception recovery.
5. **Redundant storage** — replication, mirroring, or sharding across nodes.
6. **Automated failover** — detect failure and switch without manual intervention.
7. **Load balancing** — reroute traffic from failed instances.
8. **Health monitoring** — continuous checks with automated alerts/responses.
9. **Testing** — failure injection and chaos engineering.
10. **Documentation & training** — runbooks for incident response.

**Example:** microservices on Kubernetes with auto-restart, replicated multi-region DB, and LB routing to healthy pods only.

## Describe Common Techniques for Ensuring Fault Tolerance

| Technique | What It Does |
|-----------|--------------|
| Redundancy | Backup hardware/software takes over on failure |
| Replication | Sync/async data copies across nodes/regions |
| Load balancing | Redirect traffic from failed instances |
| Failover | Automated switch to standby systems |
| Partitioning | Isolate failures to one partition |
| Health monitoring | Detect and respond before users are impacted |
| Graceful degradation | Reduced functionality beats total outage |
| Error detection/correction | Checksums, parity, redundancy codes |
| Backup & recovery | Restore data after loss |
| Chaos engineering | Test failure scenarios proactively |
| Distributed systems | Spread workload; isolate blast radius |

Together these techniques ensure systems survive hardware faults, network issues, and software errors with minimal user impact.

---

## Related Topics

- **Microservices Basics** (`Microservices/`)
- **Interview Comparisons** (`Important Concepts/`)
