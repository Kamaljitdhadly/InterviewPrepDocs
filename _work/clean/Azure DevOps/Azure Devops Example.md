# Azure Devops Example

To automate deployment of .NET and Angular apps with **Azure Pipelines**, use a pipeline YAML that builds Docker images, pushes to a container registry (ACR or Docker Hub), and deploys to Kubernetes.

### Sample azure-pipelines.yml

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

### 1. Trigger

```yaml
trigger:
- main
```

Runs the pipeline on commits to `main` (adjust branch as needed).

### 2. Pool

```yaml
pool:
  vmImage: 'ubuntu-latest'
```

Linux build agent (`ubuntu-latest`).

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

Replace placeholders with your registry, image repos, and Kubernetes service connection names.

### 4. Build and Push Docker Images

**.NET**

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

**Angular**

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

Builds each app image on the agent, then pushes via `Docker@2`.

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

Applies deployment manifests for both apps using the configured kubectl service connection.

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

Exposes services externally after deployments are updated.

## Notes

| Item | Action |
|------|--------|
| **Docker registry service connection** | Create in Azure DevOps (Docker Hub, ACR, etc.) |
| **Kubectl service connection** | Create with cluster credentials and kubeconfig |
| **Repo paths** | Ensure `Dockerfile.dotnet`, `Dockerfile.angular`, and `k8s/*.yaml` exist at referenced paths |
