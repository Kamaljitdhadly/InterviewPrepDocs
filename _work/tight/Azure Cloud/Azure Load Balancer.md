# Azure Load Balancer

ACI and App Service handle traffic differently. APIM routes to a load balancer/orchestrator—not directly to container instances.
## 1. Azure Container Instances (ACI)

- **No Built-In Load Balancer for ACI**:

  - ACI runs single containers or container groups—no automatic LB across instances.

  - Scale-out requires **Azure Load Balancer** or **Azure Traffic Manager** (global).

- **Manual Configuration**:

  - Create multiple ACI instances; route traffic externally.

  - Use **AKS** for built-in scaling and load balancing instead.
## 2. Azure App Service

- **Built-In Load Balancer**:

  - Platform includes managed LB; scale-out distributes HTTP/S across instances automatically.

- **Automatic Traffic Distribution**:

  - Increase instance count—Azure balances requests with no manual LB setup.
## 1. Understanding the Role of Azure Container Instances (ACI) and APIM

- **Azure Container Instances (ACI)**: Serverless containers; scaling creates multiple instances.

- **Azure API Management (APIM)**: API management/security—does not route to individual container instances.
## 2. Load Balancing with Azure Load Balancer

- **Azure Load Balancer**: Sits in front of ACI; distributes by round-robin, hash, etc.

- **How It Works**:

  - APIM → Load Balancer → selected ACI instance → response back through LB and APIM.
## 3. Scenario with Kubernetes (AKS)

- **Azure Kubernetes Service (AKS)**: Kubernetes Service (LoadBalancer/ClusterIP) balances among pods.

- **Service Discovery**:

  - APIM targets Kubernetes Service endpoint; K8s routes to pods.

  - **HPA** scales pods on demand.
## 4. Direct Integration with ACI and APIM

- Without external LB, use **Azure Traffic Manager** for regional/instance distribution.

- APIM can list multiple ACI backend URLs with weighted/round-robin routing—manual and less dynamic than a dedicated LB.
## 5. Scaling and Instance Awareness

- **Instance Scaling**: New ACI instances register behind the Load Balancer; APIM keeps calling the LB endpoint.

- **No Direct Awareness in APIM**: APIM only needs LB or Kubernetes Service endpoint—not per-instance knowledge.
## 6. Monitoring and Telemetry

- **Azure Monitor and Application Insights**: Visibility into APIM, ACI, and AKS traffic, performance, and utilization for scaling decisions.

**Summary**: **APIM** → LB or K8s service (not individual instances). **Azure Load Balancer** distributes across ACI. **AKS** uses internal K8s services. **Scaling** is Azure autoscaling—not APIM.
