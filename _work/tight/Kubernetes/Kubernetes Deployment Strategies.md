# Kubernetes Deployment Strategies

## Questions Covered

1. What are the different deployment strategies in Kubernetes (e.g., Rolling Update, Blue-Green)?
2. What is a Canary Deployment in Kubernetes?
3. What is A/B Testing in Kubernetes?

## What are the different deployment strategies in Kubernetes (e.g., Rolling Update, Blue-Green)?

K8s supports multiple rollout strategies — choice depends on availability, risk tolerance, and complexity.

### 1. Rolling Update

**Gradually** replaces old Pods with new ones — no full downtime.

| Aspect | Details |
|--------|---------|
| **Mechanism** | Incremental Pod replacement; `maxUnavailable` + `maxSurge` control pace |
| **Pros** | Some instances always available; incremental validation |
| **Use case** | Default for most apps needing availability during updates |

**Example:**

```yaml
spec:
```

strategy:

type: RollingUpdate

rollingUpdate:

maxUnavailable: 1

maxSurge: 1

### 2. Blue-Green Deployment

Two parallel environments — **Blue** (current) and **Green** (new). Traffic switches once Green is validated.

| Aspect | Details |
|--------|---------|
| **Mechanism** | Both versions run; switch Service/LB to Green |
| **Pros** | Zero-downtime cutover; instant rollback to Blue |
| **Use case** | Critical apps needing clean rollback |

**Example:** Deploy two Pod sets; update Service selector to point at new version.

### 3. Canary Deployment

New version released to a **small traffic slice** first; gradually expanded after validation.

| Aspect | Details |
|--------|---------|
| **Mechanism** | Small % traffic → monitor → increase exposure |
| **Pros** | Risk mitigation; early issue detection |
| **Use case** | Production validation before full rollout |

**Example:**

```yaml
spec:
```

strategy:

type: RollingUpdate

rollingUpdate:

maxUnavailable: 0

maxSurge: 1

### 4. Recreate Deployment

**Terminates all** old Pods before starting new ones — brief downtime.

| Aspect | Details |
|--------|---------|
| **Mechanism** | No overlap between versions |
| **Pros** | Simple; all instances on same version |
| **Use case** | Downtime acceptable; overlapping versions problematic |

**Example:**

```yaml
spec:
```

strategy:

type: Recreate

## What is a Canary Deployment in Kubernetes?

**Canary deployment** routes a small % of production traffic to a new version while the old version serves the rest — validate before full rollout.

### How It Works

1. **Initial deploy** — new Pods alongside existing version
2. **Traffic split** — weighted routing via Service, Ingress, or external LB
3. **Monitor** — metrics, logs, user feedback on canary
4. **Gradual rollout** — increase canary traffic as confidence grows
5. **Complete or rollback** — promote to 100% or redirect traffic back to stable version

### Advantages

- **Risk mitigation** — limited blast radius
- **Early detection** — issues caught on small audience
- **Incremental control** — adjust based on real performance data

### Implementation Steps

1. **Deploy canary** — separate Deployment running alongside stable version
2. **Adjust routing** — weighted Ingress or external tool:

```yaml
Example of a Service with weighted routing (using an ingress controller or external tool):
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: canary-ingress
spec:
rules:
- host: example.com
http:
paths:
- path: /
pathType: Prefix
backend:
service:
name: canary-service
port:
number: 80
```

3. **Monitor** — Prometheus, Grafana, logging
4. **Increase traffic** — adjust weights as canary proves stable
5. **Promote or rollback** — scale up new version / remove old, or reverse traffic

### Example: Two Deployments

```yaml
# Deployment for current version (myapp-v1)
apiVersion: apps/v1
kind: Deployment
metadata:
name: myapp-v1
spec:
replicas: 10
selector:
matchLabels:
app: myapp
version: v1
template:
metadata:
labels:
app: myapp
version: v1
spec:
containers:
- name: myapp
image: myapp:v1
# Deployment for canary version (myapp-v2)
apiVersion: apps/v1
kind: Deployment
metadata:
name: myapp-v2
spec:
replicas: 1
selector:
matchLabels:
app: myapp
version: v2
template:
metadata:
labels:
app: myapp
version: v2
spec:
containers:
- name: myapp
image: myapp:v2
```

**Service** routes to both via shared label:

```yaml
apiVersion: v1
kind: Service
metadata:
name: myapp
spec:
selector:
app: myapp
ports:
- protocol: TCP
port: 80
targetPort: 80
```

## What is A/B Testing in Kubernetes?

**A/B testing** compares two app versions (**A** = control, **B** = variant) in production using predefined metrics to drive data-informed decisions.

### How It Works

1. **Create versions** — A (original) and B (changed)
2. **Deploy both** — separate Deployments/Services in cluster
3. **Split traffic** — Services, Ingress, or external LB
4. **Measure** — response time, errors, engagement, conversion, etc.
5. **Analyze** — determine winner by defined criteria
6. **Decide** — full rollout of B, stay on A, or iterate

### Implementation

#### 1. Service-Based Routing

**Deployments:**

```yaml
# Deployment for Version A
apiVersion: apps/v1
kind: Deployment
metadata:
name: app-version-a
spec:
replicas: 5
selector:
matchLabels:
app: myapp
version: a
template:
metadata:
labels:
app: myapp
version: a
spec:
containers:
- name: myapp
image: myapp:v1
# Deployment for Version B
apiVersion: apps/v1
kind: Deployment
metadata:
name: app-version-b
spec:
replicas: 5
selector:
matchLabels:
app: myapp
version: b
template:
metadata:
labels:
app: myapp
version: b
spec:
containers:
- name: myapp
image: myapp:v2
```

**Service:**

```yaml
apiVersion: v1
kind: Service
metadata:
name: myapp
spec:
selector:
app: myapp
ports:
- protocol: TCP
port: 80
targetPort: 80
```

**Ingress (path-based split):**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: myapp-ingress
spec:
rules:
- host: example.com
http:
paths:
- path: /version-a
pathType: Prefix
backend:
service:
name: app-version-a
port:
number: 80
- path: /version-b
pathType: Prefix
backend:
service:
name: app-version-b
port:
number: 80
```

#### 2. Advanced Traffic Management

- **Istio / Linkerd** — weighted routing, headers, fault injection
- **Feature flags** — LaunchDarkly, Flagsmith for granular exposure
- **External LBs** — weighted distribution at edge

### Example Use Case

Test new UI (B) vs current (A): deploy both → 50/50 traffic split → measure engagement/bounce rate → adopt winner or iterate.
