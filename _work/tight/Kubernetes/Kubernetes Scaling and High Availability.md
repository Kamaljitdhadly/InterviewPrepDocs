# Kubernetes Scaling and High Availability

## Questions Covered

1. How does scaling work in Kubernetes?
2. What is Horizontal Pod Autoscaling (HPA)?
3. What is Vertical Pod Autoscaling?
4. How does Kubernetes achieve high availability?

## How does scaling work in Kubernetes?

K8s scales Pod counts and cluster resources to match demand — **manual** or **automatic**.

### 1. Manual Scaling

Adjust replica count via `kubectl` or YAML.

- **Using kubectl**:

This command scales the deployment named my-deployment to 5 replicas.

```yaml
kubectl scale deployment my-deployment --replicas=5
```

- **Using YAML Configuration**:

```yaml
You can update the replicas field in the deployment's YAML file and apply the changes:
apiVersion: apps/v1
kind: Deployment
metadata:
name: my-deployment
spec:
replicas: 5
...
Apply the configuration with:
kubectl apply -f deployment.yaml
```

### 2. Horizontal Pod Autoscaler (HPA)

Auto-adjusts Pod replicas based on **CPU** (default) or **custom metrics**.

- **Metrics** — CPU, memory, or app-specific via Metrics API
- **Configuration**:

This command creates an HPA for my-deployment that will maintain CPU utilization at 50%, scaling between 2 and 10 replicas as needed.

```yaml
To create an HPA, use the following command:
kubectl autoscale deployment my-deployment --cpu-percent=50 --min=2 --max=10
Alternatively, you can define an HPA using YAML:
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
name: my-hpa
spec:
scaleTargetRef:
apiVersion: apps/v1
kind: Deployment
name: my-deployment
minReplicas: 2
maxReplicas: 10
metrics:
- type: Resource
resource:
name: cpu
target:
type: Utilization
averageUtilization: 50
Apply the HPA with:
kubectl apply -f hpa.yaml
```

### 3. Vertical Pod Autoscaler (VPA)

Auto-adjusts **CPU/memory requests and limits** per Pod based on observed usage.

```yaml
To use VPA, create a VPA resource that targets your deployment:
apiVersion: autoscaling.k8s.io/v1beta2
kind: VerticalPodAutoscaler
metadata:
name: my-vpa
spec:
targetRef:
apiVersion: apps/v1
kind: Deployment
name: my-deployment
updatePolicy:
updateMode: "Auto" # Can also be "Off" or "Initial"
Apply the VPA with:
kubectl apply -f vpa.yaml
```

### 4. Cluster Autoscaler

Adds/removes **nodes** based on unschedulable Pod demand — cloud-provider specific (AWS, Azure, GCP).

### 5. Custom Metrics Autoscaler

Scale on app metrics via **Prometheus** + **Custom Metrics Adapter**.

| Mechanism | Scales |
|-----------|--------|
| Manual | Replica count |
| HPA | Pod replicas (CPU/custom metrics) |
| VPA | Per-Pod resource requests/limits |
| Cluster Autoscaler | Node count |
| Custom metrics | App-specific signals |

## What is Horizontal Pod Autoscaling (HPA)?

**HPA** dynamically adjusts Pod replica count in Deployments (and other controllers) based on observed metrics — maintains performance while optimizing resources.

### How It Works

1. **Metrics collection** — CPU, memory, or custom metrics from Pods
2. **Scaling decisions** — compares observed vs target utilization; adjusts replicas
3. **Continuous loop** — HPA controller re-evaluates on interval

### Key Components

- **Metrics Server** — cluster-wide CPU/memory aggregator
- **HPA Controller** — queries metrics, calculates desired replicas, updates workload

### Example Configuration

#### Using kubectl

kubectl autoscale deployment my-deployment --cpu-percent=50 --min=2 --max=10

- `my-deployment` — target Deployment
- `--cpu-percent=50` — target CPU utilization
- `--min=2` / `--max=10` — replica bounds

#### Using YAML

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
```

name: my-hpa

```yaml
spec:
```

scaleTargetRef:

```yaml
apiVersion: apps/v1
kind: Deployment
```

name: my-deployment

minReplicas: 2

maxReplicas: 10

metrics:

- type: Resource

resource:

name: cpu

target:

type: Utilization

averageUtilization: 50

- **scaleTargetRef** — workload to scale
- **minReplicas / maxReplicas** — bounds
- **metrics** — CPU at 50% average utilization

### Benefits

- **Automatic** — responds to real-time load
- **Cost efficient** — scale down during low demand
- **Custom metrics** — request rates, queue depth, etc.

## What is Vertical Pod Autoscaling?

**VPA** adjusts **CPU/memory requests and limits** per Pod (vs HPA which scales replica count) based on historical usage.

### How It Works

1. **Monitor** — tracks Pod CPU/memory consumption over time
2. **Recommend** — suggests optimal requests/limits
3. **Apply** — auto-updates (`Auto`) or advisory only (`Off`/`Initial`)
4. **Restart** — Pods may restart to apply new resource settings

### Key Components

| Component | Role |
|-----------|------|
| **VPA Recommender** | Generates resource recommendations from usage history |
| **VPA Updater** | Applies recommendations; triggers restarts |
| **VPA Controller** | Orchestrates monitoring and updates |

### Example Configuration

```yaml
apiVersion: autoscaling.k8s.io/v1beta2
kind: VerticalPodAutoscaler
metadata:
```

name: my-vpa

```yaml
spec:
```

targetRef:

```yaml
apiVersion: apps/v1
kind: Deployment
```

name: my-deployment

updatePolicy:

updateMode: "Auto" # Options are "Auto", "Off", or "Initial"

- **targetRef** — workload to optimize
- **updateMode** — `Auto` (apply + restart), `Off` (recommend only), `Initial` (on create/restart only)

### Benefits & Limitations

| Benefits | Limitations |
|----------|-------------|
| Right-sized resources; better performance | Pod restarts may cause brief disruption |
| Adapts to changing needs over time | Not ideal for static-allocation or restart-sensitive workloads |

## How does Kubernetes achieve high availability?

HA combines architecture, health checks, redundancy, and deployment patterns.

### 1. Node and Pod Redundancy

- **Multiple nodes** across servers/AZs — surviving node failure
- **Replicas** via Deployments, ReplicaSets, StatefulSets — failed Pods rescheduled elsewhere

### 2. Service Discovery and Load Balancing

- **Services** — stable IP/DNS; abstract Pod endpoints
- **Load balancers** — cloud LBs distribute traffic to healthy Pods

### 3. Health Checks

| Probe | Action on Failure |
|-------|-------------------|
| **Liveness** | Restart Pod |
| **Readiness** | Remove from Service endpoints |

### 4. Automatic Failover

- **Pod rescheduling** — unreachable/failed Pods replaced on healthy nodes
- **Node failover** — workloads moved off failed nodes

### 5. Distributed Control Plane

- **HA control plane** — multiple API server, scheduler, controller manager instances across AZs
- **etcd clustering** — consensus-based HA for cluster state

### 6. Data Persistence and Backup

- **Persistent Volumes** — storage survives Pod lifecycle
- **Backups** — etcd and app data for disaster recovery

### 7. Deployment Strategies

- **Rolling updates** — gradual, low-downtime deploys
- **Blue-green** — instant traffic switch with rollback path

### 8. Multi-Cluster / Federation

- **Multi-cluster** — regional DR and outage mitigation
- **Federation** — unified management across clusters

| Layer | HA Mechanism |
|-------|--------------|
| Workloads | Replicas, health probes, auto-reschedule |
| Networking | Services, LBs, readiness gates |
| Control plane | Multi-instance + etcd HA |
| Data | PVs, backups |
| Deployments | Rolling / blue-green strategies |
| Geography | Multi-cluster, federation |
