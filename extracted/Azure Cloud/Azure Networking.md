1)  Each Datacenter location is called region

2)  Each datacenter is called Zone

3)  When there are more datacenters in a region, then the region is said to be **availability zones**

4)  **Subscription =\> many to many =\> Account**

| Logical Container for resources you **provision(create)** in the cloud | Identity a user who have access to resources |
|----|----|
| Can be attached to lots of accounts | can be attached to lots of subscription |

5)  First Resource is going to be resource group

6)  Account

Region

Management Groups (used to manage subscription)

subscription (Logical Container for resources)

Resource Group (Container for particular resources group together example **dev / test / production** and a subscription can have more than one resource group)

Vnet and subnet

Resources

7)  Azure cloud shell providers UI similar to command line and allows to run commands againts azure cloud and we can also download azure cli and powershell to our pc as well

8)  Some of the services are not available in all of the regions and pricing can be different in different regions

9)  If we have a requirement where if one datacenter failure then region should still be available then we should go with region which has avaialblity zones

10) SLA (Service level Agreement) is the uptime % of a cloud service and can be different based on what tier and pricing are used for service

11) Cost management Plus Billing service available in azure to create budget and configure notification when getting close to budget

12) **Azure Account, Azure app service** extenion in vs code

13) <img src="extracted\Azure Cloud\media/media/image1.png" style="width:8.93569in;height:4.29284in" />

14) **Serverless =\> a resource that is completed/fully managed by cloud and users do not need to think about instance size(VM, CPU, Ram). Even when we talk about serverless it still runs on server, but user is not resposible to set instance size when creating resources**

15) **Managed Service** =\> Cloud provider is responsible to manage service example app service is managed service, app service underlying machine and running software is managed by azure and user just need to take care of deploying code to app service

16) **Unmanaged services** =\> VM is unmanaged service because user is responsible to manage what’s happening inside the virtual machine example updating security patches and framework

17) Compute Services =\> **VM, App Services, AKS, Azure Functions(Serverless)**

18) Connecting to window machine we use remote desktop app and to connect to Linux(ubuntu) VM we use Putty tool which uses SSH protocol\
    Linux commands – sudo(run as administrative) apt install git

19) **VM =\> Never leave a VM directly accessible from internet, hacker can do brute force attacks on rdp port 3389. No line of defence in front of VM web server. Linux SSH port - 22**

20) **App services** =\> a fully managed web hosting for websites, publish you code and it just runs, no access to underlying resources

21) **AKS(Azure Kubernetes Services) =\>** managed services on azure, allow to deploy containers on Azure and manage using kubernetes tool which is most popular container management tool

22) **Azure Functions =\>** small function runs as result of event, automatically start, stop, autoscale

23) **ACR(Azure Container Registry) =\>** used to manage images

<img src="extracted\Azure Cloud\media/media/image2.png" style="width:9in;height:3.93444in" />

24) Azure price calculator use it before creating resources

25) When creating VM multiple resources created example **VM , Disk, Public IP, storage**

<img src="extracted\Azure Cloud\media/media/image3.png" style="width:7.97847in;height:2.58681in" />

26) **Storage account =\>** Its used in many resource type example Image of the virtual machine is stored in storage account and we do not have access to this storage account and it happens automatically behind the scene

27) <img src="extracted\Azure Cloud\media/media/image4.png" style="width:9in;height:4.98419in" />

28) <img src="extracted\Azure Cloud\media/media/image5.png" style="width:7.57699in;height:5.15833in" />

29) <img src="extracted\Azure Cloud\media/media/image6.png" style="width:8.91319in;height:5.54375in" />

30) **ARM(Azure Resource manager)** **Template =\>** a json file describing the resources to be created

31) **VMSS(Virtual machine scale set) =\>** a group of seperate virtual machine sharing same image, can be scaled out and in and load balancer should be placed in front of scale set

32) **Virtual Network –** when we create a virtual network we do not really create physical netwrk, we are using existing network resources that are part of azure and inside azure network we create logically separated network. Resources in Vnet can communicate with each other by default. Think of it as organization private network. Scoped to single region.

33) **Subnet –** Logical group of resources in Vnet and Subnet is protected with **NSG(Network Security Group).** Resources must be placed in subnet, it cannot be placed directly in Vnet. Resources in subnet can talk with resources in other subnets in same Vnet

34) By Default NSG is open for window(RDP) or Linux(SSH), must be first thing to handle after VM creation

35) Each Vnet has its own address range or IP Range, By Default 65536 address

36) **CIDR(classless Inter-domain Routing) –** a method for representing an IP range

37) <img src="extracted\Azure Cloud\media/media/image7.png" style="width:5.73889in;height:3.92361in" />**’**

38) **Network Peering –** so resources in two separate Vnet can talk with each other

39) Larger the attack surface(IP range) **-** the greater the risk

40) **Bastion** – a web based connection to VM, no open port is required.

41) <img src="extracted\Azure Cloud\media/media/image8.png" style="width:9.47639in;height:6.38125in" /><img src="extracted\Azure Cloud\media/media/image9.png" style="width:11.12708in;height:5.80972in" /><img src="extracted\Azure Cloud\media/media/image10.png" style="width:11.34931in;height:6.27014in" /><img src="extracted\Azure Cloud\media/media/image11.png" style="width:11.27014in;height:6.34931in" /><img src="extracted\Azure Cloud\media/media/image12.png" style="width:11.49236in;height:6.4125in" /><img src="extracted\Azure Cloud\media/media/image13.png" style="width:11.5875in;height:6.50764in" />

42) <img src="extracted\Azure Cloud\media/media/image14.png" style="width:10.76181in;height:6.11111in" /><img src="extracted\Azure Cloud\media/media/image15.png" style="width:8.50764in;height:6.50764in" /><img src="extracted\Azure Cloud\media/media/image16.png" style="width:11.25417in;height:6.17431in" /><img src="extracted\Azure Cloud\media/media/image8.png" style="width:9.47639in;height:6.38125in" />

43) <img src="extracted\Azure Cloud\media/media/image17.png" style="width:11.09514in;height:6.42847in" /><img src="extracted\Azure Cloud\media/media/image18.png" style="width:11.09514in;height:5.76181in" />

44) <img src="extracted\Azure Cloud\media/media/image19.png" style="width:8.92083in;height:6.4125in" /><img src="extracted\Azure Cloud\media/media/image20.png" style="width:10.17431in;height:6.20625in" /><img src="extracted\Azure Cloud\media/media/image21.png" style="width:10.77778in;height:6.38125in" /><img src="extracted\Azure Cloud\media/media/image22.png" style="width:11.19028in;height:6.47639in" /><img src="extracted\Azure Cloud\media/media/image23.png" style="width:11.31736in;height:5.38125in" /><img src="extracted\Azure Cloud\media/media/image24.png" style="width:10.60347in;height:6.28542in" /><img src="extracted\Azure Cloud\media/media/image25.png" style="width:10.65069in;height:6.15903in" /><img src="extracted\Azure Cloud\media/media/image26.png" style="width:8.88889in;height:5.98403in" /><img src="extracted\Azure Cloud\media/media/image27.png" style="width:11.33333in;height:6.49236in" />

45) **Service Endpoint** – Create a route from Vnet to the managed service<img src="extracted\Azure Cloud\media/media/image28.png" style="width:9in;height:4.95783in" /><img src="extracted\Azure Cloud\media/media/image29.png" style="width:9in;height:5.41815in" /><img src="extracted\Azure Cloud\media/media/image30.png" style="width:9in;height:5.08886in" />

46) <img src="extracted\Azure Cloud\media/media/image31.png" style="width:5.98889in;height:6.09792in" /><img src="extracted\Azure Cloud\media/media/image32.png" style="width:8.50625in;height:6.14444in" /><img src="extracted\Azure Cloud\media/media/image33.png" style="width:9in;height:5.78416in" />

<img src="extracted\Azure Cloud\media/media/image34.png" style="width:9in;height:5.13613in" />

<img src="extracted\Azure Cloud\media/media/image35.png" style="width:9in;height:6.36213in" />

<img src="extracted\Azure Cloud\media/media/image36.png" style="width:5.75903in;height:6.34931in" /><img src="extracted\Azure Cloud\media/media/image37.png" style="width:7.91597in;height:6.01181in" /><img src="extracted\Azure Cloud\media/media/image38.png" style="width:9in;height:4.91144in" /><img src="extracted\Azure Cloud\media/media/image39.png" style="width:11.07917in;height:5.65069in" /><img src="extracted\Azure Cloud\media/media/image40.png" style="width:11.19028in;height:6.28542in" />

<img src="extracted\Azure Cloud\media/media/image41.png" style="width:10.23819in;height:5.11111in" />

<img src="extracted\Azure Cloud\media/media/image42.png" style="width:11.09514in;height:6.19028in" /><img src="extracted\Azure Cloud\media/media/image43.png" style="width:10.92083in;height:6.33333in" />

47) **Load Balancer –** Azure service that distributes load and check health of VMs and it works with VM and scale set

48) **Application Gateway –** we traffic load balancer, can functionb as external endpoint of the web app and it works with VM, scale sets, App services, Kubernetes\
    Features – web application firewall, protection rules based on OWASP rule set

49) <img src="extracted\Azure Cloud\media/media/image44.png" style="width:11.07917in;height:6.17431in" /><img src="extracted\Azure Cloud\media/media/image45.png" style="width:11.17431in;height:5.60347in" /><img src="extracted\Azure Cloud\media/media/image46.png" style="width:8.14306in;height:4.17431in" /><img src="extracted\Azure Cloud\media/media/image47.png" style="width:10.5875in;height:5.84097in" />

50) <img src="extracted\Azure Cloud\media/media/image48.png" style="width:11.07917in;height:6.23819in" /><img src="extracted\Azure Cloud\media/media/image49.png" style="width:11.12708in;height:5.07917in" /><img src="extracted\Azure Cloud\media/media/image50.png" style="width:11.55556in;height:6.39653in" /><img src="extracted\Azure Cloud\media/media/image51.png" style="width:11.55556in;height:6.42847in" />

51) <img src="extracted\Azure Cloud\media/media/image52.png" style="width:6.44656in;height:3.97584in" />

<img src="extracted\Azure Cloud\media/media/image53.png" style="width:11.15903in;height:6.38125in" /><img src="extracted\Azure Cloud\media/media/image54.png" style="width:9.11111in;height:6.17431in" /><img src="extracted\Azure Cloud\media/media/image55.png" style="width:10.30139in;height:6.14306in" />

<img src="extracted\Azure Cloud\media/media/image56.png" style="width:10.09514in;height:6.07917in" />

<img src="extracted\Azure Cloud\media/media/image57.png" style="width:10.07917in;height:6.28542in" /><img src="extracted\Azure Cloud\media/media/image58.png" style="width:11.34931in;height:6.06319in" /><img src="extracted\Azure Cloud\media/media/image59.png" style="width:10.34931in;height:6.28542in" />

<img src="extracted\Azure Cloud\media/media/image60.png" style="width:10.63472in;height:6.38125in" />

<img src="extracted\Azure Cloud\media/media/image61.png" style="width:9.80972in;height:6.23819in" />
