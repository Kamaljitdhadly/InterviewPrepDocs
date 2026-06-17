# Compute: VMs, App Service, Functions, AKS, Container Apps

## Concept Explanation

Azure offers a spectrum of compute options, from most control (and ops burden) to most managed (serverless):

| Service | What it is | Best for |
|---|---|---|
| **Virtual Machines (VMs)** | IaaS — full OS control | lift-and-shift, custom software, full control |
| **App Service** | PaaS — managed web app hosting | web apps/APIs without managing servers |
| **Azure Functions** | Serverless — event-driven functions | short event-driven tasks, pay-per-execution |
| **Container Apps (ACA)** | Serverless containers (on K8s/KEDA) | microservices/containers without managing K8s |
| **AKS** | Managed Kubernetes | full K8s control at scale |

This maps to **IaaS → PaaS → Serverless**: as you move right, Azure manages more (OS, scaling, patching) and you focus more on code.

## Code Example(s)

```bash
# App Service: deploy a web app
az appservice plan create -g rg-shop -n plan-shop --sku P1V3 --is-linux
az webapp create -g rg-shop -p plan-shop -n shop-api --runtime "DOTNETCORE:8.0"

# Azure Functions (consumption / serverless)
az functionapp create -g rg-shop -n shop-fn \
  --consumption-plan-location eastus --runtime dotnet-isolated \
  --functions-version 4 --storage-account shopstorage

# AKS (managed Kubernetes)
az aks create -g rg-shop -n shop-aks --node-count 3 --enable-managed-identity
az aks get-credentials -g rg-shop -n shop-aks   # configure kubectl
```

```csharp
// An HTTP-triggered Azure Function (isolated worker)
[Function("GetProduct")]
public HttpResponseData Run(
    [HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
{
    var res = req.CreateResponse(HttpStatusCode.OK);
    res.WriteString("Hello from Functions");
    return res;
}
```

## Interview Q&A

**🟢 What's the difference between IaaS, PaaS, and serverless?**
IaaS (VMs) gives you the OS and full control but you manage patching/scaling. PaaS (App Service) manages the platform; you deploy code. Serverless (Functions) runs code on demand with automatic scaling and pay-per-use, no server management.

**🟢 When would you use Azure Functions vs App Service?**
Functions for short, event-driven, bursty workloads billed per execution (queue triggers, timers, webhooks). App Service for always-on web apps/APIs needing a persistent host, custom domains, and predictable performance.

**🟡 What's the difference between AKS and Azure Container Apps?**
AKS is full managed Kubernetes — maximum control and ecosystem, but you manage manifests/operations. Container Apps is a serverless container platform (built on K8s + KEDA) that abstracts away cluster management — simpler for microservices that don't need full K8s.

**🟡 What are App Service deployment slots?**
Separate environments (e.g. `staging`) within an App Service for zero-downtime deployments — deploy to staging, warm it up, then **swap** with production. Enables blue-green deployments and instant rollback.

**🔴 What is a Functions cold start and how do you mitigate it?**
On the Consumption plan, idle functions are de-allocated; the next request pays a "cold start" latency to spin up. Mitigate with the **Premium plan** (pre-warmed instances), **always-ready instances**, or keeping functions warm — at higher cost.

## ⚠️ Tricky / Gotchas

- **Consumption-plan cold starts** add latency after idle periods — a frequent gotcha for latency-sensitive APIs on Functions.
- **App Service "Always On"** must be enabled or the app unloads when idle (and timer/background work stops on Consumption-style setups).
- **AKS control plane vs nodes:** the control plane is managed/free-ish, but you pay for and manage the **node VMs** — and node patching/upgrades are still partly your responsibility.
- **Choosing VMs by default** is an anti-pattern — interviewers want you to pick the *most managed* option that meets requirements (cost + ops savings).
- **Scaling limits differ**: Functions scale out massively but each execution has a timeout (default 5 min, max higher on Premium); long jobs need Durable Functions or other compute.

## 📌 Quick Recap

- Spectrum: VMs (IaaS) → App Service (PaaS) → Functions/Container Apps (serverless) → AKS (managed K8s).
- Functions = event-driven, pay-per-exec; App Service = persistent web hosting; ACA = serverless containers; AKS = full K8s.
- Prefer the most managed option that meets requirements (less ops, lower cost).
- Deployment slots = blue-green/zero-downtime swaps.
- Watch cold starts (Functions consumption) and "Always On" (App Service).
- AKS: control plane managed, you own/pay for node VMs.
