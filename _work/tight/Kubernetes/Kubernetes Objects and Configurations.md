# Kubernetes Objects and Configurations

## Questions Covered

1. What are Deployments in Kubernetes?
2. What is a ReplicaSet in Kubernetes?
3. What is a DaemonSet?
4. What is a StatefulSet?
5. What is a Job in Kubernetes?
6. What are ConfigMaps and Secrets in Kubernetes?
7. What is a PersistentVolume (PV) and PersistentVolumeClaim (PVC)?
8. How do you pass environment variables to a Pod in Kubernetes?

## What are Deployments in Kubernetes?

A **Deployment** manages deploying and scaling Pods declaratively — maintains desired application state.

### Key Features

1. **Declarative Updates** — Define desired state in YAML/JSON; Kubernetes reconciles.
2. **Rolling Updates** — Zero-downtime gradual Pod replacement.
3. **Rollback** — Revert to prior version via deployment history (`kubectl rollout undo`).
4. **Scaling** — Adjust `replicas`; Kubernetes creates/deletes Pods.
5. **Self-Healing** — Replaces failed/terminated Pods automatically.

### How Deployments Work

1. **Configuration** — YAML defines replicas, image, labels, selectors.
2. **Creation** — Generates a **ReplicaSet** to manage Pods.
3. **Pod Management** — Creates/updates/deletes Pods to match desired state.
4. **Rolling Updates/Rollbacks** — Incremental updates; pause/cancel/undo supported.

### Example Deployment YAML

Here is an example YAML file for a Deployment that runs an Nginx web server:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
```

name: nginx-deployment

labels:

app: nginx

```yaml
spec:
replicas: 3
selector:
```

matchLabels:

app: nginx

template:

```yaml
metadata:
```

labels:

app: nginx

```yaml
spec:
containers:
- name: nginx
image: nginx:1.21
```

ports:

- containerPort: 80

### Key Components

- **apiVersion/kind** — `apps/v1` Deployment
- **metadata** — name, labels
- **spec.replicas** — Pod count
- **spec.selector** — label matcher
- **spec.template** — Pod spec (containers, image, ports)

### Managing Deployments

- **Create a Deployment**:

```yaml
kubectl apply -f deployment.yaml
```

- **Check Deployment Status**:

```yaml
kubectl get deployments
kubectl describe deployment <deployment-name>
```

- **Update a Deployment**:

```yaml
kubectl apply -f updated-deployment.yaml
```

- **Roll Back a Deployment**:

```yaml
kubectl rollout undo deployment/<deployment-name>
```

- **Scale a Deployment**:

```yaml
kubectl scale deployment <deployment-name> --replicas=5
```

## What is a ReplicaSet in Kubernetes?

A **ReplicaSet** ensures a specified number of identical Pods run at all times. Usually managed indirectly via Deployments.

### Key Features

1. **Pod Replication** — Maintains desired replica count; replaces failed Pods.
2. **Selectors** — Label selectors identify managed Pods.
3. **Self-Healing** — Auto-recreates crashed/deleted Pods.

> Rolling updates/rollbacks are handled by Deployments, not ReplicaSets directly.

### How ReplicaSets Work

1. **Creation** — Creates Pods from template to match `replicas`.
2. **Monitoring** — Continuously reconciles actual vs desired count.
3. **Pod Management** — Only Pods matching selector are managed.

### Example ReplicaSet YAML

Here's an example YAML file for a ReplicaSet that maintains 3 replicas of an Nginx Pod:

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
```

name: nginx-replicaset

```yaml
spec:
replicas: 3
selector:
```

matchLabels:

app: nginx

template:

```yaml
metadata:
```

labels:

app: nginx

```yaml
spec:
containers:
- name: nginx
image: nginx:1.21
```

ports:

- containerPort: 80

### Managing ReplicaSets

- **Create a ReplicaSet**:

```yaml
kubectl apply -f replicaset.yaml
```

- **Check ReplicaSet Status**:

```yaml
kubectl get replicasets
kubectl describe replicaset <replicaset-name>
```

- **Delete a ReplicaSet**:

```yaml
kubectl delete replicaset <replicaset-name>
```

### Relationship with Deployments

- **Deployments** create/manage ReplicaSets; preferred for rolling updates, rollbacks, simplified management.
- Direct ReplicaSet use is rare in production.

## What is a DaemonSet?

A **DaemonSet** ensures one Pod runs on **every Node** (or a labeled subset). For cluster-wide system services.

### Key Features

1. **Node Coverage** — Pod on every node (logging, monitoring, proxies).
2. **Automatic Scheduling** — New nodes get Pods; removed nodes cleaned up.
3. **Selective Deployment** — Node selectors/tolerations limit placement.
4. **Rolling Updates** — One node at a time.

### How DaemonSets Work

1. **Configuration** — YAML with Pod template + node selectors/tolerations.
2. **Pod Creation** — Schedules on all eligible nodes.
3. **Automatic Updates** — Reacts to node add/remove.
4. **Rolling Updates** — Incremental per-node updates.

### Example DaemonSet YAML

Here's an example YAML file for a DaemonSet that deploys a logging agent on every node:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
```

name: logging-agent

labels:

app: logging

```yaml
spec:
selector:
```

matchLabels:

app: logging

template:

```yaml
metadata:
```

labels:

app: logging

```yaml
spec:
containers:
- name: logging-agent
image: my-logging-agent:latest
```

ports:

- containerPort: 8080

### Managing DaemonSets

- **Create a DaemonSet**:

```yaml
kubectl apply -f daemonset.yaml
```

- **Check DaemonSet Status**:

```yaml
kubectl get daemonsets
kubectl describe daemonset <daemonset-name>
```

- **Delete a DaemonSet**:

```yaml
kubectl delete daemonset <daemonset-name>
```

### Use Cases

- Logging agents, monitoring agents, network proxies, security agents.

## What is a StatefulSet?

A **StatefulSet** manages **stateful** apps — stable network identity, persistent storage, ordered operations.

### Key Features

1. **Stable Network Identity** — Predictable hostnames (`mypod-0`, `mypod-1`) across reschedules.
2. **Stable Storage** — Per-Pod PVC persists beyond Pod lifecycle.
3. **Ordered Deployment/Scaling** — Sequential create/scale; reverse-order termination.
4. **Unique Pod Names** — Index-based naming for consistent identity.

### How StatefulSets Work

1. **Configuration** — Pod template + `volumeClaimTemplates` + `serviceName` (headless Service).
2. **Pod Management** — Controller maintains ordered, named Pods.
3. **Persistent Storage** — Each Pod gets its own PVC.
4. **Deployment/Scaling** — Ordered, one-at-a-time for stability.

### Example StatefulSet YAML

Here's an example YAML file for a StatefulSet that deploys a stateful application (e.g., a database):

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
```

name: web

```yaml
spec:
```

serviceName: "web"

```yaml
replicas: 3
selector:
```

matchLabels:

app: web

template:

```yaml
metadata:
```

labels:

app: web

```yaml
spec:
containers:
- name: web
image: web-image:latest
```

ports:

- containerPort: 80

```yaml
volumeMounts:
- name: web-storage
```

mountPath: /data

volumeClaimTemplates:

```yaml
- metadata:
```

name: web-storage

```yaml
spec:
```

accessModes: ["ReadWriteOnce"]

resources:

requests:

storage: 1Gi

### Key Components

- **serviceName** — Headless Service for stable network identity.
- **volumeClaimTemplates** — Auto-creates per-Pod PVCs.
- **Ordered replicas** — Sequential deploy/terminate.

### Managing StatefulSets

- **Create a StatefulSet**:

```yaml
kubectl apply -f statefulset.yaml
```

- **Check StatefulSet Status**:

```yaml
kubectl get statefulsets
kubectl describe statefulset <statefulset-name>
```

- **Delete a StatefulSet**:

```yaml
kubectl delete statefulset <statefulset-name>
```

### Use Cases

- Databases (MySQL, PostgreSQL, Cassandra); Kafka, Elasticsearch; clustered apps needing stable identity.

## What is a Job in Kubernetes?

A **Job** runs one or more Pods to **completion** — batch/one-time tasks with retry and parallelism.

### Key Features

1. **Batch Processing** — Runs to completion, then exits.
2. **Completion Guarantee** — Retries failed Pods until success.
3. **Parallelism** — Concurrent Pods (`parallelism` field).
4. **Completions** — Required successful Pod count.
5. **CronJobs** — Scheduled recurring Jobs.

### How Jobs Work

1. **Configuration** — Pod template + completions + parallelism.
2. **Pod Creation** — Job controller schedules and monitors Pods.
3. **Failure Handling** — Replaces failed Pods until completions met.
4. **Completion** — Marked complete; Pods retained or deleted per policy.

### Example Job YAML

Here's an example YAML file for a Job that runs a simple task:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
```

name: example-job

```yaml
spec:
```

completions: 1

parallelism: 1

template:

```yaml
spec:
containers:
- name: example
image: busybox
command: ["sh", "-c", "echo Hello, Kubernetes! && sleep 30"]
```

restartPolicy: OnFailure

### Managing Jobs

- **Create a Job**:

```yaml
kubectl apply -f job.yaml
```

- **Check Job Status**:

```yaml
kubectl get jobs
kubectl describe job <job-name>
```

- **View Job Pods**:

```yaml
kubectl get pods --selector=job-name=<job-name>
```

- **Delete a Job**:

```yaml
kubectl delete job <job-name>
```

### Use Cases

- Batch processing, data migration, scheduled tasks (via CronJob).

## What are ConfigMaps and Secrets in Kubernetes?

**ConfigMaps** store non-sensitive config; **Secrets** store sensitive data. Decouple config from container images.

### ConfigMaps

- Key-value config: settings, env vars, config files.
- Consumed as env vars, args, or volume mounts.
- **Not** for sensitive data.

#### Example ConfigMap YAML

Here's an example YAML file for a ConfigMap that stores some application configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
```

name: app-config

data:

DATABASE_URL: "mysql://user:password@hostname:3306/dbname"

LOG_LEVEL: "debug"

### Secrets

- Passwords, tokens, SSH keys — base64-encoded (not encryption).
- RBAC-controlled access; rotate regularly.

#### Example Secret YAML

Here's an example YAML file for a Secret that stores sensitive data:

```yaml
apiVersion: v1
kind: Secret
metadata:
```

name: db-credentials

type: Opaque

data:

username: dXNlcg== # base64 encoded "user"

password: cGFzc3dvcmQ= # base64 encoded "password"

### Using ConfigMaps and Secrets

- **Environment Variables**:

  - ConfigMaps and Secrets can be injected into Pods as environment variables:

```yaml
env:
- name: DATABASE_URL
valueFrom:
configMapKeyRef:
name: app-config
key: DATABASE_URL
- name: DB_PASSWORD
valueFrom:
secretKeyRef:
name: db-credentials
key: password
```

- **Volume Mounts**:

  - ConfigMaps and Secrets can be mounted as files in volumes:

```yaml
volumes:
- name: config-volume
configMap:
name: app-config
- name: secret-volume
secret:
secretName: db-credentials
volumeMounts:
- name: config-volume
mountPath: /etc/config
- name: secret-volume
mountPath: /etc/secret
```

### Best Practices

- Never store secrets in ConfigMaps; use RBAC on Secrets; rotate regularly.

## What is a PersistentVolume (PV) and PersistentVolumeClaim (PVC)?

Abstractions for **persistent storage** independent of Pod lifecycle.

### PersistentVolume (PV)

- Represents provisioned storage (static or dynamic via StorageClass).
- Own lifecycle; reusable; access modes: RWO, ROX, RWX.

#### Example PV YAML

Here's an example YAML file for a PersistentVolume:

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

storage: 5Gi

accessModes:

- ReadWriteOnce

```yaml
storageClassName: manual
```

hostPath:

path: /mnt/data

### PersistentVolumeClaim (PVC)

- Pod/user request for storage (size, access mode, storage class).
- Kubernetes binds to matching PV or dynamically provisions.

#### Example PVC YAML

Here's an example YAML file for a PersistentVolumeClaim:

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

storage: 5Gi

```yaml
storageClassName: manual
```

### How PVs and PVCs Work Together

1. **Provisioning** — Admin PVs or StorageClass dynamic provisioning.
2. **Binding** — PVC matched to suitable PV.
3. **Usage** — Pod mounts PVC; data persists beyond Pod.
4. **Reclaim Policies** — Retain, Delete, or Recycle on PVC deletion.

### Best Practices

- Use StorageClasses for dynamic provisioning; choose correct access modes; monitor capacity.

## How do you pass environment variables to a Pod in Kubernetes?

Multiple injection methods depending on data source and sensitivity.

### 1. **Directly in the Pod Spec**

Define `env` in container spec.

#### Example YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
```

name: my-pod

```yaml
spec:
containers:
- name: my-container
image: my-image
env:
- name: ENV_VAR_NAME
```

value: "value"

```yaml
- name: ANOTHER_ENV_VAR
```

value: "another_value"

### 2. **Using ConfigMaps**

#### Example YAML

First, create a ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
```

name: my-config

data:

DATABASE_URL: "mysql://user:password@hostname:3306/dbname"

LOG_LEVEL: "debug"

Then, reference the ConfigMap in your Pod configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
```

name: my-pod

```yaml
spec:
containers:
- name: my-container
image: my-image
```

envFrom:

- configMapRef:

name: my-config

### 3. **Using Secrets**

#### Example YAML

First, create a Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
```

name: my-secret

type: Opaque

data:

username: dXNlcg== # base64 encoded "user"

password: cGFzc3dvcmQ= # base64 encoded "password"

Then, reference the Secret in your Pod configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
```

name: my-pod

```yaml
spec:
containers:
- name: my-container
image: my-image
env:
- name: DB_USERNAME
```

valueFrom:

secretKeyRef:

name: my-secret

key: username

```yaml
- name: DB_PASSWORD
```

valueFrom:

secretKeyRef:

name: my-secret

key: password

### 4. **Using Downward API**

Expose Pod/container metadata as env vars.

#### Example YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
```

name: my-pod

```yaml
spec:
containers:
- name: my-container
image: my-image
env:
- name: POD_NAME
```

valueFrom:

fieldRef:

fieldPath: metadata.name

```yaml
- name: POD_NAMESPACE
```

valueFrom:

fieldRef:

fieldPath: metadata.namespace

### 5. **Using Command-Line Arguments**

Less common — env vars referenced in `args`.

#### Example YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
```

name: my-pod

```yaml
spec:
containers:
- name: my-container
image: my-image
```

args:

- /bin/sh

- -c

- echo "Environment variable ENV_VAR_NAME is $ENV_VAR_NAME"

```yaml
env:
- name: ENV_VAR_NAME
```

value: "value"

| Method | Use For |
|--------|---------|
| Direct `env` | Static values in Pod spec |
| ConfigMap | Non-sensitive config |
| Secret | Sensitive data |
| Downward API | Pod/container metadata |
| Command args | Shell scripts referencing env |
