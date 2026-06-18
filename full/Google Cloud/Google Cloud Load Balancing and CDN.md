# Google Cloud Load Balancing and CDN

## Questions Covered

1. What load balancing options exist on GCP?
2. What is the global HTTP(S) load balancer?
3. What is the regional vs global load balancing difference?
4. What are backend services and network endpoint groups (NEGs)?
5. What is Cloud CDN?
6. What is SSL/TLS termination on GCP load balancers?
7. What is Cloud Armor?
8. What is internal load balancing?
9. How do you load balance Cloud Run and GKE?
10. What is Cloud DNS integration with load balancing?
11. What is Premium vs Standard Network Service Tier?
12. When do you choose which load balancer type?

## What load balancing options exist on GCP?

| Load balancer | Scope | Layer | Use |
|---------------|-------|-------|-----|
| **Global external HTTP(S)** | Global | L7 | Web apps worldwide — **most common** |
| **Regional external HTTP(S)** | Regional | L7 | Regional HTTP |
| **External TCP/UDP proxy** | Global | L4 | TCP with Google edge |
| **External TCP/UDP (pass-through)** | Regional | L4 | Raw TCP/UDP, preserve client IP |
| **Internal HTTP(S)** | Regional | L7 | Private VPC HTTP |
| **Internal TCP/UDP** | Regional | L4 | Private VPC TCP |

```text
Public web API (global)     → Global external HTTP(S) LB + CDN
Private microservices       → Internal HTTP(S) LB
Non-HTTP TCP game server    → External TCP proxy or pass-through NLB
```

GCP uses **Envoy-based** data plane for advanced L7 LBs.

## What is the global HTTP(S) load balancer?

**Global external Application Load Balancer** — single **anycast IP** — routes to closest healthy backend.

```text
User (Tokyo) ──→ Google edge ──→ Backend in asia-northeast1 (if healthy)
User (London) ──→ Google edge ──→ Backend in europe-west1
```

Components:

| Component | Role |
|-----------|------|
| **Forwarding rule** | External IP + port |
| **Target HTTP(S) proxy** | SSL cert, URL map |
| **URL map** | Path/host routing |
| **Backend service** | Health checks, backends |
| **Backends** | MIG, NEG (Cloud Run, GKE) |

```bash
gcloud compute url-maps create web-map --default-service=web-backend
gcloud compute target-https-proxy create web-proxy --url-map=web-map --ssl-certificates=web-cert
```

## What is the regional vs global load balancing difference?

| | Global HTTP(S) | Regional HTTP(S) |
|---|----------------|------------------|
| **IP** | Anycast global | Regional external IP |
| **Backends** | Multi-region | Single region only |
| **Use** | Global users, CDN | Data residency in one region |
| **Failover** | Cross-region failover in URL map | Within region only |

**Internal** load balancers are always **regional** — private RFC1918 VIP in VPC.

## What are backend services and network endpoint groups (NEGs)?

**Backend service** — defines protocol, timeout, health check, session affinity.

**NEG types:**

| NEG | Targets |
|-----|---------|
| **Zonal NEG (GCE)** | GCE VM IP:port |
| **Internet NEG** | External origin (on-prem, other cloud) |
| **Serverless NEG** | Cloud Run, App Engine |
| **Private Service Connect NEG** | Published services |

```bash
gcloud compute network-endpoint-groups create run-neg \
  --region=us-central1 --network-endpoint-type=serverless \
  --cloud-run-service=myapi

gcloud compute backend-services add-backend web-backend \
  --global --network-endpoint-group=run-neg --network-endpoint-group-region=us-central1
```

Enables **single LB** routing to mix of GCE MIG + Cloud Run services.

## What is Cloud CDN?

**Cloud CDN** — caches content at Google's edge — enabled on backend service.

| Feature | Benefit |
|---------|---------|
| **Cache modes** | Cache all static, use origin headers |
| **Signed URLs/cookies** | Private content |
| **Cache invalidation** | Purge by path |

```bash
gcloud compute backend-services update web-backend --enable-cdn --global
```

Origin: GCS bucket, Cloud Storage + LB, or Compute Engine.

Compare **AWS CloudFront** / **Azure Front Door + CDN**.

## What is SSL/TLS termination on GCP load balancers?

| Option | Detail |
|--------|--------|
| **Google-managed certs** | Auto-provision for domain on LB — free |
| **Self-managed** | Upload cert + key |
| **Certificate Manager** | Centralized cert lifecycle |
| **SSL policies** | Min TLS version, cipher suites |

```bash
gcloud compute ssl-certificates create web-cert --domains=www.myapp.com --global
```

**End-to-end SSL:** HTTPS LB → HTTPS to backend (re-encrypt) for compliance.

## What is Cloud Armor?

**Cloud Armor** — WAF + DDoS for HTTP(S) LB and Cloud CDN.

| Feature | Detail |
|---------|--------|
| **Security policies** | OWASP rules, XSS, SQLi |
| **Rate limiting** | Per IP throttle |
| **Geo blocking** | Deny/allow countries |
| **Adaptive protection** | ML-based L7 DDoS (Managed Protection Plus) |

```bash
gcloud compute security-policies create web-policy \
  --description="WAF for prod"
gcloud compute security-policies rules create 1000 --security-policy=web-policy \
  --expression="evaluatePreconfiguredExpr('xss-stable')" --action=deny-403
```

Attach policy to **backend service**.

## What is internal load balancing?

**Internal HTTP(S) LB** — private IP in VPC — east-west traffic between services.

```text
App tier (VPC) → Internal LB VIP 10.0.1.100 → API microservices MIG
```

No public IP — accessible only from connected VPCs (peering, Shared VPC).

## How do you load balance Cloud Run and GKE?

| Target | Setup |
|--------|-------|
| **Cloud Run** | Serverless NEG on backend service; Cloud Run scales automatically |
| **GKE** | Container-native LB — Ingress controller creates NEG per service |
| **Multi-region Cloud Run** | Global LB + NEGs in each region |

```yaml
# GKE Ingress (GCE class) — creates Google Cloud LB
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: "gce"
spec:
  rules:
  - host: api.myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-api
            port:
              number: 80
```

## What is Cloud DNS integration with load balancing?

Create **A/AAAA record** pointing to LB global IP:

```bash
gcloud dns record-sets create www.myapp.com. --zone=myapp-zone --type=A --ttl=300 --rrdatas=35.190.x.x
```

Use **low TTL** during migrations; **DNSSEC** for integrity.

## What is Premium vs Standard Network Service Tier?

| Tier | Routing | Use |
|------|---------|-----|
| **Premium** | Google global backbone — lower latency | Default — production |
| **Standard** | Public internet routing — cheaper egress | Cost-sensitive, non-latency-critical |

Load balancing and CDN typically use **Premium tier** for best performance.

## When do you choose which load balancer type?

| Requirement | Choice |
|-------------|--------|
| Global HTTPS web app | Global external HTTP(S) + CDN |
| Cloud Run public API | Serverless NEG + global HTTP(S) |
| Regional compliance | Regional external HTTP(S) |
| Private service mesh | Internal HTTP(S) LB |
| TCP/UDP non-HTTP | TCP/UDP proxy or pass-through |
| WebSocket, gRPC | HTTP(S) LB supports both |
| WAF at edge | Cloud Armor on HTTP(S) LB |

```text
Static React on GCS        → LB + CDN → GCS backend bucket
Dynamic API on Cloud Run   → Global HTTPS LB → Serverless NEG
Legacy TCP service         → Regional TCP pass-through LB
```

See **Google Cloud API Gateway.md** for API management layer in front of Cloud Run.

## Related Topics

- **Google Cloud Compute.md** — MIG, Cloud Run
- **Google Cloud Networking.md** — VPC, firewall for health checks
- **Google Cloud API Gateway.md** — API layer vs raw LB
- **AWS/AWS Load Balancing and CDN.md** · **Azure Cloud 1/Azure Application Gateway and Load Balancer.md**
