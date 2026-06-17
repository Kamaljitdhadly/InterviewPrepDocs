# Ingress

## Concept Explanation

A **Service** of type LoadBalancer gives one external IP per service — expensive and limited. **Ingress** provides **HTTP/HTTPS routing** into the cluster through a single entry point, routing by **host** and **path** to different backend Services, plus **TLS termination**.

Ingress has two parts:
- **Ingress resource** — the YAML rules (host/path → service).
- **Ingress controller** — the actual reverse proxy (NGINX, Traefik, AGIC, etc.) that *implements* those rules. **Without a controller installed, an Ingress resource does nothing.**

## Code Example(s)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts: [app.example.com]
      secretName: app-tls          # TLS cert stored in a Secret
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port: { number: 80 }
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port: { number: 80 }
```

```bash
kubectl get ingress
kubectl describe ingress app-ingress
# Install a controller first, e.g.:
# helm install ingress-nginx ingress-nginx/ingress-nginx
```

## Interview Q&A

**🟢 What is an Ingress?**
A Kubernetes resource that defines HTTP/HTTPS routing rules (by host and path) to route external traffic to internal Services through a single entry point, with optional TLS termination.

**🟢 What's the difference between a Service of type LoadBalancer and an Ingress?**
A LoadBalancer exposes a single Service with its own external IP (Layer 4). Ingress is a Layer 7 router that can fan out to many Services by host/path behind one load balancer/IP — more cost-effective and feature-rich for HTTP.

**🟡 What is an Ingress controller and why is it required?**
The Ingress resource is just rules; the controller (NGINX, Traefik, etc.) is the proxy that actually watches Ingress resources and routes traffic. Without a controller, Ingress resources have no effect.

**🟡 How does Ingress handle TLS?**
You reference a Secret containing the TLS cert/key in the Ingress `tls` section; the controller terminates TLS at the edge and forwards plain HTTP to backends.

**🔴 How would you do canary or path-based routing?**
Via controller-specific annotations (e.g. NGINX canary annotations splitting traffic by weight/header) or multiple Ingress rules. For advanced traffic management, a service mesh (Istio/Linkerd) or Gateway API offers finer control.

## ⚠️ Tricky / Gotchas

- **No Ingress controller = nothing happens.** Creating an Ingress without installing a controller is the #1 "my Ingress doesn't work" issue.
- **`pathType` matters:** `Prefix` vs `Exact` vs `ImplementationSpecific` change matching behavior; wrong type leads to 404s.
- **Ingress is HTTP(S)-focused** — for arbitrary TCP/UDP you need a LoadBalancer Service or controller-specific config.
- **Annotations are controller-specific** — NGINX annotations won't work on Traefik. Portability is limited (the **Gateway API** aims to fix this).
- **DNS must point at the controller's external IP/LB** — forgetting this means the host rule never matches real traffic.

## 📌 Quick Recap

- Ingress = L7 HTTP/HTTPS routing by host/path to Services, with TLS termination, via one entry point.
- Two parts: Ingress resource (rules) + Ingress controller (the proxy that implements them).
- No controller installed → Ingress does nothing.
- vs LoadBalancer: Ingress fans out to many Services behind one IP (cheaper, L7).
- `pathType` and annotations are important and controller-specific.
- Point DNS at the controller's external IP.
