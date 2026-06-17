# Azure Devops Example

**Azure Pipelines** YAML: build .NET + Angular Docker images → push to registry → deploy to Kubernetes.

## Sample azure-pipelines.yml

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'your-docker-registry-service-connection'
  imageRepositoryDotnet: 'your-dockerhub-username/dotnet-app'
  imageRepositoryAngular: 'your-dockerhub-username/angular-app'
  containerRegistry: 'your-container-registry-name'
  kubernetesCluster: 'your-kubernetes-cluster-name'
  kubernetesNamespace: 'default'
  kubectlServiceConnection: 'your-kubectl-service-connection'

jobs:
- job: BuildAndDeploy
  steps:
  - task: UseDotNet@2
    inputs:
      packageType: 'sdk'
      version: '7.x'
      installationPath: $(Agent.ToolsDirectory)/dotnet
  - script: |
      echo Building .NET app...
      docker build -t $(imageRepositoryDotnet):$(Build.BuildId) -f Dockerfile.dotnet .
    displayName: 'Build .NET Docker image'
  - script: |
      echo Building Angular app...
      docker build -t $(imageRepositoryAngular):$(Build.BuildId) -f Dockerfile.angular .
    displayName: 'Build Angular Docker image'
  - task: Docker@2
    inputs:
      command: 'push'
      containerRegistry: $(dockerRegistryServiceConnection)
      repository: $(imageRepositoryDotnet)
      tags: $(Build.BuildId)
    displayName: 'Push .NET Docker image'
  - task: Docker@2
    inputs:
      command: 'push'
      containerRegistry: $(dockerRegistryServiceConnection)
      repository: $(imageRepositoryAngular)
      tags: $(Build.BuildId)
    displayName: 'Push Angular Docker image'
  - task: Kubernetes@1
    inputs:
      kubernetesServiceEndpoint: $(kubectlServiceConnection)
      namespace: $(kubernetesNamespace)
      command: apply
      arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'
    displayName: 'Deploy to Kubernetes'
  - task: Kubernetes@1
    inputs:
      kubernetesServiceEndpoint: $(kubectlServiceConnection)
      namespace: $(kubernetesNamespace)
      command: apply
      arguments: '-f k8s/ingress.yaml'
    displayName: 'Apply Ingress Configuration'
```

## Explanation

| Section | Purpose |
|---------|---------|
| **trigger** | Run on `main` branch commits |
| **pool** | `ubuntu-latest` Linux agent |
| **variables** | Registry connections, image repos, K8s cluster/namespace |
| **UseDotNet@2** | Install .NET 7 SDK on agent |
| **script + Docker@2** | Build/push .NET and Angular images |
| **Kubernetes@1 (deploy)** | `kubectl apply` deployment manifests |
| **Kubernetes@1 (ingress)** | `kubectl apply` ingress for external access |

### 1. Trigger

```yaml
trigger:
- main
```

### 2. Pool

```yaml
pool:
  vmImage: 'ubuntu-latest'
```

### 3. Variables

```yaml
variables:
  dockerRegistryServiceConnection: 'your-docker-registry-service-connection'
  imageRepositoryDotnet: 'your-dockerhub-username/dotnet-app'
  imageRepositoryAngular: 'your-dockerhub-username/angular-app'
  containerRegistry: 'your-container-registry-name'
  kubernetesCluster: 'your-kubernetes-cluster-name'
  kubernetesNamespace: 'default'
  kubectlServiceConnection: 'your-kubectl-service-connection'
```

### 4. Build and Push — .NET

```yaml
- script: |
    echo Building .NET app...
    docker build -t $(imageRepositoryDotnet):$(Build.BuildId) -f Dockerfile.dotnet .
  displayName: 'Build .NET Docker image'
- task: Docker@2
  inputs:
    command: 'push'
    containerRegistry: $(dockerRegistryServiceConnection)
    repository: $(imageRepositoryDotnet)
    tags: $(Build.BuildId)
  displayName: 'Push .NET Docker image'
```

### 4. Build and Push — Angular

```yaml
- script: |
    echo Building Angular app...
    docker build -t $(imageRepositoryAngular):$(Build.BuildId) -f Dockerfile.angular .
  displayName: 'Build Angular Docker image'
- task: Docker@2
  inputs:
    command: 'push'
    containerRegistry: $(dockerRegistryServiceConnection)
    repository: $(imageRepositoryAngular)
    tags: $(Build.BuildId)
  displayName: 'Push Angular Docker image'
```

### 5. Deploy to Kubernetes

```yaml
- task: Kubernetes@1
  inputs:
    kubernetesServiceEndpoint: $(kubectlServiceConnection)
    namespace: $(kubernetesNamespace)
    command: apply
    arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'
  displayName: 'Deploy to Kubernetes'
```

### 6. Apply Ingress Configuration

```yaml
- task: Kubernetes@1
  inputs:
    kubernetesServiceEndpoint: $(kubectlServiceConnection)
    namespace: $(kubernetesNamespace)
    command: apply
    arguments: '-f k8s/ingress.yaml'
  displayName: 'Apply Ingress Configuration'
```

## Notes

- **Docker registry service connection** — Azure DevOps → Project Settings → Service connections
- **Kubectl service connection** — cluster endpoint + credentials/kubeconfig
- **Paths** — `Dockerfile.dotnet`, `Dockerfile.angular`, `k8s/dotnet-deployment.yaml`, `k8s/angular-deployment.yaml`, `k8s/ingress.yaml`
