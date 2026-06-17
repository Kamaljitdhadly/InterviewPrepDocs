# Docker Swarm and Orchestration

## Questions Covered

1. What is Docker Swarm, and how does it relate to container orchestration?
2. How do you create a Docker Swarm?
3. What are the key differences between Docker Swarm and Kubernetes?

## What is Docker Swarm, and how does it relate to container orchestration?

**Docker Swarm** is Docker's native clustering and orchestration tool — built into Docker Engine. It manages multi-container, multi-host deployments with clustering, load balancing, and service discovery.

**Key features:**

- **Cluster management** — Swarm mode treats multiple engines as one unit; **manager** nodes orchestrate, **worker** nodes run tasks.
- **Service management** — define services (web, DB, etc.) and scale via replica count.
- **Load balancing** — internal distribution among replicas; ingress load balancer for external traffic.
- **Service discovery** — DNS-based registration within the cluster.
- **Rolling updates** — update services without downtime; rollback on failure.
- **High availability** — reschedules failed containers; manager consensus for failover.

**How it works:**

```bash
docker swarm init                                          # initialize manager
docker swarm join --token <worker_token> <manager_ip>:2377 # add workers
docker service create --name my-service --replicas 3 nginx:latest
docker service scale my-service=5
docker service ls
```

Swarm vs Kubernetes at a glance: Swarm is simpler and Docker-integrated; Kubernetes offers more advanced features with a steeper learning curve.

## How do you create a Docker Swarm?

**1. Initialize on manager node:**

```bash
docker swarm init
```

Outputs a worker join token and manager IP:port.

**2. Add worker nodes:**

```bash
docker swarm join --token <worker_token> <manager_ip>:2377
```

**3. Add manager nodes (optional, for HA):**

```bash
docker swarm join-token manager
docker swarm join --token <manager_token> <manager_ip>:2377
```

**4. Verify:**

```bash
docker node ls   # lists nodes, roles, status
```

**5. Deploy and manage services:**

```bash
docker service create --name my-service --replicas 3 nginx:latest
docker service scale my-service=5
docker service update --image nginx:latest my-service
docker service inspect my-service
```

## What are the key differences between Docker Swarm and Kubernetes?

| Aspect | Docker Swarm | Kubernetes |
|--------|-------------|------------|
| **Complexity** | Simple; low learning curve | Complex; steep learning curve |
| **Architecture** | Manager + worker nodes | Control plane (API server, scheduler, etc.) + workers |
| **Service discovery** | Built-in DNS | DNS + Services (ClusterIP, NodePort, LoadBalancer) |
| **Load balancing** | Built-in ingress LB | Ingress controllers, MetalLB, cloud LBs |
| **Scaling** | `docker service scale` | HPA, cluster autoscaling, manual |
| **Updates** | Rolling updates, rollback | Rolling, blue-green, canary, auto-rollback |
| **Configuration** | Docker Compose files | YAML manifests (Deployments, ConfigMaps, Secrets) |
| **Management** | Docker CLI / Compose | `kubectl`, K8s API, dashboard |
| **Ecosystem** | Docker-focused; limited plugins | Rich (Helm, Prometheus, operators) |
| **Multi-cloud** | Basic; custom solutions needed | Strong (EKS, GKE, AKS, Anthos, Arc) |
| **Security** | Encrypted node comms, service ACLs | RBAC, network policies, integrated secrets |

**Choose Swarm** for simpler, Docker-native orchestration on small-to-medium deployments.

**Choose Kubernetes** for large-scale, complex deployments needing advanced orchestration, ecosystem tools, and multi-cloud support.
