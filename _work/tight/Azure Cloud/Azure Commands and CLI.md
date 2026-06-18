# Azure Commands and CLI

## Questions Covered

1. How do you install and authenticate with Azure CLI?
2. What are essential subscription and resource group commands?
3. How do you create and manage Virtual Machines with `az`?
4. How do you manage App Service with `az`?
5. How do you manage networking resources with `az`?
6. How do you manage storage accounts and blobs with `az`?
7. How do you manage Azure SQL with `az`?
8. How do you deploy ARM/Bicep templates with `az`?
9. What is the difference between Azure CLI and Azure PowerShell?
10. How do you use `az` in CI/CD pipelines?
11. What are useful query and output formatting tips?
12. How do you troubleshoot common `az` errors?

## How do you install and authenticate with Azure CLI?

```bash
# Install (Windows — winget)
winget install Microsoft.AzureCLI

# Login — opens browser
az login

# Login with service principal (CI/CD)
az login --service-principal -u $APP_ID -p $SECRET --tenant $TENANT_ID

# Set default subscription
az account list --output table
az account set --subscription "My Production Subscription"
az account show
```

**Managed identity on Azure VM/Cloud Shell:** `az login --identity`

**Default credential chain (.NET SDK):** same identity sources as CLI when running in Azure.

## What are essential subscription and resource group commands?

```bash
# Resource groups
az group create --name rg-myapp-dev --location eastus
az group list --output table
az group show --name rg-myapp-dev
az group delete --name rg-myapp-dev --yes --no-wait

# Tags
az group update --name rg-myapp-dev --tags Environment=Dev Owner=TeamA

# List all resources in a group
az resource list --resource-group rg-myapp-dev --output table

# Delete a specific resource
az resource delete --ids $(az resource show -g rg-myapp-dev -n mystorage --resource-type Microsoft.Storage/storageAccounts --query id -o tsv)
```

## How do you create and manage Virtual Machines with `az`?

```bash
# Create VM (Linux, SSH key, no public IP)
az vm create \
  --resource-group rg-prod \
  --name vm-web-01 \
  --image Ubuntu2204 \
  --size Standard_D2s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-address "" \
  --vnet-name vnet-prod \
  --subnet subnet-web

# Start / stop / deallocate (stop billing compute)
az vm start --resource-group rg-prod --name vm-web-01
az vm deallocate --resource-group rg-prod --name vm-web-01

# Run command on VM (no SSH needed)
az vm run-command invoke --resource-group rg-prod --name vm-web-01 \
  --command-id RunShellScript --scripts "sudo apt update && sudo apt upgrade -y"

# VMSS
az vmss list --resource-group rg-prod --output table
az vmss scale --resource-group rg-prod --name vmss-web --new-capacity 5
```

## How do you manage App Service with `az`?

```bash
# App Service Plan + Web App
az appservice plan create --name plan-prod --resource-group rg-prod --sku P1v3 --is-linux
az webapp create --name myapi-prod --resource-group rg-prod --plan plan-prod --runtime "DOTNET:8"

# Deploy ZIP
az webapp deploy --resource-group rg-prod --name myapi-prod --src-path ./publish.zip

# Config / app settings
az webapp config appsettings set --resource-group rg-prod --name myapi-prod \
  --settings ASPNETCORE_ENVIRONMENT=Production ApiKey=@Microsoft.KeyVault(...)

# Deployment slots
az webapp deployment slot create --name myapi-prod --resource-group rg-prod --slot staging
az webapp deployment slot swap --name myapi-prod --resource-group rg-prod --slot staging

# Logs
az webapp log tail --resource-group rg-prod --name myapi-prod

# Functions on same plan
az functionapp create --name myfunc-prod --resource-group rg-prod --plan plan-prod \
  --runtime dotnet-isolated --functions-version 4 --storage-account mystorage
```

## How do you manage networking resources with `az`?

```bash
# VNet + subnet
az network vnet create -g rg-prod -n vnet-prod --address-prefix 10.0.0.0/16 \
  --subnet-name subnet-web --subnet-prefix 10.0.1.0/24

# NSG rule
az network nsg rule create -g rg-prod --nsg-name nsg-web -n AllowHTTPS \
  --priority 100 --source-address-prefixes Internet --destination-port-ranges 443 \
  --access Allow --protocol Tcp

# Public IP
az network public-ip create -g rg-prod -n pip-web --sku Standard --allocation-method Static

# Load Balancer (simplified)
az network lb create -g rg-prod -n lb-web --sku Standard --public-ip-address pip-web

# Private DNS zone
az network private-dns zone create -g rg-prod -n internal.contoso.com

# VNet peering
az network vnet peering create -g rg-prod -n peer-app-to-hub --vnet-name vnet-app \
  --remote-vnet vnet-hub --allow-vnet-access
```

## How do you manage storage accounts and blobs with `az`?

```bash
# Storage account
az storage account create -g rg-prod -n myappprodstore --sku Standard_GRS --kind StorageV2

# Get connection string (prefer managed identity in apps)
az storage account show-connection-string -g rg-prod -n myappprodstore

# Blob operations (auth with login — no key needed)
az storage container create --account-name myappprodstore --name uploads --auth-mode login
az storage blob upload --account-name myappprodstore --container-name uploads \
  --name report.pdf --file ./report.pdf --auth-mode login

# List blobs
az storage blob list --account-name myappprodstore --container-name uploads \
  --auth-mode login --output table

# SAS token (time-limited access)
az storage blob generate-sas --account-name myappprodstore --container-name uploads \
  --name report.pdf --permissions r --expiry 2025-12-31T23:59Z --https-only
```

## How do you manage Azure SQL with `az`?

```bash
# SQL Server + Database
az sql server create -g rg-prod -n myserver-prod -l eastus \
  --admin-user sqladmin --admin-password 'ComplexP@ss1!'

az sql db create -g rg-prod -s myserver-prod -n appdb --service-objective S1

# Firewall rule (dev only — use private endpoint in prod)
az sql server firewall-rule create -g rg-prod -s myserver-prod -n AllowAzure \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# Connection string
az sql db show-connection-string -g rg-prod -s myserver-prod -n appdb -c ado.net

# Export BACPAC
az sql db export -g rg-prod -s myserver-prod -n appdb \
  --admin-user sqladmin --admin-password 'ComplexP@ss1!' \
  --storage-key-type StorageAccessKey --storage-key $KEY \
  --storage-uri https://mystorage.blob.core.windows.net/backups/appdb.bacpac
```

## How do you deploy ARM/Bicep templates with `az`?

```bash
# Validate Bicep
az bicep build --file main.bicep

# What-if (preview changes)
az deployment group what-if --resource-group rg-prod --template-file main.bicep \
  --parameters environment=prod appName=myapi

# Deploy
az deployment group create --resource-group rg-prod --template-file main.bicep \
  --parameters environment=prod appName=myapi \
  --name deploy-20250317-001

# Show deployment status
az deployment group show -g rg-prod -n deploy-20250317-001
az deployment operation group list -g rg-prod -n deploy-20250317-001 -o table
```

```bash
# Key Vault reference in parameters file
{
  "sqlAdminPassword": { "reference": { "keyVault": { "id": "/subscriptions/.../vaults/kv-prod" }, "secretName": "sql-admin-password" } }
}
```

## What is the difference between Azure CLI and Azure PowerShell?

| Aspect | Azure CLI (`az`) | Azure PowerShell (`Az`) |
|--------|------------------|-------------------------|
| **Shell** | Bash, zsh, PowerShell, CMD | PowerShell only |
| **Syntax** | `az vm create ...` | `New-AzVM ...` |
| **Cross-platform** | Yes | PowerShell Core on Linux/Mac |
| **CI/CD** | Very common in GitHub Actions | Common in Azure DevOps (Windows) |
| **Parity** | Near-complete | Near-complete |

```powershell
# PowerShell equivalent
Connect-AzAccount
New-AzResourceGroup -Name rg-prod -Location eastus
Get-AzVM -ResourceGroupName rg-prod | Format-Table Name, Status
```

**Recommendation:** Learn **`az`** for portability; use **`Az`** if team is PowerShell-centric.

## How do you use `az` in CI/CD pipelines?

```yaml
# GitHub Actions — OIDC (no client secret)
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: Deploy Bicep
  run: az deployment group create -g rg-prod -f infra/main.bicep --parameters appName=myapi

- name: Deploy Web App
  run: az webapp deploy -g rg-prod -n myapi-prod --src-path ./publish.zip
```

```yaml
# Azure DevOps — AzureCLI task
- task: AzureCLI@2
  inputs:
    azureSubscription: 'MyServiceConnection'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az webapp deploy -g rg-prod -n myapi-prod --src-path $(Build.ArtifactStagingDirectory)/app.zip
```

## What are useful query and output formatting tips?

```bash
# JMESPath query
az vm list -g rg-prod --query "[].{Name:name, Size:hardwareProfile.vmSize, State:powerState}" -o table

# TSV for scripting
VM_ID=$(az vm show -g rg-prod -n vm-web-01 --query id -o tsv)

# JSON output piped to jq
az resource list -g rg-prod -o json | jq '.[] | select(.type | contains("Microsoft.Web"))'

# Output formats: json (default), table, yaml, tsv, jsonc
az group list -o table
```

```bash
# Extension commands
az extension add --name application-insights
az extension list --output table
```

## How do you troubleshoot common `az` errors?

| Error | Cause | Fix |
|-------|-------|-----|
| **AuthorizationFailed** | Missing RBAC role | `az role assignment create ...` |
| **SubscriptionNotFound** | Wrong sub context | `az account set --subscription ...` |
| **ResourceGroupNotFound** | Typo or wrong region | Verify with `az group list` |
| **SkuNotAvailable** | SKU not in region | `az vm list-skus -l eastus` |
| **Conflict / InUse** | Resource dependency | Delete in order or use `--no-wait` |
| **InvalidTemplate** | Bicep/ARM error | `az bicep build`; check `what-if` |

```bash
# Verbose debug
az vm create ... --debug 2>&1 | tee deploy.log

# Activity log for failed deployments
az monitor activity-log list --resource-group rg-prod --offset 1h -o table
```

## Related Topics

- **Azure Basics.md** — ARM, resource hierarchy, Cloud Shell
- **Azure Compute.md** — VM, App Service details
- **Azure DevOps/Azure Devops Example.md** — pipeline integration
- **Git/Git Commands.md** — version control for IaC templates
