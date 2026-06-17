# Scaling, Health Probes & Resources

## Concept Explanation

**Scaling:**
- **Manual** — `kubectl scale` sets replica count.
- **Horizontal Pod Autoscaler (HPA)** — automatically adjusts replica count based on metrics (CPU, memory, custom).
- **Vertical Pod Autoscaler (VPA)** — adjusts a Pod's resource requests/limits.
- **Cluster Autoscaler** — adds/removes *nodes* when Pods can't be scheduled.

**Resources:** each container declares **requests** (guaranteed minimum, used for scheduling) and **limits** (hard cap). The scheduler places Pods based on requests; exceeding a memory limit triggers an **OOMKill**, exceeding CPU limit causes **throttling**.

**Health probes** let kubelet manage Pod health:
- **livenessProbe** — is the app alive? Fails → container restarted.
- **readinessProbe** — is it ready for traffic? Fails → removed from Service endpoints (no restart).
- **startupProbe** — for slow-starting apps; delays liveness checks until startup completes.

## Code Example(s)

```yaml
spec:
  containers:
    - name: web
      image: myapp:1.0
      resources:
        requests: { cpu: "250m", memory: "256Mi" }   # scheduling + guarantee
        limits:   { cpu: "500m", memory: "512Mi" }   # hard cap
      readinessProbe:
        httpGet: { path: /health/ready, port: 8080 }
        initialDelaySeconds: 5
        periodSeconds: 10
      livenessProbe:
        httpGet: { path: /health/live, port: 8080 }
        periodSeconds: 15
```

```yaml
# HPA: scale 2→10 replicas to keep avg CPU ~70%
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: web-hpa }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: web }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

## Interview Q&A

**🟢 What's the difference between a liveness and a readiness probe?**
Liveness checks if the app is alive — failing it restarts the container. Readiness checks if the app can serve traffic — failing it removes the Pod from the Service's endpoints (no restart) until it recovers.

**🟢 What's the difference between resource requests and limits?**
Requests are the guaranteed resources used for scheduling decisions; limits are the hard maximum a container may use. CPU over-limit is throttled; memory over-limit is OOMKilled.

**🟡 How does the Horizontal Pod Autoscaler work?**
It periodically reads metrics (e.g. CPU via metrics-server) and adjusts the Deployment's replica count between min/max to keep the metric near a target value.

**🟡 Why might a Pod be stuck `Pending`?**
Insufficient cluster resources to satisfy its requests, no node matching its affinity/taints/selectors, or an unbound PVC. The scheduler can't place it; Cluster Autoscaler may add a node if configured.

**🔴 What's the difference between HPA, VPA, and Cluster Autoscaler?**
HPA scales the *number* of Pods (horizontal). VPA tunes a Pod's *resource requests/limits* (vertical). Cluster Autoscaler adds/removes *nodes* when Pods can't be scheduled or nodes are underused. They operate at different layers and HPA+VPA can conflict on the same metric.

## ⚠️ Tricky / Gotchas

- **A wrong liveness probe causes restart loops.** If the probe is too aggressive (short timeout, app slow to start), kubelet keeps killing a healthy-but-slow app. Use a `startupProbe` for slow starters.
- **No resource requests → poor scheduling + QoS.** Without requests, the scheduler can overcommit nodes and your Pod is first to be evicted under pressure (BestEffort QoS).
- **Memory limit hit = OOMKilled (137)**, not throttled — a common "why did my container restart?" surprise. CPU limit only throttles.
- **HPA needs metrics-server** installed, and requests defined, or it can't compute utilization.
- **Readiness vs liveness confusion**: using liveness for dependency checks (e.g. DB down) causes unnecessary restarts; use readiness so the Pod just leaves rotation.

## 📌 Quick Recap

- Scaling: manual, HPA (Pod count), VPA (Pod resources), Cluster Autoscaler (nodes).
- Requests = scheduling/guarantee; Limits = hard cap (CPU throttles, memory OOMKills).
- Liveness fail → restart; Readiness fail → out of endpoints; Startup → for slow starts.
- HPA needs metrics-server + defined requests.
- Pending Pod = no schedulable node (resources/affinity/taints/PVC).
- Don't put dependency checks in liveness (use readiness).
