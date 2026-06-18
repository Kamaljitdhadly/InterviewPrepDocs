# Kubernetes etcd and Operators

## Questions Covered

1. What is etcd, and what role does it play in Kubernetes?
2. How does Kubernetes ensure consistency with etcd?
3. How can you backup and restore the etcd database?
4. What are Kubernetes Operators, and why are they important?
5. How do Operators differ from controllers?
6. How do you create a custom Kubernetes Operator?

## What is etcd, and what role does it play in Kubernetes?

**etcd** is a distributed key-value store — the primary data backend for Kubernetes. It maintains cluster state and configuration.

## What is etcd?

Open-source, highly available, consistent key-value store for distributed systems. Uses the **Raft consensus algorithm** for consistency across nodes, even during failures.

### Role of etcd in Kubernetes

| Role | Detail |
|------|--------|
| **Cluster State** | Single source of truth for Pods, Services, Deployments, ConfigMaps, Secrets, etc. |
| **Configuration** | Cluster config, network policies, resource quotas |
| **Coordination** | API server reads/writes state; controllers/schedulers act on etcd data |
| **HA & Reliability** | Raft replication; tolerates node failures |
| **Consistency** | Strong consistency — all components see the same state |

### Key Features

| Feature | Detail |
|---------|--------|
| **Strong Consistency** | All nodes see identical data |
| **Distributed HA** | Multi-node deployment with consensus replication |
| **Watch** | Clients subscribe to changes; K8s components react in real time |
| **APIs** | RESTful API for read/write |
| **Snapshot/Restore** | Backup and recovery support |

### Security and Management

- **Access Control** — authn/authz; secure endpoints; authorized access only.
- **Encryption** — at rest and in transit for sensitive data.
- **Backup/Recovery** — periodic snapshots; test restore procedures.

## How does Kubernetes ensure consistency with etcd?

### 1. Raft Consensus Algorithm

- **Raft** — majority (quorum) must agree before changes commit.
- **Leader Election** — one leader processes requests and replicates to followers.
- **Log Replication** — leader writes to log → replicates → committed after majority ack.

### 2. Strong Consistency

- **Linearizability** — acknowledged writes visible to all subsequent reads.
- **Atomic Operations** — each read/write completes fully or not at all.

### 3. Watch Mechanism

- **Real-Time Updates** — K8s components notified on resource create/update/delete.
- **Event-Driven** — components stay synchronized with etcd state.

### 4. Kubernetes API Server

- **Single Source of Truth** — all state changes go through API server → validated → committed to etcd.
- **Transactions** — multiple operations applied atomically.

### 5. High Availability and Fault Tolerance

- **Quorum-Based Consensus** — tolerates minority node failures.
- **Replication** — data across multiple nodes prevents single-node loss.

### 6. Backup and Recovery

- **Snapshotting** — restore to known state on failure/corruption.
- **Consistency Checks** — regular backups verify data reliability.

## How can you backup and restore the etcd database?

### Backup etcd

**Using etcdctl**:

**Prerequisites**: etcdctl installed; access to etcd endpoint + certs/tokens.

**Steps**:

1.  **Set Environment Variables** (if needed):

```yaml
export ETCDCTL_API=3
export ETCDCTL_CACERT=/etc/etcd/ca.crt
export ETCDCTL_CERT=/etc/etcd/etcd.crt
export ETCDCTL_KEY=/etc/etcd/etcd.key
export ETCDCTL_ENDPOINTS=https://127.0.0.1:2379
```

2.  **Take a Snapshot**:

etcdctl snapshot save /path/to/backup/etcd-snapshot.db

3.  **Verify the Snapshot** (Optional):

etcdctl snapshot status /path/to/backup/etcd-snapshot.db

4.  **Secure the Backup** — encrypt or store in secure location.

**Automating Backups** — cron jobs or backup solutions for periodic snapshots.

### Restore etcd

1.  **Stop etcd**:

systemctl stop etcd

2.  **Prepare the Backup** — ensure backup file is accessible.

3.  **Restore the Snapshot**:

1.  **Set Environment Variables** (if needed):

```yaml
export ETCDCTL_API=3
export ETCDCTL_CACERT=/etc/etcd/ca.crt
export ETCDCTL_CERT=/etc/etcd/etcd.crt
export ETCDCTL_KEY=/etc/etcd/etcd.key
export ETCDCTL_ENDPOINTS=https://127.0.0.1:2379
```

2.  **Restore the Snapshot**:

etcdctl snapshot restore /path/to/backup/etcd-snapshot.db --data-dir=/var/lib/etcd

3.  **Update the Cluster Configuration** (if needed) — for new etcd cluster, point to restored data dir.

4.  **Start etcd**:

systemctl start etcd

5.  **Verify the Restoration** — check logs; confirm data consistency.

## What are Kubernetes Operators, and why are they important?

**Kubernetes Operators** automate management of complex, stateful applications by encoding operational knowledge beyond built-in K8s capabilities.

## What is a Kubernetes Operator?

Packages, deploys, and manages K8s apps using **CRDs** + **Controllers** to extend the API and manage application lifecycles.

**Key Components:**

| Component | Role |
|-----------|------|
| **CRDs** | Define custom resource types extending the K8s API |
| **Controller** | Watches custom resources; enforces desired state |
| **Custom Resources (CRs)** | Instances of CRDs with app-specific config |

## Why are Kubernetes Operators Important?

| Reason | Detail |
|--------|--------|
| **Automate complex tasks** | Deploy, scale, backup, failover, upgrade |
| **Extend K8s** | Manage apps with unique/complex requirements |
| **Declarative** | Define desired state in CRs; Operator reconciles |
| **Self-healing** | Detect failures; replace or restore (e.g., DB failover) |
| **Lifecycle management** | Install, update, configure beyond container basics |
| **Consistency** | Encode ops knowledge; reduce human error |
| **Custom logic** | Application-specific management strategies |

### Examples

| Type | Examples |
|------|----------|
| **Database** | PostgreSQL Operator, MySQL Operator |
| **Application** | Elasticsearch, Redis Operators |
| **Infrastructure** | Ingress controllers, monitoring tools |

### How to Develop an Operator

1. Define CRDs for custom resources.
2. Implement Controller watching CRs and reconciling state.
3. Deploy Operator to cluster.
4. Test failure recovery, scaling, and updates.

## How do Operators differ from controllers?

| Aspect | Controller | Operator |
|--------|------------|----------|
| **Scope** | Built-in K8s component | Specialized controller for CRDs |
| **Resources** | Pods, ReplicaSets, Deployments | Custom resources via CRDs |
| **Logic** | Predefined K8s rules | Application-specific custom logic |
| **Tasks** | Scale, rollout, replica count | Backups, failover, app-specific config |
| **Integration** | Built into API server / kube-controller-manager | User-defined extension |
| **Examples** | Deployment Controller, StatefulSet Controller | PostgreSQL Operator, Elasticsearch Operator |

**Key distinction:** Controllers manage built-in resources with standard logic. Operators extend controllers with CRDs and domain-specific operational knowledge for complex stateful apps.

## How do you create a custom Kubernetes Operator?

### 1. Define Custom Resources

1.  **Create a CRD** — schema and validation for custom resources.

    - Example CRD for a MyApp resource:

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
name: myapps.example.com
spec:
group: example.com
names:
kind: MyApp
listKind: MyAppList
plural: myapps
singular: myapp
scope: Namespaced
versions:
- name: v1
served: true
storage: true
schema:
openAPIV3Schema:
type: object
properties:
spec:
type: object
properties:
replicas:
type: integer
```

2.  **Apply the CRD**:

```yaml
kubectl apply -f myapp-crd.yaml
```

### 2. Implement the Operator Logic

Frameworks: **Kubebuilder**, **Operator SDK**.

**Using Operator SDK**:

1.  **Install Operator SDK**
2.  **Create project**: `operator-sdk init --domain example.com --repo github.com/example/my-operator`
3.  **Create API + Controller**: `operator-sdk create api --group example --version v1 --kind MyApp --resource --controller`
4.  **Implement logic** in `controllers/myapp_controller.go` — handle events, create/update resources, reconcile state.
5.  **Build and test** — build Docker image, push to registry, test locally.

### 3. Deploy the Operator

1.  **Deployment YAML** with Roles/RoleBindings:

```yaml
Example Deployment YAML:
apiVersion: apps/v1
kind: Deployment
metadata:
name: my-operator
spec:
replicas: 1
selector:
matchLabels:
app: my-operator
template:
metadata:
labels:
app: my-operator
spec:
containers:
- name: my-operator
image: my-registry/my-operator:latest
command:
- /manager
```

2.  **Deploy**:

```yaml
kubectl apply -f myapp-crd.yaml
kubectl apply -f my-operator-deployment.yaml
```

### 4. Test and Validate

1.  **Create Custom Resources**:

```yaml
apiVersion: example.com/v1
kind: MyApp
metadata:
name: myapp-sample
spec:
replicas: 3
```

2.  **Verify** — monitor Operator logs/events; `kubectl get myapps`.
3.  **Debug and refine** — use logs and metrics to tune behavior.
