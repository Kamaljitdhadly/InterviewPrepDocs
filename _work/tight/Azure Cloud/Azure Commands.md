# Azure Commands

Commonly used **Azure CLI** (`az`) commands for resource management.

### General Commands

1.  **Login and Account Management**

```bash
az login # Log in to Azure
az account list # List all Azure subscriptions
az account set --subscription <id> # Set the default subscription
az account show # Show details of the current subscription
```

2.  **Help and Documentation**

```bash
az --help # Display the list of available commands
az <command> --help # Display help for a specific command
```

### Resource Management

1.  **Resource Groups**

```bash
az group create --name <name> --location <location> # Create a resource group
az group delete --name <name> --yes --no-wait # Delete a resource group
az group list # List resource groups
az group show --name <name> # Show details of a resource group
```

2.  **Resources**

```bash
az resource list # List all resources
az resource show --ids <resource-id> # Show details of a specific resource
az resource delete --ids <resource-id> # Delete a specific resource
```

### Virtual Machines

1.  **VM Management**

```bash
az vm create --resource-group <group> --name <name> --image <image> # Create a VM
az vm delete --resource-group <group> --name <name> --yes --no-wait # Delete a VM
az vm start --resource-group <group> --name <name> # Start a VM
az vm stop --resource-group <group> --name <name> # Stop a VM
az vm restart --resource-group <group> --name <name> # Restart a VM
az vm show --resource-group <group> --name <name> # Show details of a VM
```

2.  **VM Disks**

```bash
az disk create --resource-group <group> --name <disk-name> --size-gb <size> # Create a disk
az disk delete --resource-group <group> --name <disk-name> --yes --no-wait # Delete a disk
az disk show --resource-group <group> --name <disk-name> # Show details of a disk
```

### Networking

1.  **Virtual Networks**

```bash
az network vnet create --resource-group <group> --name <vnet-name> --address-prefix <prefix> # Create a VNet
az network vnet delete --resource-group <group> --name <vnet-name> # Delete a VNet
az network vnet show --resource-group <group> --name <vnet-name> # Show details of a VNet
```

2.  **Subnets**

```bash
az network vnet subnet create --resource-group <group> --vnet-name <vnet-name> --name <subnet-name> --address-prefix <prefix> # Create a subnet
az network vnet subnet delete --resource-group <group> --vnet-name <vnet-name> --name <subnet-name> # Delete a subnet
az network vnet subnet show --resource-group <group> --vnet-name <vnet-name> --name <subnet-name> # Show details of a subnet
```

3.  **Public IPs**

```bash
az network public-ip create --resource-group <group> --name <ip-name> # Create a public IP
az network public-ip delete --resource-group <group> --name <ip-name> # Delete a public IP
az network public-ip show --resource-group <group> --name <ip-name> # Show details of a public IP
```

### Storage

1.  **Storage Accounts**

```bash
az storage account create --resource-group <group> --name <account-name> --location <location> --sku <sku> # Create a storage account
az storage account delete --resource-group <group> --name <account-name> --yes --no-wait # Delete a storage account
az storage account show --resource-group <group> --name <account-name> # Show details of a storage account
```

2.  **Blobs**

```bash
az storage blob upload --container-name <container> --name <blob-name> --file <file-path> --account-name <account-name> # Upload a blob
az storage blob delete --container-name <container> --name <blob-name> --account-name <account-name> # Delete a blob
az storage blob list --container-name <container> --account-name <account-name> # List blobs in a container
```

### Databases

1.  **Azure SQL Database**

```bash
az sql server create --resource-group <group> --name <server-name> --location <location> --admin-user <username> --admin-password <password> # Create SQL server
az sql server delete --resource-group <group> --name <server-name> --yes --no-wait # Delete SQL server
az sql server show --resource-group <group> --name <server-name> # Show details of a SQL server
```

2.  **Cosmos DB**

```bash
az cosmosdb create --resource-group <group> --name <cosmosdb-name> --locations regionName=<location> failoverPriority=0 isZoneRedundant=False # Create Cosmos DB account
az cosmosdb delete --resource-group <group> --name <cosmosdb-name> --yes --no-wait # Delete Cosmos DB account
az cosmosdb show --resource-group <group> --name <cosmosdb-name> # Show details of a Cosmos DB account
```

### App Services

1.  **App Service Plan**

```bash
az appservice plan create --resource-group <group> --name <plan-name> --sku <sku> # Create an app service plan
az appservice plan delete --resource-group <group> --name <plan-name> --yes --no-wait # Delete an app service plan
az appservice plan show --resource-group <group> --name <plan-name> # Show details of an app service plan
```

2.  **Web Apps**

```bash
az webapp create --resource-group <group> --plan <plan-name> --name <app-name> # Create a web app
az webapp delete --resource-group <group> --name <app-name> --yes --no-wait # Delete a web app
az webapp show --resource-group <group> --name <app-name> # Show details of a web app
```

### Azure Kubernetes Service (AKS)

1.  **AKS Cluster**

```bash
az aks create --resource-group <group> --name <cluster-name> --node-count <count> --enable-addons monitoring --generate-ssh-keys # Create an AKS cluster
az aks delete --resource-group <group> --name <cluster-name> --yes --no-wait # Delete an AKS cluster
az aks show --resource-group <group> --name <cluster-name> # Show details of an AKS cluster
```

2.  **Get AKS Credentials**

```bash
az aks get-credentials --resource-group <group> --name <cluster-name> # Get credentials for the AKS cluster
```

### Azure Resource Manager (ARM) Templates

1.  **Deploy ARM Template**

```bash
az deployment group create --resource-group <group> --template-file <template-file> --parameters <parameters-file> # Deploy an ARM template
```

2.  **List Deployments**

```bash
az deployment group list --resource-group <group> # List deployments in a resource group
```

**Categories:** General (auth) · Resource Groups · VMs · Networking · Storage · Databases · App Services · AKS · ARM Templates

More: `az <command> --help` or [Azure CLI documentation](https://docs.microsoft.com/en-us/cli/azure/).
