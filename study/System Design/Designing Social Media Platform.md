# Designing Social Media Platform

## Questions Covered

1. How would you design a social media platform that supports features like user profiles, posts, comments, and likes?
2. What database schema would you use to store user-generated content efficiently?
3. How would you ensure that content is delivered quickly to users across the globe?

## How would you design a social media platform that supports features like user profiles, posts, comments, and likes?

**1. Architecture**

- **Microservices** — User, Post, Comment, Like services; independent scaling and fault isolation.
- **API Gateway** — routing, auth, rate limiting; centralized cross-cutting concerns.

**2. Frontend** — responsive web (React/Angular/Vue) + native/hybrid mobile apps.

**3. Backend microservices:**

| Service | Responsibilities | Data |
|---------|------------------|------|
| User | Profiles, auth, settings | username, email, profile picture |
| Post | Create/retrieve/delete posts | content, timestamp, user ID |
| Comment | Comments on posts | content, user ID, post ID |
| Like | Add/remove likes | user ID, post ID, timestamp |

- **Sync:** HTTP/REST or gRPC for real-time interactions.
- **Async:** RabbitMQ/Kafka for notifications and background tasks.

**4. Data management**

- **SQL** — structured data (profiles, posts); integrity + complex queries.
- **NoSQL** — semi-structured data (comments, likes); horizontal scale.
- **Elasticsearch** — fast post/comment search.
- **Partitioning** — smaller query sets, better performance.
- **Caching** — Redis/Memcached for popular posts and profiles.

**5. Scalability** — horizontal scaling + load balancers; auto-scaling; CDN for static assets.

**6. Security** — OAuth/JWT auth; HTTPS; rate limiting + DDoS protection.

**7. Monitoring** — Prometheus/Grafana (metrics); ELK Stack (logs); analytics (Google Analytics, Mixpanel).

**8. UX** — personalized feeds; real-time push/in-app notifications.

**Architecture flow:** Client → API Gateway → Microservices → SQL/NoSQL/Search → Cache → Load Balancer → Auto-Scaling → CDN → Monitoring.

## What database schema would you use to store user-generated content efficiently?

Balance normalization with performance for high-volume UGC.

### Relational schema (PostgreSQL/MySQL)

| Table | Key columns |
|-------|-------------|
| **Users** | UserID (PK), Username (unique), Email (unique), PasswordHash, ProfilePictureURL, CreatedAt, UpdatedAt |
| **Posts** | PostID (PK), UserID (FK), Content, ImageURL, CreatedAt, UpdatedAt |
| **Comments** | CommentID (PK), PostID (FK), UserID (FK), Content, CreatedAt, UpdatedAt |
| **Likes** | LikeID (PK), PostID (FK), UserID (FK), CreatedAt |

Index foreign keys (UserID, PostID) and frequently queried fields.

### NoSQL schema (MongoDB)

**Users collection:**

```json
{
"_id": ObjectId, // Unique UserID
"username": "string",
"email": "string",
"passwordHash": "string",
"profilePictureURL": "string",
"createdAt": ISODate,
"updatedAt": ISODate
}
```

**Posts collection (embedded comments/likes):**

```json
{
"_id": ObjectId, // Unique PostID
"userID": ObjectId, // Reference to UserID
"content": "string",
"imageURL": "string",
"createdAt": ISODate,
"updatedAt": ISODate,
"comments": [ // Embedded array of comments
{
"commentID": ObjectId,
"userID": ObjectId,
"content": "string",
"createdAt": ISODate
}
],
"likes": [ // Embedded array of likes
{
"userID": ObjectId,
"createdAt": ISODate
}
]
}
```

### Design considerations

| Concern | Relational | NoSQL |
|---------|------------|-------|
| Normalization | Normalize; FK relationships | Denormalize; embed for read speed |
| Scalability | Partitioning, indexing, sharding | Horizontal distribution across nodes |
| Access patterns | JOINs + indexes | Embed hot data; index strategically |
| Security | Hashed passwords, access controls, backups | Same measures |
| Consistency | ACID + FK constraints | Eventual or strong per use case |

## How would you ensure that content is delivered quickly to users across the globe?

Address latency, bandwidth, and regional data distribution.

| Strategy | What | How |
|----------|------|-----|
| **CDN** | Cache content near users | Cloudflare, Akamai, CloudFront; cache static assets; configure TTL/purge rules |
| **Geo load balancing** | Route to nearest data center | AWS Route 53, GCP Load Balancing; latency/health-based routing |
| **Edge computing** | Process near users | Lambda@Edge, Azure IoT Edge; offload computation from central servers |
| **Content optimization** | Reduce payload size | Image compression (WebP); minify CSS/JS/HTML; Brotli/Gzip |
| **Database optimization** | Faster data retrieval | Multi-region replication (Aurora Global); query/index optimization; Redis/Memcached |
| **Network optimization** | Lower transport latency | HTTP/2 multiplexing; TCP tuning; DNS prefetching |
| **Application optimization** | Faster responses | Async non-critical loading; optimized APIs; efficient algorithms |
| **Monitoring** | Continuous tuning | New Relic, Datadog, Prometheus; load testing; bottleneck analysis |
