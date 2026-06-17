# Networking (VNet, NSG, Load Balancer, App Gateway)

## Concept Explanation

- **Virtual Network (VNet)** — your private, isolated network in Azure, divided into **subnets**. Resources in a VNet communicate privately; you control IP ranges.
- **Network Security Group (NSG)** — a stateful firewall of allow/deny rules (by IP, port, protocol, direction) attached to subnets or NICs.
- **Azure Load Balancer** — **Layer 4** (TCP/UDP) load balancing across VMs/instances; high throughput, no app-level routing.
- **Application Gateway** — **Layer 7** (HTTP/S) load balancer with path/host routing, SSL termination, and **WAF** (Web Application Firewall).
- **Azure Front Door / Traffic Manager** — global routing/CDN across regions.
- **Private Endpoint / Service Endpoint** — connect to PaaS services (Storage, SQL) over the private network instead of the public internet.

## Code Example(s)

```bash
# Create a VNet with a subnet
az network vnet create -g rg-shop -n shop-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name web --subnet-prefix 10.0.1.0/24

# NSG rule: allow HTTPS inbound, deny the rest by default
az network nsg create -g rg-shop -n web-nsg
az network nsg rule create -g rg-shop --nsg-name web-nsg -n AllowHttps \
  --priority 100 --direction Inbound --access Allow \
  --protocol Tcp --destination-port-ranges 443
```

```text
Internet
   │
   ▼
Application Gateway (L7, WAF, TLS, path routing /api → api pool, / → web pool)
   │
   ▼
VNet ── subnet(web) ── VMs / App Service (private)
        subnet(data) ── SQL via Private Endpoint
   (NSGs control traffic between subnets)
```

## Interview Q&A

**🟢 What is a VNet?**
A logically isolated private network in Azure where you define address space and subnets; resources communicate privately and you control connectivity to other networks and the internet.

**🟢 What is an NSG?**
A Network Security Group — a stateful set of allow/deny rules filtering inbound/outbound traffic by source/destination IP, port, and protocol, applied to subnets or network interfaces.

**🟡 What's the difference between Azure Load Balancer and Application Gateway?**
Load Balancer works at Layer 4 (TCP/UDP) — fast, protocol-agnostic distribution. Application Gateway works at Layer 7 (HTTP/S) with URL/host-based routing, SSL termination, and an optional WAF. Use App Gateway for web traffic needing routing/security; LB for raw TCP/UDP.

**🟡 What is a Private Endpoint?**
A network interface that connects you privately to a PaaS service (e.g. Storage, SQL) using a private IP in your VNet, so traffic never traverses the public internet — improving security.

**🔴 How would you design network isolation for a 3-tier app?**
Separate subnets per tier (web/app/data) with NSGs allowing only required traffic between them (e.g. web→app on app port, app→data on DB port), expose only the web/App Gateway publicly, put the database behind a Private Endpoint, and deny direct internet access to the data tier.

## ⚠️ Tricky / Gotchas

- **NSGs are stateful** — if you allow inbound, the response is automatically allowed outbound (you don't need a matching reverse rule). People add redundant rules.
- **Rule priority + implicit deny:** NSG rules are evaluated by priority (lower number = higher priority); there's a default deny-all inbound at the end. A higher-priority allow can be shadowed by an even higher-priority deny.
- **L4 vs L7 confusion:** Load Balancer can't do path-based routing or TLS termination — that's App Gateway/Front Door. Picking the wrong one is a common mistake.
- **Service Endpoint vs Private Endpoint:** Service Endpoints keep traffic on the Azure backbone but the service still has a public IP; Private Endpoints give a private IP in your VNet. They're not the same.
- **Overlapping address spaces** break VNet peering/VPN — plan non-overlapping CIDR ranges upfront.

## 📌 Quick Recap

- VNet = private network with subnets; NSG = stateful allow/deny firewall (subnet/NIC).
- Load Balancer = L4 (TCP/UDP); Application Gateway = L7 (HTTP routing, TLS, WAF); Front Door/Traffic Manager = global.
- Private Endpoint = private IP to PaaS (no public internet); differs from Service Endpoint.
- NSG rules: priority-ordered, stateful, implicit deny-all at the end.
- 3-tier isolation: subnet-per-tier + NSGs + private data tier + public web/App Gateway only.
- Plan non-overlapping CIDRs for peering/VPN.
