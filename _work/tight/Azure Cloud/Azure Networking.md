# Azure Networking

1) **Region** = datacenter location; **Zone** = single datacenter; multiple zones in a region = **availability zones**

2) **Subscription ↔ Account** (many-to-many):

| Subscription | Account |
|----|----|
| Logical container for provisioned resources | Identity with access to resources |
| Many accounts | Many subscriptions |

3) **Hierarchy:** Account → Management Groups → **Subscription** → **Resource Group** (dev/test/prod) → VNet/Subnet → Resources. First resource created is typically a **resource group**.

4) **Cloud Shell** — browser CLI for Azure; also install **Azure CLI** / **PowerShell** locally

5) Not all services in every region; pricing varies by region

6) Need resilience to datacenter failure → choose region with **availability zones**

7) **SLA** — uptime %; varies by tier/pricing

8) **Cost Management + Billing** — budgets, threshold notifications

9) **Azure Account** & **Azure App Service** VS Code extensions

10) <img src="_work/md/Azure Cloud/media/media/image1.png" style="width:8.93569in;height:4.29284in" />

11) **Serverless** — fully managed; no VM/CPU/RAM sizing (still runs on servers behind the scenes)

12) **Managed Service** — Azure manages infra (e.g., **App Service** — you deploy code only)

13) **Unmanaged** — **VM** — you manage OS, patches, frameworks

14) **Compute:** VM, App Services, AKS, Azure Functions (serverless)

15) Remote access: Windows → RDP; Linux → **PuTTY** (SSH). `sudo` = admin; `apt install git`

16) **VM security:** Never expose VM directly to internet — brute force on RDP **3389** / SSH **22**; no defense in front

17) **App Services** — managed web hosting; publish code, no underlying access

18) **AKS** — managed Kubernetes for containers on Azure

19) **Azure Functions** — event-triggered, auto start/stop/scale

20) **ACR (Azure Container Registry)** — manage container images

<img src="_work/md/Azure Cloud/media/media/image2.png" style="width:9in;height:3.93444in" />

21) Use **Azure Price Calculator** before provisioning

22) VM creation also creates: **VM, Disk, Public IP, Storage**

<img src="_work/md/Azure Cloud/media/media/image3.png" style="width:7.97847in;height:2.58681in" />

23) **Storage account** — used by many resources (e.g., VM disk images); auto-created, not directly accessible

24) <img src="_work/md/Azure Cloud/media/media/image4.png" style="width:9in;height:4.98419in" />

25) <img src="_work/md/Azure Cloud/media/media/image5.png" style="width:7.57699in;height:5.15833in" />

26) <img src="_work/md/Azure Cloud/media/media/image6.png" style="width:8.91319in;height:5.54375in" />

27) **ARM Template** — JSON describing resources to create

28) **VMSS (Virtual Machine Scale Set)** — identical VMs, scale in/out; put **Load Balancer** in front

29) **Virtual Network** — logical private network on Azure infra; resources in VNet communicate by default; scoped to one region

30) **Subnet** — logical group in VNet; protected by **NSG**; resources go in subnets (not directly in VNet); cross-subnet communication allowed

31) Default NSG opens RDP/SSH — **lock down immediately** after VM creation

32) Each VNet has own address range (~65536 addresses default)

33) **CIDR** — notation for IP ranges

34) <img src="_work/md/Azure Cloud/media/media/image7.png" style="width:5.73889in;height:3.92361in" />**'**

35) **Network Peering** — connect two VNets for cross-VNet communication

36) Larger IP range = larger **attack surface**

37) **Bastion** — browser-based VM access; no open inbound ports

38) <img src="_work/md/Azure Cloud/media/media/image8.png" style="width:9.47639in;height:6.38125in" /><img src="_work/md/Azure Cloud/media/media/image9.png" style="width:11.12708in;height:5.80972in" /><img src="_work/md/Azure Cloud/media/media/image10.png" style="width:11.34931in;height:6.27014in" /><img src="_work/md/Azure Cloud/media/media/image11.png" style="width:11.27014in;height:6.34931in" /><img src="_work/md/Azure Cloud/media/media/image12.png" style="width:11.49236in;height:6.4125in" /><img src="_work/md/Azure Cloud/media/media/image13.png" style="width:11.5875in;height:6.50764in" />

39) <img src="_work/md/Azure Cloud/media/media/image14.png" style="width:10.76181in;height:6.11111in" /><img src="_work/md/Azure Cloud/media/media/image15.png" style="width:8.50764in;height:6.50764in" /><img src="_work/md/Azure Cloud/media/media/image16.png" style="width:11.25417in;height:6.17431in" /><img src="_work/md/Azure Cloud/media/media/image8.png" style="width:9.47639in;height:6.38125in" />

40) <img src="_work/md/Azure Cloud/media/media/image17.png" style="width:11.09514in;height:6.42847in" /><img src="_work/md/Azure Cloud/media/media/image18.png" style="width:11.09514in;height:5.76181in" />

41) <img src="_work/md/Azure Cloud/media/media/image19.png" style="width:8.92083in;height:6.4125in" /><img src="_work/md/Azure Cloud/media/media/image20.png" style="width:10.17431in;height:6.20625in" /><img src="_work/md/Azure Cloud/media/media/image21.png" style="width:10.77778in;height:6.38125in" /><img src="_work/md/Azure Cloud/media/media/image22.png" style="width:11.19028in;height:6.47639in" /><img src="_work/md/Azure Cloud/media/media/image23.png" style="width:11.31736in;height:5.38125in" /><img src="_work/md/Azure Cloud/media/media/image24.png" style="width:10.60347in;height:6.28542in" /><img src="_work/md/Azure Cloud/media/media/image25.png" style="width:10.65069in;height:6.15903in" /><img src="_work/md/Azure Cloud/media/media/image26.png" style="width:8.88889in;height:5.98403in" /><img src="_work/md/Azure Cloud/media/media/image27.png" style="width:11.33333in;height:6.49236in" />

42) **Service Endpoint** — route from VNet to managed service<img src="_work/md/Azure Cloud/media/media/image28.png" style="width:9in;height:4.95783in" /><img src="_work/md/Azure Cloud/media/media/image29.png" style="width:9in;height:5.41815in" /><img src="_work/md/Azure Cloud/media/media/image30.png" style="width:9in;height:5.08886in" />

43) <img src="_work/md/Azure Cloud/media/media/image31.png" style="width:5.98889in;height:6.09792in" /><img src="_work/md/Azure Cloud/media/media/image32.png" style="width:8.50625in;height:6.14444in" /><img src="_work/md/Azure Cloud/media/media/image33.png" style="width:9in;height:5.78416in" />

<img src="_work/md/Azure Cloud/media/media/image34.png" style="width:9in;height:5.13613in" />

<img src="_work/md/Azure Cloud/media/media/image35.png" style="width:9in;height:6.36213in" />

<img src="_work/md/Azure Cloud/media/media/image36.png" style="width:5.75903in;height:6.34931in" /><img src="_work/md/Azure Cloud/media/media/image37.png" style="width:7.91597in;height:6.01181in" /><img src="_work/md/Azure Cloud/media/media/image38.png" style="width:9in;height:4.91144in" /><img src="_work/md/Azure Cloud/media/media/image39.png" style="width:11.07917in;height:5.65069in" /><img src="_work/md/Azure Cloud/media/media/image40.png" style="width:11.19028in;height:6.28542in" />

<img src="_work/md/Azure Cloud/media/media/image41.png" style="width:10.23819in;height:5.11111in" />

<img src="_work/md/Azure Cloud/media/media/image42.png" style="width:11.09514in;height:6.19028in" /><img src="_work/md/Azure Cloud/media/media/image43.png" style="width:10.92083in;height:6.33333in" />

44) **Load Balancer** — distributes traffic, health checks; works with VM & scale sets

45) **Application Gateway** — Layer 7 load balancer; external web endpoint; works with VM, scale sets, App Services, Kubernetes. Features: **WAF**, OWASP rule set

46) <img src="_work/md/Azure Cloud/media/media/image44.png" style="width:11.07917in;height:6.17431in" /><img src="_work/md/Azure Cloud/media/media/image45.png" style="width:11.17431in;height:5.60347in" /><img src="_work/md/Azure Cloud/media/media/image46.png" style="width:8.14306in;height:4.17431in" /><img src="_work/md/Azure Cloud/media/media/image47.png" style="width:10.5875in;height:5.84097in" />

47) <img src="_work/md/Azure Cloud/media/media/image48.png" style="width:11.07917in;height:6.23819in" /><img src="_work/md/Azure Cloud/media/media/image49.png" style="width:11.12708in;height:5.07917in" /><img src="_work/md/Azure Cloud/media/media/image50.png" style="width:11.55556in;height:6.39653in" /><img src="_work/md/Azure Cloud/media/media/image51.png" style="width:11.55556in;height:6.42847in" />

48) <img src="_work/md/Azure Cloud/media/media/image52.png" style="width:6.44656in;height:3.97584in" />

<img src="_work/md/Azure Cloud/media/media/image53.png" style="width:11.15903in;height:6.38125in" /><img src="_work/md/Azure Cloud/media/media/image54.png" style="width:9.11111in;height:6.17431in" /><img src="_work/md/Azure Cloud/media/media/image55.png" style="width:10.30139in;height:6.14306in" />

<img src="_work/md/Azure Cloud/media/media/image56.png" style="width:10.09514in;height:6.07917in" />

<img src="_work/md/Azure Cloud/media/media/image57.png" style="width:10.07917in;height:6.28542in" /><img src="_work/md/Azure Cloud/media/media/image58.png" style="width:11.34931in;height:6.06319in" /><img src="_work/md/Azure Cloud/media/media/image59.png" style="width:10.34931in;height:6.28542in" />

<img src="_work/md/Azure Cloud/media/media/image60.png" style="width:10.63472in;height:6.38125in" />

<img src="_work/md/Azure Cloud/media/media/image61.png" style="width:9.80972in;height:6.23819in" />
