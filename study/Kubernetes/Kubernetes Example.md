# Kubernetes Example

Commonly used **kubectl** commands for cluster management:

### Cluster Management

| Command | Description |
|---------|-------------|
| `kubectl cluster-info` | Displays cluster info |
| `kubectl config view` | Shows kubeconfig file |

### Pods

| Command | Description |
|---------|-------------|
| `kubectl get pods` | Lists all pods |
| `kubectl describe pod <pod-name>` | Detailed pod info |
| `kubectl logs <pod-name>` | Fetches pod logs |
| `kubectl exec -it <pod-name> -- /bin/bash` | Interactive shell in pod |

### Deployments

| Command | Description |
|---------|-------------|
| `kubectl get deployments` | Lists deployments |
| `kubectl describe deployment <name>` | Deployment details |
| `kubectl rollout status deployment/<name>` | Rollout status |
| `kubectl scale deployment <name> --replicas=<n>` | Scale replicas |

### Services

| Command | Description |
|---------|-------------|
| `kubectl get services` | Lists services |
| `kubectl describe service <name>` | Service details |

### Namespaces

| Command | Description |
|---------|-------------|
| `kubectl get namespaces` | Lists namespaces |
| `kubectl describe namespace <name>` | Namespace details |

### ConfigMaps and Secrets

| Command | Description |
|---------|-------------|
| `kubectl get configmaps` | Lists config maps |
| `kubectl describe configmap <name>` | ConfigMap details |
| `kubectl get secrets` | Lists secrets |
| `kubectl describe secret <name>` | Secret details |

### Nodes

| Command | Description |
|---------|-------------|
| `kubectl get nodes` | Lists nodes |
| `kubectl describe node <name>` | Node details |

### StatefulSets, ReplicaSets, and Jobs

| Command | Description |
|---------|-------------|
| `kubectl get statefulsets` | Lists stateful sets |
| `kubectl describe statefulset <name>` | StatefulSet details |
| `kubectl get replicasets` | Lists replica sets |
| `kubectl describe replicaset <name>` | ReplicaSet details |
| `kubectl get jobs` | Lists jobs |
| `kubectl describe job <name>` | Job details |

### Other Commands

| Command | Description |
|---------|-------------|
| `kubectl apply -f <file>` | Apply config from file |
| `kubectl create -f <file>` | Create resources from file |
| `kubectl delete -f <file>` | Delete resources from file |
| `kubectl edit <resource> <name>` | Edit resource in editor |

Use `kubectl --help` or official docs for full command reference.

### .NET and Angular Deployment Manifests

### 1. Deployment and Service for .NET Application

### dotnet-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
```

name: dotnet-app

labels:

app: dotnet

```yaml
spec:
replicas: 2
selector:
```

matchLabels:

app: dotnet

template:

```yaml
metadata:
```

labels:

app: dotnet

```yaml
spec:
containers:
- name: dotnet-app
image: your-dockerhub-username/dotnet-app:latest
```

ports:

- containerPort: 80

```yaml
---
apiVersion: v1
kind: Service
metadata:
```

name: dotnet-service

```yaml
spec:
selector:
```

app: dotnet

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 80

type: ClusterIP

### 2. Deployment and Service for Angular Application

### angular-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
```

name: angular-app

labels:

app: angular

```yaml
spec:
replicas: 2
selector:
```

matchLabels:

app: angular

template:

```yaml
metadata:
```

labels:

app: angular

```yaml
spec:
containers:
- name: angular-app
image: your-dockerhub-username/angular-app:latest
```

ports:

- containerPort: 80

```yaml
---
apiVersion: v1
kind: Service
metadata:
```

name: angular-service

```yaml
spec:
selector:
```

app: angular

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 80

type: LoadBalancer

### 3. Optional: Ingress Configuration

### ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
```

name: app-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

```yaml
spec:
```

rules:

- host: angular.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: angular-service

port:

number: 80

- host: dotnet.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: dotnet-service

port:

number: 80

### Explanation of Each File

1.  **dotnet-deployment.yaml / angular-deployment.yaml**

    - **Deployment** — replica pods with specified Docker image.
      - `replicas`: pod count; `selector`: label matching; `containers`: image + port.
    - **Service** — exposes deployment internally or externally.
      - `ClusterIP`: internal only; `LoadBalancer`: external via cloud LB.

2.  **ingress.yaml** (Optional)

    - Routes HTTP/HTTPS by host/path; `annotations` configure Ingress controller behavior (e.g., URL rewrite).

### Deploying to Kubernetes

1.  **Apply the manifests**:

```yaml
kubectl apply -f dotnet-deployment.yaml
kubectl apply -f angular-deployment.yaml
kubectl apply -f ingress.yaml
```

2.  **Verify the deployments**:

```yaml
kubectl get deployments
kubectl get services
kubectl get pods
kubectl get ingress
```

3.  **Update Docker Images** — match image names in manifests to actual images.

### dotnet-deployment.yaml Breakdown

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
```

name: dotnet-app

labels:

app: dotnet

```yaml
spec:
replicas: 2
selector:
```

matchLabels:

app: dotnet

template:

```yaml
metadata:
```

labels:

app: dotnet

```yaml
spec:
containers:
- name: dotnet-app
image: your-dockerhub-username/dotnet-app:latest
```

ports:

- containerPort: 80

```yaml
---
apiVersion: v1
kind: Service
metadata:
```

name: dotnet-service

```yaml
spec:
selector:
```

app: dotnet

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 80

type: ClusterIP

### Deployment

| Field | Purpose |
|-------|---------|
| `apiVersion: apps/v1` | Stable Deployment API version |
| `kind: Deployment` | Manages replica pods |
| `metadata.name` | Unique Deployment identifier |
| `metadata.labels` | Organize/select resources (`app: dotnet`) |
| `spec.replicas: 2` | Desired pod count |
| `spec.selector.matchLabels` | Pods managed by this Deployment |
| `spec.template` | Pod spec; labels must match selector |
| `containers.name` | Container name in pod |
| `containers.image` | Docker image (replace with actual) |
| `containerPort: 80` | App listen port |

### Service

| Field | Purpose |
|-------|---------|
| `apiVersion: v1` | Stable Service API |
| `kind: Service` | Exposes pods as network service |
| `selector.app` | Routes to matching pods |
| `port: 80` | Service port in cluster |
| `targetPort: 80` | Container port (matches Deployment) |
| `type: ClusterIP` | Internal cluster access only |

### ingress.yaml Breakdown

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
```

name: app-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

```yaml
spec:
```

rules:

- host: angular.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: angular-service

port:

number: 80

- host: dotnet.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: dotnet-service

port:

number: 80

| Field | Purpose |
|-------|---------|
| `apiVersion: networking.k8s.io/v1` | Stable Ingress API |
| `kind: Ingress` | External HTTP/HTTPS access |
| `metadata.name` | Ingress identifier |
| `annotations` | Controller config (Nginx URL rewrite to `/`) |
| `rules.host` | Domain-based routing |
| `path` / `pathType: Prefix` | Path matching |
| `backend.service` | Target Service name + port |

Routes `angular.example.com` → `angular-service`, `dotnet.example.com` → `dotnet-service`.

### Common Microservice YAML Files

| Resource | Purpose |
|----------|---------|
| **Deployment** | Manages pod replicas and rolling updates |
| **Service** | Stable IP/DNS for pod access |
| **Ingress** | External HTTP/HTTPS routing by host/path |
| **ConfigMap** | Non-sensitive config as key-value pairs |
| **Secret** | Sensitive data (passwords, tokens) — base64 encoded |
| **PV / PVC** | Persistent storage provisioning and claims |
| **Namespace** | Logical cluster partition for isolation |
| **HPA** | Auto-scale pods by CPU/metrics |
| **Job** | Batch tasks run to completion |

**Example** — Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
```

name: my-service

```yaml
spec:
replicas: 3
selector:
```

matchLabels:

app: my-service

template:

```yaml
metadata:
```

labels:

app: my-service

```yaml
spec:
containers:
- name: my-service-container
image: my-registry/my-service:latest
```

ports:

- containerPort: 80

**Example** — Service:

```yaml
apiVersion: v1
kind: Service
metadata:
```

name: my-service

```yaml
spec:
selector:
```

app: my-service

ports:

- protocol: TCP

```yaml
port: 80
```

targetPort: 80

type: ClusterIP

**Example** — Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
```

name: my-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

```yaml
spec:
```

rules:

- host: service1.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: service1

port:

number: 80

- host: service2.example.com

http:

paths:

- path: /

pathType: Prefix

backend:

service:

name: service2

port:

number: 80

**Example** — ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
```

name: my-config

data:

app.config: |

key1=value1

key2=value2

**Example** — Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
```

name: my-secret

type: Opaque

data:

password: dGVzdHBhc3M= # Base64 encoded value of 'testpass'

**Example** — PersistentVolume:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
```

name: my-pv

```yaml
spec:
```

capacity:

storage: 1Gi

accessModes:

- ReadWriteOnce

hostPath:

path: /mnt/data

**Example** — PersistentVolumeClaim:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
```

name: my-pvc

```yaml
spec:
```

accessModes:

- ReadWriteOnce

resources:

requests:

storage: 1Gi

**Example** — Namespace:

```yaml
apiVersion: v1
kind: Namespace
metadata:
```

name: my-namespace

**Example** — HorizontalPodAutoscaler:

```yaml
apiVersion: autoscaling/v1
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

name: my-service

minReplicas: 1

maxReplicas: 10

targetCPUUtilizationPercentage: 80

**Example** — Job:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
```

name: my-job

```yaml
spec:
template:
spec:
containers:
- name: my-job-container
image: my-registry/my-job:latest
```

command: ["python", "script.py"]

restartPolicy: OnFailure

Also consider StatefulSets, DaemonSets, and CRDs for complex architectures.

### Kubernetes Service Types

| Type | Description | Use Case |
|------|-------------|----------|
| **ClusterIP** (default) | Internal cluster IP only | Internal microservice communication |
| **NodePort** | Exposes on each Node's IP at static port | Dev/test external access |
| **LoadBalancer** | Cloud LB provisions external access | Production external exposure (AWS, GCP, Azure) |
| **ExternalName** | CNAME to external DNS name | Integrate non-K8s services |
| **Headless** (`clusterIP: None`) | Direct pod DNS, no stable IP | StatefulSets, direct pod access |

**Related:** **Ingress** — HTTP/HTTPS routing, SSL termination, virtual hosting. **Service Mesh** — traffic management, discovery, security between microservices.
