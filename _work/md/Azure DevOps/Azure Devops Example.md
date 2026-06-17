To automate the deployment of your .NET and Angular applications using Azure Pipelines, you can create a pipeline YAML file that builds Docker images for both applications, pushes them to a container registry (e.g., Azure Container Registry or Docker Hub), and then deploys them to a Kubernetes cluster.

Here’s a sample azure-pipelines.yml file to achieve this:

**Sample azure-pipelines.yml**

trigger:

\- main

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

\- job: BuildAndDeploy

steps:

\- task: UseDotNet@2

inputs:

packageType: 'sdk'

version: '7.x'

installationPath: \$(Agent.ToolsDirectory)/dotnet

\- script: \|

echo Building .NET app...

docker build -t \$(imageRepositoryDotnet):\$(Build.BuildId) -f Dockerfile.dotnet .

displayName: 'Build .NET Docker image'

\- script: \|

echo Building Angular app...

docker build -t \$(imageRepositoryAngular):\$(Build.BuildId) -f Dockerfile.angular .

displayName: 'Build Angular Docker image'

\- task: Docker@2

inputs:

command: 'push'

containerRegistry: \$(dockerRegistryServiceConnection)

repository: \$(imageRepositoryDotnet)

tags: \$(Build.BuildId)

displayName: 'Push .NET Docker image'

\- task: Docker@2

inputs:

command: 'push'

containerRegistry: \$(dockerRegistryServiceConnection)

repository: \$(imageRepositoryAngular)

tags: \$(Build.BuildId)

displayName: 'Push Angular Docker image'

\- task: Kubernetes@1

inputs:

kubernetesServiceEndpoint: \$(kubectlServiceConnection)

namespace: \$(kubernetesNamespace)

command: apply

arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'

displayName: 'Deploy to Kubernetes'

\- task: Kubernetes@1

inputs:

kubernetesServiceEndpoint: \$(kubectlServiceConnection)

namespace: \$(kubernetesNamespace)

command: apply

arguments: '-f k8s/ingress.yaml'

displayName: 'Apply Ingress Configuration'

**Explanation**

1.  **Trigger**

> trigger:
>
> \- main

- **Explanation**: Automatically triggers the pipeline on changes to the main branch. Adjust the branch name if necessary.

2.  **Pool**

> pool:
>
> vmImage: 'ubuntu-latest'

- **Explanation**: Specifies the VM image to use for the build agent. ubuntu-latest provides a Linux-based build environment.

3.  **Variables**

> variables:
>
> dockerRegistryServiceConnection: 'your-docker-registry-service-connection'
>
> imageRepositoryDotnet: 'your-dockerhub-username/dotnet-app'
>
> imageRepositoryAngular: 'your-dockerhub-username/angular-app'
>
> containerRegistry: 'your-container-registry-name'
>
> kubernetesCluster: 'your-kubernetes-cluster-name'
>
> kubernetesNamespace: 'default'
>
> kubectlServiceConnection: 'your-kubectl-service-connection'

- **Explanation**: Defines variables for Docker registry connections, image repositories, and Kubernetes cluster details. Replace placeholders with actual values.

4.  **Build and Push Docker Images**

    - **.NET Build and Push**

> \- script: \|
>
> echo Building .NET app...
>
> docker build -t \$(imageRepositoryDotnet):\$(Build.BuildId) -f Dockerfile.dotnet .
>
> displayName: 'Build .NET Docker image'
>
> \- task: Docker@2
>
> inputs:
>
> command: 'push'
>
> containerRegistry: \$(dockerRegistryServiceConnection)
>
> repository: \$(imageRepositoryDotnet)
>
> tags: \$(Build.BuildId)
>
> displayName: 'Push .NET Docker image'

- **Explanation**: Builds the Docker image for the .NET application and then pushes it to the specified container registry.

<!-- -->

- **Angular Build and Push**

> \- script: \|
>
> echo Building Angular app...
>
> docker build -t \$(imageRepositoryAngular):\$(Build.BuildId) -f Dockerfile.angular .
>
> displayName: 'Build Angular Docker image'
>
> \- task: Docker@2
>
> inputs:
>
> command: 'push'
>
> containerRegistry: \$(dockerRegistryServiceConnection)
>
> repository: \$(imageRepositoryAngular)
>
> tags: \$(Build.BuildId)
>
> displayName: 'Push Angular Docker image'

- **Explanation**: Builds the Docker image for the Angular application and then pushes it to the specified container registry.

5.  **Deploy to Kubernetes**

> \- task: Kubernetes@1
>
> inputs:
>
> kubernetesServiceEndpoint: \$(kubectlServiceConnection)
>
> namespace: \$(kubernetesNamespace)
>
> command: apply
>
> arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'
>
> displayName: 'Deploy to Kubernetes'

- **Explanation**: Applies the Kubernetes deployment manifests for both the .NET and Angular applications. It uses the kubectl service connection to interact with the Kubernetes cluster.

6.  **Apply Ingress Configuration**

> \- task: Kubernetes@1
>
> inputs:
>
> kubernetesServiceEndpoint: \$(kubectlServiceConnection)
>
> namespace: \$(kubernetesNamespace)
>
> command: apply
>
> arguments: '-f k8s/ingress.yaml'
>
> displayName: 'Apply Ingress Configuration'

- **Explanation**: Applies the Ingress configuration to expose the services externally. This is done after the deployments are updated.

**Notes**

- **Docker Registry Service Connection**: Configure this service connection in Azure DevOps to allow access to your Docker registry (Docker Hub, Azure Container Registry, etc.).

- **Kubectl Service Connection**: Configure this service connection in Azure DevOps to allow access to your Kubernetes cluster. It requires credentials and the cluster’s configuration.

- **YAML File Paths**: Ensure that Dockerfile.dotnet, Dockerfile.angular, k8s/dotnet-deployment.yaml, k8s/angular-deployment.yaml, and k8s/ingress.yaml are correctly referenced and available in your repository.
