# Kubernetes Networking and Storage

## Questions Covered

1. What is the Kubernetes networking model?
2. What are Services in Kubernetes, and what are the different types?
3. What is a ClusterIP service?
4. What is a NodePort service?
5. What is a LoadBalancer service in Kubernetes?
6. What is an Ingress in Kubernetes?
7. How does service discovery work in Kubernetes?
8. How does Kubernetes handle IP address management?
9. What are the different types of volumes in Kubernetes?
10. Explain how Persistent Volumes and Persistent Volume Claims work.

## What is the Kubernetes networking model?

Defines how **Pods**, **Services**, and external networks communicate. Core to running apps in a cluster.

### Key Principles

1. **Flat Network Namespace** — Every Pod gets its own IP; Pods communicate directly across nodes (no default isolation).
2. **Pod-to-Pod Communication** — Cross-node reachability via Pod IPs without NAT.
3. **Service Discovery** — Built-in via Services + DNS; Pods use service names instead of IPs.
4. **Service Abstraction** — Stable endpoints over ephemeral Pod IPs via labels/selectors.
5. **Network Policies** — Rules controlling Pod-to-Pod traffic for security/isolation.

### Components

| Component | Role |
|-----------|------|
| **Pod Network** | Unique Pod IP from CNI-managed range |
| **Services** | ClusterIP (internal), NodePort, LoadBalancer, ExternalName |
| **Ingress** | HTTP(S) routing rules; needs Ingress Controller |
| **DNS** | Auto-resolves Services/Pods (e.g. `my-service.default.svc.cluster.local`) |
| **Network Policies** | Traffic control via network plugins |
| **CNI Plugins** | IP allocation, routing, isolation (Calico, Flannel, Weave, etc.) |

### Networking Flow

1. **Pod Communication** — Pod A (Node 1) → Pod B (Node 2) via assigned IPs (CNI).
2. **Service Access** — Stable IP/DNS (`my-service.default.svc.cluster.local`) routes to matching Pods.
3. **Ingress Routing** — HTTP(S) traffic routed by URL/hostname to backend Services.
4. **Network Policy** — Restrict traffic between Pod groups.

## What are Services in Kubernetes, and what are the different types?

A **Service** abstracts a logical set of Pods with a stable endpoint (DNS name). Survives Pod churn.

| Type | Description | Use Case |
|------|-------------|----------|
| **ClusterIP** | Cluster-internal IP (default) | Internal Pod-to-Pod communication |
| **NodePort** | Static port (30000–32767) on every Node | External access via `<NodeIP>:<NodePort>` |
| **LoadBalancer** | Cloud LB + public IP | Production external access |
| **ExternalName** | CNAME to external DNS | Point to off-cluster services (DB, API) |

## What is a ClusterIP service?

Default Service type. **Internal-only** stable IP + DNS for inter-Pod communication.

### Key Characteristics

- **Internal Communication** — Not exposed outside the cluster.
- **Stable IP/DNS** — Other Pods reach it by DNS name.
- **Load Balancing** — Traffic distributed across selector-matched Pods.

### Use Case

- Microservice-to-microservice communication; internal frontends/backends.

### Example YAML Configuration

Here's a basic example of a ClusterIP service:

```yaml
apiVersion: v1
kind: Service
metadata:
```

name: my-service

```yaml
spec:
type: ClusterIP
selector:
```

app: my-app

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 8080

- Selects `app=my-app`; port 80 → targetPort 8080.

## What is a NodePort service?

Exposes a Service on a **static port on every Node** — accessible externally via `<NodeIP>:<NodePort>`.

### Key Characteristics

- **External Access** — Any Node IP + assigned NodePort.
- **Static Port** — Range 30000–32767.
- **Load Balancing** — Across selector-matched Pods on all Nodes.

### Use Case

- Dev/test or when cloud LB/Ingress unavailable.

### Example YAML Configuration

Here's an example of a NodePort service:

```yaml
apiVersion: v1
kind: Service
metadata:
```

name: my-service

```yaml
spec:
type: NodePort
selector:
```

app: my-app

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 8080

nodePort: 30007

- Accessible at `<NodeIP>:30007`.

### Limitations

- Port range 30000–32767; security risk if not managed.

## What is a LoadBalancer service in Kubernetes?

Exposes a Service externally via a **cloud provider load balancer** with a public IP.

### Key Characteristics

- **External Access** — Public IP routes to Service.
- **Cloud Integration** — AWS, Azure, GCP provision LB + firewall/health checks.
- **Automatic Provisioning** — Kubernetes configures LB.
- **Stable Endpoint** — Consistent IP/DNS for clients.

### Use Case

- Production workloads needing HA and scalable external access.

### Example YAML Configuration

Here's an example of a LoadBalancer service:

```yaml
apiVersion: v1
kind: Service
metadata:
```

name: my-service

```yaml
spec:
type: LoadBalancer
selector:
```

app: my-app

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 8080

### Limitations

- Higher cost; cloud-provider dependent.

## What is an Ingress in Kubernetes?

**Ingress** manages external HTTP/HTTPS access — routes by URL path or hostname; multiple Services behind one IP/domain.

### Key Characteristics

- **URL Routing** — Path/hostname-based rules.
- **TLS/SSL Termination** — HTTPS terminated at Ingress, forwarded as HTTP.
- **Load Balancing** — Distributes traffic to backend Pods.
- **Single Entry Point** — One IP/domain for many Services.

### Ingress Controllers

Requires an **Ingress Controller** to enforce rules:

- NGINX Ingress Controller, Traefik, HAProxy Ingress, Istio

### Example YAML Configuration

Here's a basic example of an Ingress resource:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
```

name: my-ingress

```yaml
spec:
```

rules:

- host: myapp.example.com

http:

paths:

- path: /app1

pathType: Prefix

backend:

service:

name: app1-service

port:

number: 80

- path: /app2

pathType: Prefix

backend:

service:

name: app2-service

port:

number: 80

tls:

- hosts:

- myapp.example.com

secretName: my-tls-secret

- `/app1` → `app1-service:80`; `/app2` → `app2-service:80`; TLS via `my-tls-secret`.

### Use Case

- Multi-service single domain; path-based routing; centralized TLS.

## How does service discovery work in Kubernetes?

Mechanisms for Pods/Services to find and communicate within a cluster.

### 1. DNS-Based Service Discovery

- Each Service gets a DNS name: `my-service.default.svc.cluster.local`.
- Resolved to ClusterIP; kube-proxy routes to backend Pods.

### 2. Environment Variables

- Injected at Pod creation: `SERVICE_NAME_SERVICE_HOST`, `SERVICE_NAME_SERVICE_PORT`.
- Example: `MY_SERVICE_SERVICE_HOST`, `MY_SERVICE_SERVICE_PORT`.

### 3. Endpoints

- **Endpoints** objects map Service → Pod IPs/ports; auto-updated.
- Queryable via Kubernetes API for Pod details.

### 4. Headless Services

- `clusterIP: None` — no load balancing; DNS returns individual Pod records (`pod-name.my-service.default.svc.cluster.local`).

### Example of Service Discovery Using DNS

Suppose you have a service named web-service in the default namespace. Here's how you can use it from a Pod:

# Example command to curl the service using its DNS name

curl http://web-service.default.svc.cluster.local

| Method | Purpose |
|--------|---------|
| DNS | Stable, resolvable service names |
| Env vars | Service details injected into Pods |
| Endpoints | Pod-level backend mapping |
| Headless | Direct Pod access without LB |

## How does Kubernetes handle IP address management?

### 1. Pod IP Addressing

- **Dynamic allocation** — Unique IP per Pod via CNI plugin.
- **Reuse** — IP released on Pod deletion; no conflicts.

### 2. Service IP Addressing

- **ClusterIP** — Stable internal IP from Service range.
- **kube-proxy** — Routes via iptables or IPVS.

### 3. Network Policies

- Control Pod communication by IP + labels.

### 4. External IP Management

- **NodePort** — Port on each Node IP.
- **LoadBalancer** — Cloud-assigned public IP.

### 5. Headless Services

- `clusterIP: None` — DNS per Pod, no ClusterIP.

### 6. IPAM (CNI)

- CNI plugins handle allocation; admins define Pod/Service CIDR ranges.

### Example of IP Address Allocation

When a Pod is created, the network plugin allocates an IP address from a pre-defined pool. If a Service is created with a ClusterIP, Kubernetes assigns a stable IP address from the Service IP range. If a NodePort or LoadBalancer service is created, Kubernetes ensures that traffic to these services is correctly routed based on the assigned IP addresses and ports.

| Resource | IP Behavior |
|----------|-------------|
| Pod | Unique, dynamic (CNI) |
| Service | Stable ClusterIP / NodePort / LB |
| Headless | Per-Pod DNS, no ClusterIP |
| Network Policy | IP + label-based rules |

## What are the different types of volumes in Kubernetes?

Volumes provide storage beyond Pod lifecycle; enable data sharing.

| Type | Description | Use Case |
|------|-------------|----------|
| **emptyDir** | Temp volume on Node; deleted with Pod | Scratch space, cache |
| **hostPath** | Host filesystem mount | Node-local access (not prod) |
| **persistentVolumeClaim** | Claims a PV | Databases, stateful apps |
| **configMap** | Key-value config data | Config files, env vars |
| **secret** | Sensitive data (base64) | Passwords, tokens, keys |
| **nfs** | NFS share | Shared file storage across Pods |
| **awsElasticBlockStore** | AWS EBS | AWS block storage |
| **azureDisk** | Azure Disk | Azure block storage |
| **gcePersistentDisk** | GCE PD | GCP block storage |
| **cinder** | OpenStack Cinder | OpenStack block storage |
| **cephFS** | CephFS | Distributed shared storage |
| **glusterfs** | GlusterFS | Scalable distributed FS |
| **projected** | Combines ConfigMap, Secret, downwardAPI | Aggregated config |
| **downwardAPI** | Pod/container metadata as files | Runtime metadata access |
| **storageClass** | Dynamic PV provisioning | Automated storage by class |

**Categories:** Temporary → emptyDir | Host → hostPath | Persistent → PVC | Config/Secrets → configMap, secret | Network → nfs | Cloud → EBS, azureDisk, gcePD | Distributed → cephFS, glusterfs

## Explain how Persistent Volumes and Persistent Volume Claims work.

**PVs** = cluster storage resources; **PVCs** = user requests that bind to PVs. Abstract storage from Pod lifecycle.

### Persistent Volume (PV)

- Provisioned statically or dynamically via **StorageClass**.
- Independent lifecycle; reusable across Pods.
- Attributes: capacity, access modes (RWO, ROX, RWX), storage class.

- **Example YAML Configuration**:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
name: my-pv
spec:
capacity:
storage: 10Gi
accessModes:
- ReadWriteOnce
hostPath:
path: /mnt/data
In this example:
```

- 10Gi, ReadWriteOnce, hostPath `/mnt/data`.

### Persistent Volume Claim (PVC)

- User request specifying size, access modes, storage class.
- Kubernetes binds to matching PV or dynamically provisions one.

- **Example YAML Configuration**:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
name: my-pvc
spec:
accessModes:
- ReadWriteOnce
resources:
requests:
storage: 5Gi
In this example:
```

- Requests 5Gi, ReadWriteOnce.

### How They Work Together

1. **Provisioning** — Admin creates PVs or StorageClass enables dynamic provisioning.
2. **Claiming** — User creates PVC with required attributes.
3. **Binding** — Kubernetes matches PVC → PV (or provisions new PV).
4. **Usage** — Pod mounts PVC as volume.
5. **Reclaim Policy** — On PVC delete: **Retain** (keep PV), **Recycle** (scrub), **Delete** (remove storage).

| Concept | Role |
|---------|------|
| **PV** | Physical/logical storage in cluster |
| **PVC** | Storage request bound to a PV |
