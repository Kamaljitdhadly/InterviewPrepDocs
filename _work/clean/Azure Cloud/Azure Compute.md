# Azure Compute

## Questions Covered

1. What Azure compute options exist, and when do you use each?
2. What are Azure Virtual Machines, and how do you secure them?
3. What is an Azure VM scale set (VMSS)?
4. What is Azure App Service, and how does it compare to VMs?
5. What are App Service plans, deployment slots, and scaling?
6. What is Azure Kubernetes Service (AKS)?
7. What is Azure Container Instances (ACI)?
8. What is Azure Container Apps?
9. What are Azure Functions, and what are hosting plans?
10. What is Azure Batch?
11. How do you choose VM size and series?
12. What resources are created automatically when you deploy a VM?
13. How does Azure compute integrate with load balancers?

## What Azure compute options exist, and when do you use each?

| Service | Model | Best for |
|---------|-------|----------|
| **Virtual Machines** | IaaS | Full OS control, lift-and-shift, custom software |
| **VM Scale Sets** | IaaS + autoscale | Identical VMs behind load balancer |
| **App Service** | PaaS | Web apps, REST APIs, quick deploy |
| **AKS** | PaaS (K8s) | Container orchestration, microservices |
| **Container Instances** | Serverless containers | Simple, short-lived containers |
| **Container Apps** | Serverless containers | Microservices, KEDA scaling, Dapr |
| **Functions** | Serverless | Event-driven, small code units |
| **Batch** | HPC | Large parallel compute jobs |

```text
Decision tree:
  Need full OS control?           → VM / VMSS
  Web app, minimal ops?           → App Service
  Containers + orchestration?     → AKS (complex) or Container Apps (simple)
  Event/cron triggered code?      → Functions
  Run container once, no cluster? → ACI
```

## What are Azure Virtual Machines, and how do you secure them?

**Azure VMs** are IaaS — you choose OS image, size, disk, networking. You manage the guest OS.

**Creating a VM also creates:**

| Resource | Purpose |
|----------|---------|
| **OS disk** | Boot volume (managed disk) |
| **NIC** | Network interface in VNet/subnet |
| **Public IP** (optional) | Internet access |
| **NSG** (often) | Firewall rules on NIC or subnet |
| **Storage account** (legacy) | Boot diagnostics (optional) |

```bash
az vm create \
  --resource-group rg-prod \
  --name vm-web-01 \
  --image Win2022Datacenter \
  --size Standard_D2s_v5 \
  --vnet-name vnet-prod \
  --subnet subnet-web \
  --admin-username azureadmin \
  --generate-ssh-keys \
  --public-ip-address "" \
  --nsg-rule NONE
```

**Security rules (critical):**

| Risk | Mitigation |
|------|------------|
| **RDP/SSH exposed to internet** | No public IP; use **Bastion** or VPN |
| **Brute force on port 3389/22** | NSG restrict source IPs; Just-in-Time VM access |
| **Unpatched OS** | Azure Update Manager; patch schedules |
| **No disk encryption** | Azure Disk Encryption or SSE by default |

**Never** leave a production VM directly internet-facing without WAF/load balancer in front.

## What is an Azure VM scale set (VMSS)?

**VMSS** manages a group of identical VMs — same image, autoscale rules, load balancer backend pool.

| Feature | Detail |
|---------|--------|
| **Autoscale** | CPU, queue depth, schedule-based |
| **Load balancer** | Required in front for traffic distribution |
| **Upgrade policies** | Rolling, manual, automatic OS upgrades |
| **Zone support** | Spread instances across AZs |

```bash
az vmss create \
  --resource-group rg-prod \
  --name vmss-web \
  --image Ubuntu2204 \
  --upgrade-policy-mode automatic \
  --instance-count 2 \
  --load-balancer lb-web \
  --vnet-name vnet-prod \
  --subnet subnet-web
```

Use VMSS when you need **identical stateless VMs** that scale horizontally — not for single-server workloads.

## What is Azure App Service, and how does it compare to VMs?

**App Service** is a fully managed PaaS for web apps, REST APIs, and mobile backends. You deploy code; Azure runs IIS/Kestrel + OS.

| Aspect | App Service | VM |
|--------|-------------|-----|
| **OS management** | Azure | You |
| **Scaling** | Built-in (manual/autoscale) | VMSS + LB required |
| **Deploy** | Git, ZIP, Docker, CI/CD | Manual / extension |
| **Cost model** | App Service Plan (shared workers) | Per VM hour + disk |
| **Use case** | Web/API workloads | Custom OS/software |

```bash
az webapp create \
  --resource-group rg-prod \
  --plan plan-prod \
  --name myapi-prod \
  --runtime "DOTNET:8"
```

**Built-in features:** SSL, deployment slots, autoscale, VNet integration, managed identity, Application Insights integration.

## What are App Service plans, deployment slots, and scaling?

**App Service Plan** = the compute workers your apps run on. Multiple apps can share one plan.

| Plan tier | Features |
|-----------|----------|
| **Free/Shared** | Dev/test only; no SLA |
| **Basic** | Manual scale; no slots |
| **Standard** | Autoscale, 5 deployment slots, SLA |
| **Premium v3** | More scale, zone redundancy, better perf |
| **Isolated** | Dedicated hardware (ASE) |

**Deployment slots** — run staging alongside production; swap with zero downtime.

```bash
az webapp deployment slot create --name myapi-prod --resource-group rg-prod --slot staging
# Deploy to staging, test, then:
az webapp deployment slot swap --name myapi-prod --resource-group rg-prod --slot staging
```

**Autoscale rules:**

```bash
az monitor autoscale create \
  --resource-group rg-prod \
  --resource myapi-prod \
  --resource-type Microsoft.Web/serverfarms \
  --min-count 2 --max-count 10 --count 2
```

## What is Azure Kubernetes Service (AKS)?

**AKS** is managed Kubernetes — Azure runs the control plane (free); you manage node pools.

| Component | Azure manages | You manage |
|-----------|---------------|------------|
| **Control plane** | API server, etcd, scheduler | — |
| **Node pools** | — | VM size, count, patching |
| **Networking** | — | CNI choice (Azure CNI, kubenet) |
| **Workloads** | — | Pods, services, ingress |

```bash
az aks create \
  --resource-group rg-prod \
  --name aks-prod \
  --node-count 3 \
  --node-vm-size Standard_D2s_v5 \
  --enable-managed-identity \
  --network-plugin azure

az aks get-credentials --resource-group rg-prod --name aks-prod
kubectl get nodes
```

**When to choose AKS:** microservices, complex container orchestration, Helm charts, service mesh. **Overkill for:** single simple web app → use App Service or Container Apps.

## What is Azure Container Instances (ACI)?

**ACI** runs containers without managing VMs or Kubernetes — fastest way to run a container in Azure.

| Pros | Cons |
|------|------|
| Seconds to start | No built-in load balancer |
| Per-second billing | Limited networking (no native VNet until integrated) |
| Simple API | Not for long-running scaled apps |

```bash
az container create \
  --resource-group rg-dev \
  --name aci-hello \
  --image mcr.microsoft.com/azuredocs/aci-helloworld \
  --dns-name-label myhello \
  --ports 80
```

Use ACI for **batch jobs, build agents, simple APIs**. For production scaled apps → AKS or Container Apps.

## What is Azure Container Apps?

**Container Apps** is serverless container hosting built on Kubernetes — without managing the cluster.

| Feature | Detail |
|---------|--------|
| **KEDA scaling** | Scale to zero on HTTP/queue/custom metrics |
| **Dapr integration** | Service invocation, pub/sub, secrets |
| **Revision management** | Traffic splitting between revisions |
| **Ingress** | Built-in HTTPS ingress |

```bash
az containerapp create \
  --name ca-myapi \
  --resource-group rg-prod \
  --environment cae-prod \
  --image myregistry.azurecr.io/myapi:v1 \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 --max-replicas 10
```

Sweet spot between **ACI simplicity** and **AKS power**.

## What are Azure Functions, and what are hosting plans?

**Azure Functions** — event-driven serverless functions (C#, JS, Python, Java, PowerShell).

| Plan | Behavior |
|------|----------|
| **Consumption** | Pay per execution; cold starts; auto-scale |
| **Premium (EP)** | Pre-warmed instances; VNet; longer timeout |
| **Dedicated (App Service)** | Runs on existing App Service Plan |
| **Container Apps** | Functions on Container Apps environment |

```csharp
public class OrderFunctions
{
    [FunctionName("ProcessOrder")]
    public async Task Run(
        [ServiceBusTrigger("orders", Connection = "ServiceBusConnection")] string orderJson,
        [CosmosDB(databaseName: "orders", collectionName: "items", ConnectionStringSetting = "CosmosConnection")]
            IAsyncCollector<Order> collector,
        ILogger log)
    {
        var order = JsonSerializer.Deserialize<Order>(orderJson);
        await collector.AddAsync(order);
        log.LogInformation("Stored order {Id}", order!.Id);
    }
}
```

**Triggers:** HTTP, Timer, Blob, Queue, Service Bus, Event Grid, Cosmos DB change feed.

## What is Azure Batch?

**Azure Batch** runs large-scale parallel and HPC workloads — renders, simulations, ETL.

```text
Job → Pool of compute nodes → Tasks run in parallel
Auto-scales nodes based on queue depth
```

Use when you need **thousands of parallel tasks** — not for web serving.

## How do you choose VM size and series?

| Series | Purpose |
|--------|---------|
| **D/Ds/Dsv** | General purpose (balanced CPU/memory) |
| **E/Esv** | Memory optimized |
| **F/Fsv** | Compute optimized |
| **B/Bsv** | Burstable (dev/test, low average CPU) |
| **N** | GPU (ML, rendering) |
| **L/M** | Storage/memory intensive |

```bash
az vm list-skus --location eastus --size Standard_D --output table
```

**Tips:** Start with **D2s_v5** for general workloads. Use **Azure Advisor** for right-sizing recommendations. **B-series** for dev; never for sustained production load without monitoring CPU credits.

## What resources are created automatically when you deploy a VM?

Typical VM deployment creates:

```text
Resource Group
  ├── Virtual Machine
  ├── OS Disk (managed)
  ├── Network Interface (NIC)
  ├── Virtual Network (if new)
  ├── Subnet (if new)
  ├── Public IP (if enabled)
  ├── NSG (if default rules applied)
  └── (Optional) Availability Set / Zone assignment
```

Use **Azure Pricing Calculator** — a D2s_v3 VM also bills for disk, IP, and bandwidth separately.

## How does Azure compute integrate with load balancers?

| Compute | Load balancer integration |
|---------|--------------------------|
| **VM / VMSS** | Azure Load Balancer or Application Gateway backend pool |
| **App Service** | Built-in load balancing across plan instances |
| **AKS** | Kubernetes Service (LoadBalancer/ClusterIP) + AGIC |
| **ACI** | External LB required for multi-instance |
| **Functions** | Built-in for HTTP triggers on Premium/Consumption |

```text
Internet → Application Gateway (L7) → VMSS / App Service / AKS
Internet → Load Balancer (L4)       → VM / VMSS
```

See **Azure Application Gateway and Load Balancer.md** for details.

## Related Topics

- **Azure Basics.md** — IaaS/PaaS, SLAs, availability sets
- **Azure Networking.md** — VNet, NSG, Bastion
- **Azure Application Gateway and Load Balancer.md** — traffic distribution
- **Azure Commands and CLI.md** — VM and App Service CLI
