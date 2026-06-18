# Microservices Scaling and Deployment

## Questions Covered

1. How do you scale individual microservices?
2. How do you deploy microservices in a containerized environment using Docker?
3. What is orchestration, and how does Kubernetes help in managing microservices?
4. How do you manage rolling updates and zero-downtime deployments?
5. Difference between blue-green deployment and A/B testing?
6. What is sharding, and how does it scale microservices?

## How do you scale individual microservices?

| Strategy | Description |
|----------|-------------|
| **Horizontal scaling (out)** | Replicate instances; load balancer distributes traffic; **auto-scaling** on CPU/memory/request metrics |
| **Vertical scaling (up)** | Increase CPU/memory/storage per instance — limited by host capacity, less flexible |
| **Sharding** | Partition data by key (user ID, region); each instance owns a subset |
| **Functionality segmentation** | Split monolith into focused microservices scaled independently |
| **Caching** | Redis/Memcached for frequently requested data |
| **Rate limiting** | Cap requests during peak traffic |
| **Monitoring** | Track latency, throughput, errors to identify bottlenecks |

## How do you deploy microservices in a containerized environment using Docker?

1. **Containerize** — Write a Dockerfile per microservice:

```json
# Example Dockerfile for a .NET Core microservice
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["MyMicroservice/MyMicroservice.csproj", "MyMicroservice/"]
RUN dotnet restore "MyMicroservice/MyMicroservice.csproj"
COPY . .
WORKDIR "/src/MyMicroservice"
RUN dotnet build "MyMicroservice.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "MyMicroservice.csproj" -c Release -o /app/publish
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyMicroservice.dll"]
```

2. **Build image:**

```json
docker build -t mymicroservice:latest .
```

3. **Run container:**

```json
docker run -d -p 8080:80 --name mymicroservice mymicroservice:latest
```

4. **Docker Compose (optional)** — Multi-service YAML with dependencies:

```json
version: '3.8'
services:
mymicroservice:
image: mymicroservice:latest
ports:
- "8080:80"
environment:
- ASPNETCORE_ENVIRONMENT=Production
anothermicroservice:
image: anothermicroservice:latest
ports:
- "8081:80"
```

5. **Deploy to orchestrator** — Kubernetes, Docker Swarm, or ECS. Example K8s deployment + service:

```json
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
name: mymicroservice
spec:
replicas: 3
selector:
matchLabels:
app: mymicroservice
template:
metadata:
labels:
app: mymicroservice
spec:
containers:
- name: mymicroservice
image: mymicroservice:latest
ports:
- containerPort: 80
# Service
apiVersion: v1
kind: Service
metadata:
name: mymicroservice
spec:
type: LoadBalancer
ports:
- port: 80
targetPort: 80
selector:
app: mymicroservice
```

6. **Deploy** — `kubectl apply -f deployment.yaml`; orchestrator handles scaling, networking, health.
7. **Monitor** — Prometheus, Grafana, ELK, or similar.

## What is orchestration, and how does Kubernetes help in managing microservices?

**Orchestration** automates deployment, scaling, monitoring, and coordination of containerized microservices.

| Aspect | Description |
|--------|-------------|
| Service discovery | Auto-connect services without hardcoded endpoints |
| Load balancing | Distribute traffic across instances |
| Scaling | Adjust instances by load/metrics |
| Health monitoring | Restart/replace unhealthy instances |
| Config management | Dynamic configuration |

**Kubernetes** provides: container lifecycle management; rolling/blue-green deployments; built-in service discovery and load balancing; **HPA** auto-scaling; self-healing; resource requests/limits; **ConfigMaps** and **Secrets** for configuration.

## How do you manage rolling updates and zero-downtime deployments?

**Rolling updates** — Gradually replace old instances with new ones; some always available.

Kubernetes config:

```json
strategy:
type: RollingUpdate
rollingUpdate:
maxUnavailable: 1
maxSurge: 1
```

- `maxUnavailable` — pods down during update; `maxSurge` — extra pods above desired count.
- Define **readiness/liveness probes** so traffic routes only to healthy pods.
- Monitor and roll back on failure.

**Zero-downtime strategies:**

| Strategy | How it works |
|----------|--------------|
| **Blue-green** | Two identical envs; switch traffic after green is validated |
| **Canary** | Route small traffic subset to new version; gradually increase |
| **Service mesh** | Istio/Linkerd for traffic splitting, retries, circuit breaking |
| **DB migrations** | Backward-compatible schema changes during transition |
| **Load balancer** | Route by service health for smooth version transitions |

## Difference between blue-green deployment and A/B testing?

| Aspect | Blue-Green Deployment | A/B Testing |
|--------|----------------------|-------------|
| **Purpose** | Safe deployment with minimal downtime | Compare variants to determine better performance |
| **Environment** | Two identical envs (active blue, idle green) | Multiple variants in same environment |
| **Traffic** | Switch all traffic at once after validation | Split traffic (e.g., 50/50) |
| **Release** | Full deploy with rollback support | Feature/experiment testing, not full release |
| **Monitoring** | New version health before switch | User engagement and interaction metrics |
| **Use case** | Strict uptime requirements | Experiment with features/UI |

## What is sharding, and how does it scale microservices?

**Sharding** partitions a large database into **shards** — smaller subsets distributed across servers.

**How it works:**

1. **Partition** by shard key (user ID, region, etc.)
2. **Independent DBs** per shard — separate read/write load
3. **Horizontal scale** — add shards and servers as data grows

**Scaling benefits:**

| Benefit | Description |
|---------|-------------|
| Performance | Reduced per-DB load, lower latency |
| Throughput | Parallel reads/writes across shards |
| Resource optimization | Heavy shards on powerful hardware |
| Fault isolation | One shard failure doesn't affect others |
| Easier maintenance | Backup/update individual shards |
| Scalability | Add shards without major architecture changes |
