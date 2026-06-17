# Kubernetes Controllers and Security

## Questions Covered

1. What is a Kubernetes controller?
2. Explain the role of the ReplicaSet controller in maintaining the desired state.
3. How do controllers interact with the Kubernetes API?
4. How do you secure a Kubernetes cluster?
5. What is RBAC (Role-Based Access Control) in Kubernetes?
6. What are Network Policies in Kubernetes?
7. How does Kubernetes manage Secrets?
8. What is the purpose of ServiceAccounts in Kubernetes?

## What is a Kubernetes controller?

A **controller** is a **control loop** that watches cluster state and reconciles it toward the **desired state** specified in resource manifests.

| Responsibility | Details |
|----------------|---------|
| **Maintain desired state** | e.g., Deployment with 3 replicas → exactly 3 pods running |
| **Lifecycle management** | Create, update, delete resources per spec |
| **Event response** | React to failures, deletions, config changes |

**Controller types:**

| Controller | Manages |
|------------|---------|
| **Deployment** | Replica count, rolling updates, rollbacks |
| **ReplicaSet** | Stable pod replica count via label selectors |
| **StatefulSet** | Stateful apps; stable network IDs; persistent storage |
| **DaemonSet** | One pod per (selected) node — logging, monitoring agents |
| **Job / CronJob** | Batch tasks; scheduled periodic runs |
| **Endpoints** | Maps Services to matching pod IPs |
| **Namespace** | Namespace lifecycle and cleanup |
| **ResourceQuota** | Enforces per-namespace resource limits |

**Reconciliation loop:** Watch API → compare current vs desired → create/update/delete → repeat.

**Example:** Deployment wants 3 replicas; a pod crashes → controller detects shortfall → creates replacement pod.

## Explain the role of the ReplicaSet controller in maintaining the desired state.

The **ReplicaSet controller** ensures the running pod count matches `spec.replicas` in a ReplicaSet.

| Role | Details |
|------|---------|
| **Replica count** | Creates pods when below desired; deletes excess |
| **Pod lifecycle** | Manages create/replace/delete per template |
| **Failure handling** | Replaces crashed or deleted pods |
| **Label selector** | Only manages pods matching `spec.selector` |
| **Rolling updates** | Typically delegated to Deployment (which owns ReplicaSets) |

**Operation:** Watch ReplicaSets/Pods → count matching pods → create or delete to reconcile → continuous loop.

**Example ReplicaSet:**

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
```

name: my-replicaset

```yaml
spec:
replicas: 3
selector:
```

matchLabels:

app: my-app

template:

```yaml
metadata:
```

labels:

app: my-app

```yaml
spec:
containers:
- name: my-container
image: my-image
```

ports:

- containerPort: 80

- **replicas** — desired pod count (3)
- **selector** — labels pods this ReplicaSet owns
- **template** — pod spec for new replicas

ReplicaSets are the replication engine; Deployments add declarative rollouts on top.

## How do controllers interact with the Kubernetes API?

Controllers use the API server as the single source of truth for observation and mutation.

| Interaction | Purpose |
|-------------|---------|
| **Watch** | Subscribe to resource change events (create/update/delete) |
| **GET / LIST** | Read current state of resources |
| **POST** | Create new resources (e.g., replacement pod) |
| **PUT / PATCH** | Update existing resources (scale, config) |
| **DELETE** | Remove excess or obsolete resources |

**Reconciliation loop:** retrieve state → compare to desired → apply changes → handle errors/retries → repeat.

**Deployment controller example:**

1. Watch Deployments and Pods
2. GET/LIST current ReplicaSets and Pods
3. Decide create/delete/update actions
4. PATCH Deployment/ReplicaSet specs
5. POST new Pods; DELETE failed/excess Pods

This API-driven loop keeps actual cluster state aligned with declared configuration.

## How do you secure a Kubernetes cluster?

Multi-layer security across access, network, workloads, and operations:

| Layer | Practices |
|-------|-----------|
| **Access control** | Strong auth (certs, tokens, MFA); **RBAC** with least privilege; TLS on API server; restrict API access by IP |
| **Network** | **Network Policies** for pod-to-pod traffic; secure Ingress; egress controls; service mesh mTLS (Istio) |
| **Pod/container** | **PSA** (Pod Security Admission); scan/sign images; run as **non-root**; **security contexts** (no privileged) |
| **Config/secrets** | Encrypt Secrets at rest; RBAC on Secret access; audit ConfigMaps |
| **Monitoring** | Audit logs; Prometheus/Grafana; centralized logging (ELK, Fluentd) |
| **Patching** | Keep control plane, nodes, and apps updated; vulnerability scanning |
| **Hardening** | Minimize exposed services; encrypt/limit **etcd** access; network segmentation |
| **DR/backup** | Regular etcd and resource backups; tested recovery procedures |

Defense in depth: no single control is sufficient — combine authZ, network segmentation, workload hardening, and observability.

## What is RBAC (Role-Based Access Control) in Kubernetes?

**RBAC** grants permissions to users, groups, or **ServiceAccounts** based on roles — enforcing **least privilege**.

| Object | Scope | Purpose |
|--------|-------|---------|
| **Role** | Namespace | Permissions within one namespace |
| **ClusterRole** | Cluster-wide | Permissions across namespaces or on cluster resources |
| **RoleBinding** | Namespace | Binds Role → subjects in a namespace |
| **ClusterRoleBinding** | Cluster | Binds ClusterRole → subjects cluster-wide |

**Verbs:** `get`, `list`, `watch`, `create`, `update`, `delete`, etc.

**Define a Role:**

```yaml
Example of a Role:
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
name: example-role
namespace: default
rules:
- apiGroups: [""]
resources: ["pods"]
verbs: ["get", "list", "watch"]
```

**Bind to subjects:**

```yaml
Example of a RoleBinding:
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
name: example-rolebinding
namespace: default
subjects:
- kind: User
name: jane
apiGroup: rbac.authorization.k8s.io
roleRef:
kind: Role
name: example-role
apiGroup: rbac.authorization.k8s.io
Example of a ClusterRoleBinding:
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
name: example-clusterrolebinding
subjects:
- kind: ServiceAccount
name: example-service-account
namespace: default
roleRef:
kind: ClusterRole
name: example-clusterrole
apiGroup: rbac.authorization.k8s.io
```

**Flow:** API request → identify subject → resolve bindings → allow or deny action on resource.

## What are Network Policies in Kubernetes?

**Network Policies** control pod ingress/egress traffic — implementing micro-segmentation at L3/L4.

| Concept | Details |
|---------|---------|
| **podSelector** | Target pods by labels |
| **namespaceSelector** | Scope traffic across namespaces |
| **Ingress rules** | Allowed inbound sources/ports |
| **Egress rules** | Allowed outbound destinations/ports |
| **policyTypes** | `Ingress`, `Egress`, or both |

**Allow frontend → backend:**

```yaml
Example of a simple Network Policy allowing ingress traffic from Pods with the label role=frontend to Pods with the label role=backend:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: allow-ingress-from-frontend
namespace: default
spec:
podSelector:
matchLabels:
role: backend
ingress:
- from:
- podSelector:
matchLabels:
role: frontend
```

**Default deny ingress** (restrictive baseline):

```yaml
Example of a default deny Network Policy for ingress:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: default-deny-ingress
namespace: default
spec:
podSelector: {}
policyTypes:
- Ingress
```

**Notes:** Default (no policies) = allow all. Policies are **additive** — design sets that work together. Requires a CNI that supports NetworkPolicy (Calico, Cilium, Weave).

## How does Kubernetes manage Secrets?

**Secrets** store sensitive data (passwords, tokens, keys) for use by pods and controllers.

| Aspect | Details |
|--------|---------|
| **Types** | `Opaque` (default), `docker-registry`, `service-account-token` |
| **Encoding** | Base64 in etcd/API — **not encryption**; enable encryption at rest separately |
| **Injection** | Environment variables or mounted volumes |
| **Access** | RBAC limits who can read/write Secrets |

**Create a Secret:**

```yaml
Example YAML manifest for an Opaque Secret:
apiVersion: v1
kind: Secret
metadata:
name: my-secret
namespace: default
type: Opaque
data:
username: dXNlcg== # base64 encoded 'user'
password: cGFzcw== # base64 encoded 'pass'
Example using kubectl:
kubectl create secret generic my-secret --from-literal=username=user --from-literal=password=pass
```

**Env vars from Secret:**

```yaml
Example of a Pod specification that uses a Secret as environment variables:
apiVersion: v1
kind: Pod
metadata:
name: my-pod
spec:
containers:
- name: my-container
image: my-image
env:
- name: USERNAME
valueFrom:
secretKeyRef:
name: my-secret
key: username
- name: PASSWORD
valueFrom:
secretKeyRef:
name: my-secret
key: password
```

**Volume mount:**

```yaml
Example of a Pod specification that mounts a Secret as a volume:
apiVersion: v1
kind: Pod
metadata:
name: my-pod
spec:
containers:
- name: my-container
image: my-image
volumeMounts:
- name: secret-volume
mountPath: /etc/secret
volumes:
- name: secret-volume
secret:
secretName: my-secret
```

**Best practices:** RBAC least privilege; encryption at rest via `EncryptionConfiguration`; rotate secrets; never hardcode in images; audit access; TLS in transit.

## What is the purpose of ServiceAccounts in Kubernetes?

A **ServiceAccount** gives pods an **identity** for authenticating to the API and accessing cluster resources via RBAC.

| Purpose | Details |
|---------|---------|
| **Pod identity** | Each pod runs as a ServiceAccount (default if unspecified) |
| **API authentication** | JWT token auto-mounted at `/var/run/secrets/kubernetes.io/serviceaccount/token` |
| **Access control** | Permissions via RoleBinding/ClusterRoleBinding |
| **Isolation** | Separate accounts per app reduce blast radius |

**ServiceAccount definition:**

```yaml
Example of a ServiceAccount definition:
apiVersion: v1
kind: ServiceAccount
metadata:
name: my-serviceaccount
namespace: default
```

**RoleBinding to ServiceAccount:**

```yaml
Example of a RoleBinding binding a Role to a ServiceAccount:
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
name: my-rolebinding
namespace: default
subjects:
- kind: ServiceAccount
name: my-serviceaccount
namespace: default
roleRef:
kind: Role
name: my-role
apiGroup: rbac.authorization.k8s.io
```

**ClusterRoleBinding:**

```yaml
Example of a ClusterRoleBinding:
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
name: my-clusterrolebinding
subjects:
- kind: ServiceAccount
name: my-serviceaccount
namespace: default
roleRef:
kind: ClusterRole
name: my-clusterrole
apiGroup: rbac.authorization.k8s.io
```

**Best practices:** least-privilege RBAC per ServiceAccount; separate accounts per workload; monitor audit logs; protect mounted tokens.
