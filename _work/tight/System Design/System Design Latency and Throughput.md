# System Design Latency and Throughput

## Questions Covered

1. What is latency, and how can it be reduced?
2. What is throughput, and how is it measured?
3. How do latency and throughput affect system design?

## What is latency, and how can it be reduced?

**Definition:** Time for a data packet to travel from source to destination (typically ms). Critical for real-time apps.

**How to reduce latency:**

| Technique | Approach |
|-----------|----------|
| Optimize network routes | CDNs to serve content near users |
| Reduce payload size | Compression; efficient formats (JSON over XML); trim API responses |
| Caching | Browser, CDN, and server caches for hot data |
| Optimize DB queries | Indexing, query tuning, stored procedures |
| Reduce server processing | Efficient algorithms; async processing; minimize blocking |
| Upgrade network infra | Faster connections, routers, switches |
| Edge computing | Deploy services near end-users |

## What is throughput, and how is it measured?

**Definition:** Amount of data processed or transmitted per unit time — requests/sec (RPS), transactions/sec (TPS), or bits/sec (bps).

**How to measure:**

1. Identify the metric (DB transactions, API requests, bandwidth).
2. Select a time interval (per second, minute, hour).
3. Count completed events in that interval.
4. Calculate: `Throughput = Total Completed Events / Time Interval (seconds)`

```json
Throughput=Total Completed EventsTime Interval (seconds)\text{Throughput} = \frac{\text{Total Completed Events}}{\text{Time Interval (seconds)}}Throughput=Time Interval (seconds)Total Completed Events​
For example, if 1000 requests were processed in 10 seconds, the throughput would be:
Throughput=1000 requests10 seconds=100 requests/second\text{Throughput} = \frac{1000 \text{ requests}}{10 \text{ seconds}} = 100 \text{ requests/second}Throughput=10 seconds1000 requests​=100 requests/second
```

**Example:** 1000 requests in 10 seconds → **100 requests/second**.

Reducing latency improves responsiveness; maximizing throughput ensures the system handles required load.

## How do latency and throughput affect system design?

| Dimension | Latency impact | Throughput impact |
|-----------|----------------|-------------------|
| **Performance** | High latency hurts real-time UX (gaming, trading); mitigate via caching, efficient DB access, network tuning | Low throughput creates bottlenecks; mitigate via load balancing, horizontal scaling, async processing |
| **Scalability** | Must keep latency low when adding machines; efficient sync, routing, service discovery | System must sustain throughput during traffic spikes (critical for cloud apps) |
| **Architecture** | Service/data placement matters; event-driven architectures decouple components | Message queues, stream processing, microservices distribute workload |
| **Resource allocation** | More CPU/memory lowers latency but raises cost — balance performance vs budget | Allocate for peak throughput; auto-scaling based on demand |
| **User experience** | Users sensitive to delays; low latency essential for real-time apps | High throughput supports many concurrent users without degradation |
