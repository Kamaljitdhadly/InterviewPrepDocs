# Kubernetes Basics

## Questions Covered

1. What is Kubernetes?
2. How does Kubernetes handle container orchestration?
3. What are the main components of the Kubernetes architecture?
4. What is the role of the Kubernetes Master Node?
5. What is a Node in Kubernetes?
6. What is a Pod in Kubernetes?
7. What are namespaces in Kubernetes?
8. How does Kubernetes differ from Docker Swarm?
9. What is the Kubernetes API, and how does it work?
10. How can you interact with the Kubernetes API using kubectl and client libraries?
11. What is the role of API groups in Kubernetes?
12. What is the difference between the Kubernetes API and CRDs?

## What is Kubernetes?

**Kubernetes** (K8s) is an open-source **container orchestration** platform (originally from Google) that automates deployment, scaling, and management of containerized apps across a cluster of machines.

| Concept | Role |
|---------|------|
| **Containers** | Lightweight, portable units (code, runtime, libs, deps) |
| **Pods** | Smallest deployable unit; one or more containers sharing storage, network, config |
| **Nodes** | Worker machines running container runtime, **kubelet**, **kube-proxy** |
| **Clusters** | Nodes managed by the **control plane** |
| **Deployments** | Manage pod replicas, rolling updates, rollbacks |
| **Services** | Stable access to pods; load balancing; external exposure |
| **Namespaces** | Logical resource isolation for teams/apps |
| **ConfigMaps / Secrets** | Non-sensitive config vs sensitive credentials |
| **Volumes** | Persistent storage beyond pod lifetime |
| **Ingress** | External HTTP/HTTPS access to services |

Widely used in cloud and on-premises for **high availability**, **scalability**, and **disaster recovery**.

## How does Kubernetes handle container orchestration?

<img src="_work/md/Kubernetes/media/media/image1.png" style="width:7.59306in;height:4.40694in" /><img src="_work/md/Kubernetes/media/media/image2.png" style="width:7.11597in;height:4.24444in" /><img src="_work/md/Kubernetes/media/media/image3.png" style="width:7.06944in;height:5.68611in" /><img src="_work/md/Kubernetes/media/media/image4.png" style="width:7.06944in;height:4.74444in" />

Kubernetes orchestrates containers via control plane + worker nodes working toward a **desired state**:

**Control Plane**

| Component | Function |
|-----------|----------|
| **API Server** | Exposes Kubernetes API; entry point for all interactions |
| **Controller Manager** | Reconciles cluster state (scale, heal, replace pods) |
| **Scheduler** | Assigns pods to nodes by resources/constraints |
| **etcd** | Distributed KV store — cluster state source of truth |

**Nodes**

| Component | Function |
|-----------|----------|
| **Kubelet** | Ensures containers run per spec; talks to API server |
| **Container Runtime** | Runs containers (Docker, containerd) |
| **Kube-Proxy** | Service networking and load balancing on the node |

**Workload abstractions:** **Pods** (atomic unit) → **Deployments** (replicas, rolling updates) → **Services** (stable networking) → **HPA** (auto-scale on CPU/custom metrics) → **Jobs/CronJobs** (batch/scheduled tasks). **Namespaces**, **ConfigMaps**, and **Secrets** organize and configure workloads.

Together these deliver automated deploy, scale, heal, and config management with fault tolerance.

## What are the main components of the Kubernetes architecture?

### Control Plane Components

| Component | Role |
|-----------|------|
| **kube-apiserver** | Front end; validates API requests; updates etcd |
| **kube-controller-manager** | Runs controllers (ReplicaSet, Job, Namespace, etc.) |
| **kube-scheduler** | Binds pods to nodes (CPU, memory, affinity) |
| **etcd** | Persistent cluster state and configuration |
| **cloud-controller-manager** | Cloud-specific resources (LBs, volumes) |

### Node Components

| Component | Role |
|-----------|------|
| **Kubelet** | Pod lifecycle agent on each node |
| **Container Runtime** | Creates/runs containers |
| **Kube-Proxy** | Routes traffic to pod backends for Services |

### Cluster-Level Resources

| Resource | Role |
|----------|------|
| **Pods** | One+ containers sharing network/storage |
| **Services** | Stable IP/DNS; load-balance across pods |
| **Volumes** | Persistent/shared storage |
| **Namespaces** | Multi-tenant resource isolation |
| **ConfigMaps / Secrets** | Config data vs sensitive credentials |
| **Deployments** | Declarative rollouts and scaling |
| **Jobs / CronJobs** | One-off and scheduled batch work |

## What is the role of the Kubernetes Master Node?

The **Master Node** (control plane) manages cluster state, scheduling, and health — it does **not** run application workloads.

| Responsibility | Details |
|----------------|---------|
| **Cluster management** | API Server (gateway), Controller Manager (reconcile), Scheduler (placement), etcd (state) |
| **State reconciliation** | Compare desired vs actual state; drive corrections |
| **Scheduling** | Distribute pods per resource/policy constraints |
| **Deploy & scale** | Manage Deployments, ReplicaSets; rolling updates/rollbacks |
| **Health monitoring** | Detect failures; reschedule/replace components |
| **User interaction** | All CRUD via API Server |

**Master components:** `kube-apiserver`, `kube-controller-manager`, `kube-scheduler`, `etcd`, optional `cloud-controller-manager`.

## What is a Node in Kubernetes?

A **Node** is a worker machine (physical or VM) where containers run, managed by the control plane.

| Component | Role |
|-----------|------|
| **Kubelet** | Ensures pods match spec; reports node/pod status |
| **Container Runtime** | Docker, containerd, etc. |
| **Kube-Proxy** | Implements Service networking on the node |

Nodes form the **data plane** — they execute workloads scheduled by the control plane.

## What is a Pod in Kubernetes?

A **Pod** is the smallest deployable unit — one or more containers sharing **network namespace**, **storage volumes**, and **configuration**.

- Containers in a pod share an **IP** and **port space** (communicate via `localhost`)
- **Ephemeral** by default; **Deployments**, **ReplicaSets**, **StatefulSets** manage lifecycle
- Related containers (sidecars, helpers) run as a single schedulable unit

## How does Kubernetes differ from Docker Swarm?

| Aspect | Kubernetes | Docker Swarm |
|--------|------------|--------------|
| **Complexity** | Feature-rich; steeper learning curve | Simpler; built into Docker |
| **Architecture** | API Server, Controller Manager, Scheduler, etcd | Manager + Worker nodes; Docker-native |
| **Deployment** | YAML manifests; multi-component setup | Docker Compose; quick cluster init |
| **Scaling** | Manual + HPA on metrics | Manual; limited built-in autoscaling |
| **Load balancing** | Services, Ingress, advanced traffic mgmt | Built-in service LB; less flexible |
| **Networking** | CNI plugins, Network Policies, service mesh | Overlay networks; simpler model |
| **Storage** | PV/PVC, dynamic provisioning, many backends | Docker volumes; fewer native options |
| **Ecosystem** | Large community; cloud-native standard | Smaller; Docker-centric |

**Choose K8s** for large, complex, customizable environments. **Choose Swarm** for simpler setups with existing Docker workflows.

## What is the Kubernetes API, and how does it work?

The **Kubernetes API** is the control-plane interface for managing cluster resources — used by users, `kubectl`, controllers, and automation.

| Aspect | Details |
|--------|---------|
| **API Server** | Single gateway; validates requests; persists to etcd |
| **Resources** | Pods, Services, Deployments, etc. at paths like `/api/v1/pods`, `/apis/apps/v1/deployments` |
| **CRUD** | POST (create), GET (read), PUT/PATCH (update), DELETE |
| **AuthN / AuthZ** | Certificates, tokens, OAuth → **RBAC** for permissions |
| **Admission control** | Plugins intercept/modify/reject requests (quotas, policies) |
| **Versioning** | Groups + versions (`/api/v1`, `/apis/apps/v1`) for backward compatibility |
| **CRDs** | Extend API with custom resource types |
| **Aggregation** | Register external APIs into the API server |

**Request flow:** Client (HTTPS) → API Server validates → etcd read/write → controllers reconcile → **watch** streams notify clients of changes.

## How can you interact with the Kubernetes API using kubectl and client libraries?

### Using kubectl

`kubectl` is the CLI for cluster administration and debugging.

**Basic commands:**

```yaml
kubectl get pods
kubectl get services
```

```yaml
kubectl describe pod <pod-name>
```

```yaml
kubectl create -f <file>.yaml
```

```yaml
kubectl apply -f <file>.yaml
```

```yaml
kubectl delete pod <pod-name>
```

**Output & filtering:**

```yaml
kubectl get pods -o yaml
kubectl get pods -o json
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase
```

```yaml
kubectl get pods -l app=my-app
```

**Logs & exec:**

```yaml
kubectl logs <pod-name>
```

```yaml
kubectl exec -it <pod-name> -- /bin/bash
```

**Direct API access:**

kubectl proxy
curl http://localhost:8001/api/v1/namespaces/default/pods

### Using Client Libraries

Programmatic access for automation and custom apps.

**Go (client-go):**

```yaml
package main
import (
"context"
"fmt"
"k8s.io/client-go/kubernetes"
"k8s.io/client-go/tools/clientcmd"
)
func main() {
config, err := clientcmd.BuildConfigFromFlags("", "/path/to/kubeconfig")
if err != nil {
panic(err)
}
clientset, err := kubernetes.NewForConfig(config)
if err != nil {
panic(err)
}
pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
if err != nil {
panic(err)
}
for _, pod := range pods.Items {
fmt.Println(pod.Name)
}
}
```

**Python (kubernetes-python):**

```yaml
from kubernetes import client, config
def main():
config.load_kube_config() # Load kubeconfig from default location
v1 = client.CoreV1Api()
pods = v1.list_namespaced_pod(namespace='default')
for pod in pods.items:
print(pod.metadata.name)
if __name__ == '__main__':
main()
```

**JavaScript (@kubernetes/client-node):**

```yaml
const k8s = require('@kubernetes/client-node');
async function main() {
const k8sApi = k8s.KubeConfig.fromFile('/path/to/kubeconfig');
const k8sClient = k8s.KubeConfig.loadFromFile('/path/to/kubeconfig');
const coreApi = k8sClient.makeApiClient(k8s.CoreV1Api);
try {
const res = await coreApi.listNamespacedPod('default');
res.body.items.forEach(pod => console.log(pod.metadata.name));
} catch (error) {
console.error(error);
}
}
main();
```

**Java (kubernetes-client-java):**

```yaml
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.models.V1PodList;
import io.kubernetes.client.openapi.api.CoreV1Api;
import io.kubernetes.client.openapi.auth.Configuration;
public class Main {
public static void main(String[] args) {
ApiClient client = Configuration.getDefaultApiClient();
CoreV1Api api = new CoreV1Api(client);
try {
V1PodList list = api.listNamespacedPod("default", null, null, null, null, null, null, null, null, null);
list.getItems().forEach(pod -> System.out.println(pod.getMetadata().getName()));
} catch (Exception e) {
e.printStackTrace();
}
}
}
```

| Tool | Best for |
|------|----------|
| **kubectl** | Manual ops, debugging, quick inspection |
| **Client libraries** | Automation, controllers, CI/CD integration |

## What is the role of API groups in Kubernetes?

**API groups** organize, version, and extend Kubernetes resources.

| Role | Details |
|------|---------|
| **Organization** | Related resources grouped (e.g., `apps` → Deployments; core → Pods) |
| **Versioning** | Multiple versions coexist (`v1`, `v2beta1`) for safe evolution |
| **Extensibility** | CRDs register under custom groups; aggregation adds external APIs |
| **Discovery** | `/apis` and `/apis/{group}` list available resources |

**Common groups:**

| Group | Path | Resources |
|-------|------|-----------|
| **Core** | `/api/v1` | Pods, Services, ConfigMaps, Secrets |
| **apps** | `/apis/apps/v1` | Deployments, ReplicaSets, StatefulSets |
| **batch** | `/apis/batch/v1` | Jobs, CronJobs |
| **networking.k8s.io** | `/apis/networking.k8s.io/v1` | NetworkPolicies, Ingress |
| **Custom** | `/apis/mygroup.example.com/v1` | User-defined CRDs |

API server routes requests by group/version; client tools (`kubectl`) use groups to address resource types.

## What is the difference between the Kubernetes API and CRDs?

| Aspect | Kubernetes API | CRDs |
|--------|----------------|------|
| **Purpose** | Built-in interface for standard resources | Extend API with custom resource types |
| **Resources** | Pods, Services, Deployments, Nodes, etc. | User-defined (e.g., `Database`) |
| **Schema** | Enforced by Kubernetes | Defined via OpenAPI schema in CRD |
| **Controllers** | Built-in controllers | Custom controllers/operators |
| **Path** | `/api/v1`, `/apis/apps/v1`, etc. | `/apis/{your-group}/{version}/{plural}` |

**Built-in API example:**

```yaml
kubectl get deployments
kubectl apply -f deployment.yaml
```

**CRD definition:**

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
name: databases.mygroup.example.com
spec:
group: mygroup.example.com
names:
kind: Database
listKind: DatabaseList
plural: databases
singular: database
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
databaseName:
type: string
```

**Custom resource instance:**

```yaml
apiVersion: mygroup.example.com/v1
kind: Database
metadata:
name: my-database
spec:
databaseName: my-db
```

**Summary:** The core API manages standard cluster objects; **CRDs** let you define and operate domain-specific resources via the same API machinery (`kubectl`, watches, RBAC).

## What are namespaces in Kubernetes?

A **namespace** logically partitions cluster resources — enabling multi-tenancy, environment separation, and name scoping without cross-namespace conflicts.

| Feature | Details |
|---------|---------|
| **Isolation** | Resources in one namespace are isolated unless explicitly allowed |
| **Name scoping** | Unique names within a namespace; same name OK across namespaces |
| **RBAC** | Per-namespace roles and bindings |
| **Quotas** | CPU, memory, storage limits per namespace |

**Default namespaces:** `default`, `kube-system` (system components), `kube-public` (public data), `kube-node-lease` (node heartbeats).

**Create a namespace:**

Using kubectl

Using YAML

```yaml
kubectl create namespace dev
apiVersion: v1
kind: Namespace
metadata:
name: dev
Then, apply the file:
bash
Copy code
kubectl apply -f namespace.yaml
```

**Deploy to a namespace:**

Using kubectl

In a YAML file

```yaml
kubectl create deployment nginx --image=nginx --namespace=dev
apiVersion: apps/v1
kind: Deployment
metadata:
name: nginx-deployment
namespace: dev
spec:
replicas: 3
selector:
matchLabels:
app: nginx
template:
metadata:
labels:
app: nginx
spec:
containers:
- name: nginx
image: nginx
```

**Switch default namespace:**

```yaml
kubectl get pods --namespace=dev
To set a namespace as the default for your current kubectl session, use:
kubectl config set-context --current --namespace=dev
```

**Use cases:** multi-team clusters, dev/staging/prod separation, resource quota enforcement.

**Limitations:** namespaces are single-cluster only; some resources (Nodes, StorageClass, PV) are cluster-scoped, not namespaced.

---

## Related Topics

- **Docker Basics** (`Docker/`)
- **Interview Comparisons** (`Important Concepts/`)
