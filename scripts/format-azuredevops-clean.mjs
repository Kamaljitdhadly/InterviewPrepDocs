import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-azurecloud-clean.mjs';

const CANONICAL_PIPELINE = `trigger:
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
    displayName: 'Apply Ingress Configuration'`;

const EXPLANATION_SECTION = `## Explanation

### 1. Trigger

\`\`\`yaml
trigger:
- main
\`\`\`

Runs the pipeline on commits to \`main\` (adjust branch as needed).

### 2. Pool

\`\`\`yaml
pool:
  vmImage: 'ubuntu-latest'
\`\`\`

Linux build agent (\`ubuntu-latest\`).

### 3. Variables

\`\`\`yaml
variables:
  dockerRegistryServiceConnection: 'your-docker-registry-service-connection'
  imageRepositoryDotnet: 'your-dockerhub-username/dotnet-app'
  imageRepositoryAngular: 'your-dockerhub-username/angular-app'
  containerRegistry: 'your-container-registry-name'
  kubernetesCluster: 'your-kubernetes-cluster-name'
  kubernetesNamespace: 'default'
  kubectlServiceConnection: 'your-kubectl-service-connection'
\`\`\`

Replace placeholders with your registry, image repos, and Kubernetes service connection names.

### 4. Build and Push Docker Images

**.NET**

\`\`\`yaml
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
\`\`\`

**Angular**

\`\`\`yaml
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
\`\`\`

Builds each app image on the agent, then pushes via \`Docker@2\`.

### 5. Deploy to Kubernetes

\`\`\`yaml
- task: Kubernetes@1
  inputs:
    kubernetesServiceEndpoint: $(kubectlServiceConnection)
    namespace: $(kubernetesNamespace)
    command: apply
    arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'
  displayName: 'Deploy to Kubernetes'
\`\`\`

Applies deployment manifests for both apps using the configured kubectl service connection.

### 6. Apply Ingress Configuration

\`\`\`yaml
- task: Kubernetes@1
  inputs:
    kubernetesServiceEndpoint: $(kubectlServiceConnection)
    namespace: $(kubernetesNamespace)
    command: apply
    arguments: '-f k8s/ingress.yaml'
  displayName: 'Apply Ingress Configuration'
\`\`\`

Exposes services externally after deployments are updated.`;

const NOTES_SECTION = `## Notes

| Item | Action |
|------|--------|
| **Docker registry service connection** | Create in Azure DevOps (Docker Hub, ACR, etc.) |
| **Kubectl service connection** | Create with cluster credentials and kubeconfig |
| **Repo paths** | Ensure \`Dockerfile.dotnet\`, \`Dockerfile.angular\`, and \`k8s/*.yaml\` exist at referenced paths |`;

function collapseBrokenFences(text) {
  let t = text.replace(/```yaml\n```yaml\n/g, '```yaml\n');
  t = t.replace(/```\n```yaml\n/g, '```yaml\n');
  t = t.replace(/\n```\n\n(### |## |\d+\.  \*\*)/g, '\n\n$1');
  return t;
}

function rebuildMainPipeline(text) {
  if (!text.includes('Sample azure-pipelines.yml')) return text;
  const replacement = `### Sample azure-pipelines.yml\n\n\`\`\`yaml\n${CANONICAL_PIPELINE}\n\`\`\`\n\n`;
  return text.replace(/### Sample azure-pipelines\.yml[\s\S]*?(?=### Explanation|## Explanation|\d+\.\s+\*\*Trigger)/, replacement);
}

function polishIntro(text) {
  return text.replace(
    /To automate the deployment of your \.NET and Angular applications using Azure Pipelines, you can create a pipeline YAML file that builds Docker images for both applications, pushes them to a container registry \(e\.g\., Azure Container Registry or Docker Hub\), and then deploys them to a Kubernetes cluster\.\n\nHere’s a sample azure-pipelines\.yml file to achieve this:\n\n/,
    'To automate deployment of .NET and Angular apps with **Azure Pipelines**, use a pipeline YAML that builds Docker images, pushes to a container registry (ACR or Docker Hub), and deploys to Kubernetes.\n\n',
  );
}

function rebuildTail(text) {
  if (!text.includes('Explanation') && !text.includes('Trigger')) return text;
  const headEnd = text.search(/### Sample azure-pipelines\.yml[\s\S]*?```\n\n/);
  if (headEnd < 0) return text;
  const headMatch = text.match(/[\s\S]*### Sample azure-pipelines\.yml[\s\S]*?```\n\n/);
  if (!headMatch) return text;
  return headMatch[0] + EXPLANATION_SECTION + '\n\n' + NOTES_SECTION + '\n';
}

export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  t = collapseBrokenFences(t);
  t = polishIntro(t);
  t = rebuildMainPipeline(t);
  t = rebuildTail(t);
  return t.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

const DIR = path.resolve('full/Azure DevOps');

if (import.meta.url.includes('format-azuredevops-clean') && process.argv[1]?.includes('format-azuredevops-clean')) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const before = fs.readFileSync(p, 'utf8');
    const baseName = f.replace(/\.md$/i, '');
    const after = formatFile(before, baseName);
    fs.writeFileSync(p, after, 'utf8');
    console.log(`${f}: ${before.length} -> ${after.length}`);
  }
}
