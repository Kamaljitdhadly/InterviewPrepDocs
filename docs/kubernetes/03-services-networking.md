# Services & Networking

## Concept Explanation

Because Pods are ephemeral with changing IPs, a **Service** provides a **stable virtual IP (ClusterIP) and DNS name** that load-balances across a set of Pods (selected by labels). Service types:

| Type | Exposes | Use |
|---|---|---|
| **ClusterIP** *(default)* | internal-only virtual IP | Pod-to-Pod within the cluster |
| **NodePort** | a port on every node's IP | basic external access / dev |
| **LoadBalancer** | external cloud load balancer | production external access (cloud) |
| **ExternalName** | DNS CNAME to an external host | map to external services |

K8s DNS gives every Service a name: `service.namespace.svc.cluster.local`. **Endpoints** track the actual Pod IPs behind a Service.

## Code Example(s)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP            # internal stable IP
  selector:
    app: web                 # routes to Pods with label app=web
  ports:
    - port: 80               # service port
      targetPort: 8080       # container port
```

```bash
# From another Pod, reach the service by name (K8s DNS):
#   http://web              (same namespace)
#   http://web.prod.svc.cluster.local   (fully qualified)

kubectl get svc
kubectl get endpoints web         # actual Pod IPs behind the service
kubectl port-forward svc/web 8080:80   # access locally for debugging
```

## Interview Q&A

**🟢 Why do we need a Service if Pods have IPs?**
Pod IPs change as Pods are recreated/rescheduled. A Service gives a stable IP and DNS name, and load-balances traffic across the healthy Pods behind it.

**🟢 What are the Service types?**
ClusterIP (internal, default), NodePort (port on each node), LoadBalancer (external cloud LB), and ExternalName (DNS alias to an external host).

**🟡 How does service discovery work in Kubernetes?**
Via cluster DNS: each Service gets a DNS name (`service.namespace.svc.cluster.local`), and Pods resolve it to the Service's ClusterIP, which load-balances to backing Pods. Environment variables are also injected (legacy).

**🟡 What's the difference between `port` and `targetPort`?**
`port` is the port the Service exposes; `targetPort` is the port on the Pods/containers it forwards to. They can differ (e.g. Service on 80 → container on 8080).

**🔴 How does a Service load-balance, and what's the role of kube-proxy?**
kube-proxy programs the node's networking (iptables/IPVS) so traffic to the Service's ClusterIP is distributed across the current endpoint Pod IPs. The Service controller keeps Endpoints in sync with healthy Pods matching the selector.

## ⚠️ Tricky / Gotchas

- **Selector mismatch = no endpoints.** If the Service `selector` doesn't match any Pod labels, the Service has zero endpoints and silently routes nowhere (connection refused/timeouts). Check `kubectl get endpoints`.
- **NodePort range is limited** (default 30000–32767) and exposes on *every* node — not ideal for production; use LoadBalancer/Ingress.
- **LoadBalancer needs a cloud provider** — on bare-metal it stays `<pending>` unless you run something like MetalLB.
- **Headless Service** (`clusterIP: None`) returns Pod IPs directly (no load-balancing) — used by StatefulSets for stable per-Pod DNS.
- **Cross-namespace access** needs the FQDN (`svc.namespace`), not just the short name.

## 📌 Quick Recap

- Service = stable IP + DNS + load balancing over label-selected Pods.
- Types: ClusterIP (internal), NodePort (node port), LoadBalancer (cloud external), ExternalName (DNS alias).
- DNS: `service.namespace.svc.cluster.local`; cross-namespace needs the FQDN.
- `port` (service) vs `targetPort` (container) can differ.
- Endpoints track real Pod IPs; selector must match Pod labels or there are no endpoints.
- kube-proxy programs node networking to distribute traffic.
