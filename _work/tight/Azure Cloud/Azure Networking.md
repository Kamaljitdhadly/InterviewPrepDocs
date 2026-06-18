# Azure Networking

## Questions Covered

1. What is an Azure Virtual Network (VNet)?
2. What are subnets, and why must resources live in a subnet?
3. What is CIDR notation, and how do you plan IP address space?
4. What is a Network Security Group (NSG)?
5. What is Azure Bastion, and why use it over public RDP?
6. What is VNet peering?
7. What is a VPN Gateway vs ExpressRoute?
8. What are Azure DNS and Private DNS zones?
9. What are Service Endpoints vs Private Endpoints?
10. What is Azure Firewall vs NSG?
11. What is Azure Load Balancer (L4)?
12. What is Azure Application Gateway (L7)?
13. What is Azure Front Door vs Traffic Manager?
14. What is VNet integration for App Service and Functions?

## What is an Azure Virtual Network (VNet)?

A **VNet** is your private network boundary in Azure — logically isolated from other tenants. Think of it as your organization's datacenter network in the cloud (AWS equivalent: **VPC**).

| Property | Detail |
|----------|--------|
| **Scope** | Single region (regional resource) |
| **Address space** | Private RFC 1918 ranges (e.g. `10.0.0.0/16`) |
| **Default size** | Up to 65,536 addresses in `/16` |
| **Isolation** | Other orgs' VNets cannot reach yours by default |

```bash
az network vnet create \
  --resource-group rg-prod \
  --name vnet-prod \
  --address-prefix 10.0.0.0/16 \
  --subnet-name subnet-web \
  --subnet-prefix 10.0.1.0/24
```

Resources in the same VNet communicate by default. Cross-VNet requires **peering** or **gateways**.

## What are subnets, and why must resources live in a subnet?

**Subnets** divide a VNet's address space into segments. **Every** NIC (VM, App Service integration, Gateway, etc.) attaches to exactly one subnet.

| Rule | Detail |
|------|--------|
| **No overlap** | Subnet ranges must not overlap within VNet |
| **Reserved IPs** | Azure reserves 5 IPs per subnet (first 4 + last) |
| **NSG association** | Apply NSG at subnet or NIC level |
| **Special subnets** | `GatewaySubnet`, `AzureBastionSubnet` — dedicated names required |

```text
VNet 10.0.0.0/16
  ├── subnet-web      10.0.1.0/24   (App Service, VMs)
  ├── subnet-data     10.0.2.0/24   (SQL private endpoint)
  ├── subnet-aks      10.0.3.0/22   (AKS nodes — larger for scaling)
  └── GatewaySubnet   10.0.255.0/27 (VPN/ExpressRoute)
```

**Smaller attack surface:** Use `/24` or smaller subnets — don't assign `/16` to one subnet unless needed.

## What is CIDR notation, and how do you plan IP address space?

**CIDR** (Classless Inter-Domain Routing) defines IP ranges: `10.0.1.0/24`

| CIDR | Addresses | Usable (Azure subnet) |
|------|-----------|----------------------|
| `/28` | 16 | ~11 |
| `/24` | 256 | ~251 |
| `/16` | 65,536 | ~65,531 |

```text
10.0.1.0/24 breakdown:
  10.0.1.0   – network address (reserved)
  10.0.1.1   – Azure default gateway (reserved)
  10.0.1.2   – Azure DNS (reserved)
  10.0.1.3   – reserved for future
  10.0.1.4+  – usable for VMs
  10.0.1.255 – broadcast (reserved)
```

**Planning tips:** Leave room for growth; avoid overlapping on-prem ranges if using VPN; use **/22 or /23** for AKS (needs many pod IPs with Azure CNI).

## What is a Network Security Group (NSG)?

**NSG** = stateful firewall rules for inbound/outbound traffic on NICs and subnets.

| Priority | Rule | Action |
|----------|------|--------|
| 100 | Allow HTTPS inbound from Internet | Allow |
| 200 | Allow RDP from Bastion subnet | Allow |
| 4096 | DenyAllInbound (default) | Deny |

```bash
az network nsg rule create \
  --resource-group rg-prod \
  --nsg-name nsg-web \
  --name AllowHTTPS \
  --priority 100 \
  --source-address-prefixes Internet \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp
```

**Default rules:** Allow VNet inbound; allow Azure Load Balancer; deny internet inbound. **First matching rule wins** (lower priority number = higher priority).

**Critical:** Remove default RDP/SSH-from-internet rules on production VMs immediately after creation.

## What is Azure Bastion, and why use it over public RDP?

**Azure Bastion** provides browser-based RDP/SSH to VMs **without public IPs** on the VMs.

| Approach | Security |
|----------|----------|
| **Public IP + RDP** | Port 3389 exposed — brute force risk |
| **Bastion** | HTTPS to Azure; VM stays private |

```bash
az network bastion create \
  --resource-group rg-prod \
  --name bastion-prod \
  --vnet-name vnet-prod \
  --public-ip-address pip-bastion
```

Requires dedicated **`AzureBastionSubnet`** (`/26` minimum). Use **Standard SKU** for native client and scale.

## What is VNet peering?

**VNet peering** connects two VNets so resources communicate over Azure backbone — low latency, private.

| Type | Scope |
|------|-------|
| **Regional peering** | Same region — both directions |
| **Global peering** | Cross-region |

```bash
az network vnet peering create \
  --resource-group rg-prod \
  --name peer-to-hub \
  --vnet-name vnet-spoke-app \
  **--remote-vnet /subscriptions/{sub}/resourceGroups/rg-hub/providers/Microsoft.Network/virtualNetworks/vnet-hub \
  --allow-vnet-access
```

**Hub-spoke topology:** Central hub VNet (firewall, VPN gateway); spoke VNets for apps — peer spokes to hub, not always spoke-to-spoke.

**Not transitive:** Spoke A ↔ Hub ↔ Spoke B does **not** automatically allow A ↔ B.

## What is a VPN Gateway vs ExpressRoute?

| | VPN Gateway | ExpressRoute |
|---|-------------|--------------|
| **Connection** | Encrypted tunnel over internet | Private dedicated circuit via ISP |
| **Bandwidth** | Up to ~1.25 Gbps | 50 Mbps – 100 Gbps |
| **Latency** | Variable | Consistent, lower |
| **Cost** | Lower | Higher |
| **Use case** | Dev, small offices, backup | Enterprise, compliance, high throughput |

```text
On-premises ──VPN/ExpressRoute──► Hub VNet ──peering──► Spoke VNets
```

**Site-to-Site VPN:** IPsec tunnel between on-prem VPN device and Azure VPN Gateway.

## What are Azure DNS and Private DNS zones?

| Service | Purpose |
|---------|---------|
| **Azure DNS (public)** | Host public domain records (A, CNAME, MX) |
| **Private DNS zone** | Name resolution within VNets (e.g. `internal.contoso.com`) |

```bash
az network private-dns zone create \
  --resource-group rg-prod \
  --name internal.contoso.com

az network private-dns link vnet create \
  --resource-group rg-prod \
  --zone-name internal.contoso.com \
  --name link-prod \
  --virtual-network vnet-prod \
  --registration-enabled false
```

Private DNS links to **Private Endpoints** — `mydb.internal.contoso.com` resolves to private IP of Azure SQL.

## What are Service Endpoints vs Private Endpoints?

Both secure PaaS access from VNet — different mechanisms:

| | Service Endpoint | Private Endpoint |
|---|------------------|------------------|
| **Traffic path** | Stays on Azure backbone; service keeps public IP | Private IP in your subnet |
| **Data exfiltration risk** | Higher (any resource in VNet) | Lower (specific NIC) |
| **DNS** | Public FQDN | Private DNS zone |
| **Cost** | Free | Private endpoint hourly charge |
| **Preferred today** | Legacy | **Recommended** for new designs |

```bash
# Private Endpoint for Storage Account
az network private-endpoint create \
  --resource-group rg-prod \
  --name pe-storage \
  --vnet-name vnet-prod \
  --subnet subnet-data \
  --private-connection-resource-id $(az storage account show -n mystorage -g rg-prod --query id -o tsv) \
  --group-id blob \
  --connection-name storage-connection
```

## What is Azure Firewall vs NSG?

| | NSG | Azure Firewall |
|---|-----|----------------|
| **Layer** | L3/L4 (IP, port) | L3/L4 + L7 (FQDN, threat intel) |
| **Scope** | Subnet/NIC | Hub VNet, centralized |
| **Policy** | Allow/deny rules | DNAT, SNAT, app rules, IDPS |
| **Cost** | Free | Premium SKU cost |

Use **NSG** for basic segmentation. Add **Azure Firewall** in hub for centralized egress control, FQDN filtering, and logging.

## What is Azure Load Balancer (L4)?

**Azure Load Balancer** distributes TCP/UDP traffic at **Layer 4** — no URL/path awareness.

| SKU | Scope |
|-----|-------|
| **Public** | Internet-facing |
| **Internal** | Private VNet only |

**Features:** Health probes, outbound SNAT, HA ports (for HA pairs).

```bash
az network lb create \
  --resource-group rg-prod \
  --name lb-web \
  --sku Standard \
  --public-ip-address pip-web \
  --frontend-ip-name fe-ip \
  --backend-pool-name be-pool
```

Works with **VMs and VMSS**. Unhealthy instances removed from rotation automatically.

## What is Azure Application Gateway (L7)?

**Application Gateway** is a **Layer 7** (HTTP/HTTPS) load balancer with advanced routing.

| Feature | Detail |
|---------|--------|
| **URL/path routing** | `/api/*` → API pool; `/*` → web pool |
| **SSL termination** | Centralized cert management |
| **WAF** | OWASP rule sets, bot protection |
| **Session affinity** | Cookie-based sticky sessions |
| **Autoscaling** | Scale based on traffic |

```text
Internet → Application Gateway (WAF v2)
              ├── Backend pool: App Service
              ├── Backend pool: VMSS
              └── Backend pool: AKS ingress
```

See **Azure Application Gateway and Load Balancer.md** for deep comparison.

## What is Azure Front Door vs Traffic Manager?

| Service | Layer | Use case |
|---------|-------|----------|
| **Traffic Manager** | DNS (L7 routing) | Global failover, geo-routing — no traffic proxy |
| **Front Door** | L7 global CDN + WAF | Global load balancing, caching, SSL, WAF |
| **CDN** | Content caching | Static asset delivery |

```text
Traffic Manager: DNS resolves to nearest healthy endpoint (no proxy)
Front Door:      All traffic proxied through Microsoft edge — WAF, caching, routing
```

Use **Front Door** for global web apps needing WAF + CDN. **Traffic Manager** for simple DNS-based failover.

## What is VNet integration for App Service and Functions?

**Regional VNet Integration** lets App Service/Functions reach resources in a VNet (private SQL, internal APIs).

```bash
az webapp vnet-integration add \
  --resource-group rg-prod \
  --name myapi-prod \
  --vnet vnet-prod \
  --subnet subnet-appintegration
```

| Integration type | Direction |
|------------------|-----------|
| **Regional VNet Integration** | App → VNet (outbound to private resources) |
| **Private Endpoint (inbound)** | VNet → App (private inbound access) |

Subnet for integration must be delegated or dedicated (`/28` minimum). Required for accessing **Private Endpoint** databases from App Service.

## Related Topics

- **Azure Compute.md** — VM, App Service, AKS networking needs
- **Azure Application Gateway and Load Balancer.md** — L4 vs L7 deep dive
- **Azure Storage and Databases.md** — private endpoints for data
- **Azure Security and Monitoring.md** — Firewall, DDoS protection
