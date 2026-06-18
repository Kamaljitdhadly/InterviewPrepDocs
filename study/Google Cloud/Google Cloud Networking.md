# Google Cloud Networking

## Questions Covered

1. What is a VPC network on GCP?
2. What are subnets, and how is GCP subnet design different from AWS?
3. What are firewall rules vs hierarchical firewall policies?
4. What is Cloud NAT?
5. What is VPC peering and Shared VPC?
6. What is Private Google Access and Private Service Connect?
7. What is Cloud DNS?
8. What is Cloud CDN and Cloud Load Balancing overview?
9. What is Cloud VPN vs Cloud Interconnect?
10. How do you design a multi-tier VPC?
11. What are VPC Flow Logs?
12. How does Cloud Run connect to private resources?

## What is a VPC network on GCP?

**VPC (Virtual Private Cloud)** — global logical network; subnets are **regional** (span all zones in region).

| GCP vs AWS | GCP | AWS |
|------------|-----|-----|
| **VPC scope** | Global per project | Regional |
| **Subnet scope** | Regional (auto spans zones) | AZ-specific |
| **Default VPC** | Auto-created with subnets per region | One per region |

```bash
gcloud compute networks create prod-vpc --subnet-mode=custom
gcloud compute networks subnets create prod-subnet \
  --network=prod-vpc --region=us-central1 --range=10.0.1.0/24
```

**Auto mode VPC** — one subnet per region automatically (avoid for production — use **custom mode**).

## What are subnets, and how is GCP subnet design different from AWS?

Subnets in GCP are **regional** — VMs in `us-central1-a` and `us-central1-b` can use same subnet CIDR.

```text
VPC prod-vpc (global)
  ├── subnet prod-us-central1  10.0.1.0/24  (region us-central1)
  ├── subnet prod-europe-west1 10.0.2.0/24  (region europe-west1)
  └── subnet prod-asia-east1   10.0.3.0/24  (region asia-east1)
```

| Rule | Detail |
|------|--------|
| **No overlap** | Subnet ranges must not overlap in same VPC |
| **Private Google Access** | VMs without public IP reach Google APIs via private paths |
| **Flow logs** | Enable per subnet for audit |

## What are firewall rules vs hierarchical firewall policies?

**VPC firewall rules** — stateful L3/L4 filters; applied by **target tags** or **service accounts**.

| Priority | Rule example |
|----------|--------------|
| 1000 | Allow tcp:443 from `130.211.0.0/22` (LB health checks) |
| 2000 | Allow tcp:8080 from tag `lb` to tag `app` |
| 65534 | Deny all (implicit) |

```bash
gcloud compute firewall-rules create allow-iap-ssh \
  --network=prod-vpc --direction=INGRESS --action=ALLOW \
  --rules=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=ssh
```

**Hierarchical firewall policies** — org/folder level — apply before VPC rules.

**Default deny ingress** — must explicitly allow; egress often allow-all (restrict for compliance).

## What is Cloud NAT?

**Cloud NAT** — outbound internet for **private VMs** (no external IP) — regional, highly available.

```bash
gcloud compute routers create prod-router --network=prod-vpc --region=us-central1
gcloud compute routers nats create prod-nat --router=prod-router --region=us-central1 \
  --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges
```

Equivalent to **AWS NAT Gateway** / **Azure NAT Gateway**.

## What is VPC peering and Shared VPC?

| | VPC peering | Shared VPC |
|---|-------------|------------|
| **Pattern** | Connect two VPC networks | Host project owns VPC; service projects use it |
| **Transitive** | No | Centralized network team model |
| **Use** | Cross-project private connectivity | Enterprise hub networking |

```bash
gcloud compute networks peerings create peer-to-shared \
  --network=service-vpc --peer-network=projects/host-prod/global/networks/host-vpc \
  --auto-create-routes
```

**Shared VPC** — network admin in host project; app teams deploy to service projects sharing subnets.

## What is Private Google Access and Private Service Connect?

| Feature | Purpose |
|---------|---------|
| **Private Google Access** | VMs with private IP reach `*.googleapis.com` without internet |
| **Private Service Connect** | Private access to Google APIs **or** published consumer services |
| **VPC Service Controls** | Security perimeter — restrict data exfil from GCP services |

```bash
gcloud compute networks subnets update prod-subnet --region=us-central1 \
  --enable-private-ip-google-access
```

Access **Cloud SQL, GCS** via private IP with **Private Service Connect** / peering — no public endpoint.

## What is Cloud DNS?

**Cloud DNS** — managed authoritative DNS; public and private zones.

```bash
gcloud dns managed-zones create myapp-zone --dns-name=myapp.com. --description="Public zone"
gcloud dns record-sets create www.myapp.com. --zone=myapp-zone --type=A --ttl=300 --rrdatas=35.190.0.0
```

**Private DNS zones** — resolve internal names only within authorized VPCs.

Integrates with **global HTTP(S) load balancer** anycast IP.

## What is Cloud CDN and Cloud Load Balancing overview?

GCP **global HTTP(S) load balancing** uses **Google's premium network tier** — single anycast IP worldwide.

```text
User → Global HTTP(S) LB (anycast) → Backend (MIG / Cloud Run NEG / GCS bucket)
         └── Cloud CDN (optional caching layer)
```

See **Google Cloud Load Balancing and CDN.md** for ALB-equivalent details.

## What is Cloud VPN vs Cloud Interconnect?

| | Cloud VPN | Cloud Interconnect |
|---|-----------|-------------------|
| **Connection** | Encrypted over internet (HA VPN = 2 tunnels) | Dedicated partner/Direct peering |
| **Bandwidth** | Up to ~3 Gbps per tunnel | 10 Gbps – 100 Gbps |
| **Latency** | Variable | Lower, consistent |
| **Use** | Hybrid backup, dev | Enterprise primary hybrid |

**Partner Interconnect** — connect via colo partner; **Dedicated Interconnect** — direct Google link.

## How do you design a multi-tier VPC architecture?

```text
Internet → Global HTTP(S) LB
              ↓
        MIG / Cloud Run (app tier — private subnets, Cloud NAT egress)
              ↓
        Cloud SQL private IP / Memorystore (data tier — no internet)
```

| Tier | Subnet | Access |
|------|--------|--------|
| **Web/LB** | Proxy-only subnet (for regional LB) or serverless NEG | From LB |
| **App** | Private subnet + tags | From LB SA / app firewall |
| **Data** | Private subnet | From app tier only |

## What are VPC Flow Logs?

**VPC Flow Logs** — sampled network connection metadata to Cloud Logging.

```bash
gcloud compute networks subnets update prod-subnet --region=us-central1 --enable-flow-logs
```

Use for security forensics, anomaly detection — integrate with **Chronicle** or BigQuery export.

## How does Cloud Run connect to private resources?

| Option | Detail |
|--------|--------|
| **Serverless VPC Access connector** | Bridge to VPC — reach Cloud SQL private IP, Redis |
| **Direct VPC egress** | Newer — Cloud Run tasks get IPs in VPC subnet |

```bash
gcloud compute networks vpc-access connectors create run-connector \
  --region=us-central1 --network=prod-vpc --range=10.8.0.0/28

gcloud run services update myapi --vpc-connector=run-connector --vpc-egress=private-ranges-only
```

`private-ranges-only` — only RFC1918 via VPC; Google APIs still use Private Google Access path.

## Related Topics

- **Google Cloud Compute.md** — MIG, Cloud Run networking
- **Google Cloud Load Balancing and CDN.md** — global LB, CDN
- **Google Cloud Storage and Databases.md** — private Cloud SQL
- **AWS/AWS Networking.md** · **Azure Cloud/Azure Networking.md**
