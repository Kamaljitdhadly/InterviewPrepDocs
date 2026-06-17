# Kubernetes and Service Mesh

## Questions Covered

1. What is a service mesh, and how does it work with Kubernetes?
2. What is Istio, and how does it integrate with Kubernetes?
3. What are the key advantages of using a service mesh in a Kubernetes cluster?

## What is a service mesh, and how does it work with Kubernetes?

A **service mesh** is a dedicated infrastructure layer for **service-to-service communication** in microservices — traffic management, discovery, load balancing, security (mTLS), observability, and resilience **without app code changes**.

### How It Works in Kubernetes

| Component | Role |
|-----------|------|
| **Sidecar proxy** | Deployed in the same Pod as each service; intercepts all inbound/outbound traffic |
| **Control plane** | Central config for routing, observability, and security policies |
| **Data plane** | Sidecar proxies execute actual inter-service traffic |

## What is Istio, and how does it integrate with Kubernetes?

**Istio** is a popular service mesh for advanced traffic management, security, and observability.

### Architecture

| Plane | Components |
|-------|------------|
| **Control plane** | **Pilot** (traffic mgmt), **Mixer** (policy/telemetry), **Citadel** (security) |
| **Data plane** | **Envoy** sidecar proxies alongside each service |

### Capabilities

- **Traffic management** — canary, blue/green, retries, routing rules
- **Security** — mutual TLS for encrypted, authenticated service-to-service comms
- **Observability** — metrics, logs, traces via Prometheus, Grafana, Jaeger
- **K8s integration** — uses **CRDs** for routing rules and policies; deploys via standard K8s resources

## What are the key advantages of using a service mesh in a Kubernetes cluster?

| Advantage | Benefit |
|-----------|---------|
| **Traffic management** | Load balancing, retries, circuit breaking, canary rollouts; smoother deploys and spike handling |
| **Security** | mTLS + fine-grained access policies without app changes |
| **Observability** | Built-in metrics, logs, traces for debugging and tuning |
| **Resilience** | Circuit breaking and retries improve fault tolerance |
| **Service discovery** | Dynamic routing as services scale up/down |
| **Decoupling** | Networking separated from business logic |
| **Policy enforcement** | Centralized traffic, security, and access rules |
| **Multi-cluster / hybrid** | Unified mesh across clusters, cloud, and on-prem |
