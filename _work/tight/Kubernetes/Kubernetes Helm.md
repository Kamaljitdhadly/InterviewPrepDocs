# Kubernetes Helm

## Questions Covered

1. What is Helm in Kubernetes?
2. What are Helm Charts?
3. How do you manage applications using Helm?

## What is Helm in Kubernetes?

**Helm** is Kubernetes' package manager — deploy, manage, and version apps via **charts** (packaged manifests + config).

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Charts** | Pre-configured K8s resource packages (manifests, config, metadata) |
| **Repositories** | Central chart collections (public Helm Hub or private) |
| **Releases** | Named chart instances in a cluster — install, upgrade, rollback, delete |
| **Helm CLI** | Command-line tool for chart/release management |

**Chart structure:**

| File/Dir | Purpose |
|----------|---------|
| `Chart.yaml` | Name, version, description |
| `values.yaml` | Default config (overridable at install) |
| `templates/` | Templated K8s manifests |
| `charts/` | Chart dependencies |
| `README.md` | Documentation |

**Key CLI commands:** `helm install`, `helm upgrade`, `helm rollback`, `helm delete`, `helm repo add`, `helm search`

### Key Benefits

| Benefit | Detail |
|---------|--------|
| **Ease of use** | Deploy complex apps with one command |
| **Templating** | Same chart, different envs via values |
| **Versioning** | Chart + release versions; easy rollbacks |
| **Dependencies** | Multi-component apps in one chart |
| **Ecosystem** | Large public chart library |

### Example Workflow

1. **Add a Chart Repository**:

```yaml
helm repo add bitnami https://charts.bitnami.com/bitnami
```

2. **Search for a Chart**:

```yaml
helm search repo bitnami/mysql
```

3. **Install a Chart**:

```yaml
helm install my-mysql bitnami/mysql
```

4. **Upgrade a Release**:

```yaml
helm upgrade my-mysql bitnami/mysql --set mysqlRootPassword=newpassword
```

5. **Rollback a Release**:

```yaml
helm rollback my-mysql 1
```

6. **Delete a Release**:

helm delete my-mysql

## What are Helm Charts?

**Helm Charts** package pre-configured K8s resources for defining, installing, and managing applications.

### Components of a Helm Chart

1.  **Chart.yaml**:

    - Metadata: name, version, description.

    - **Example**:

```yaml
apiVersion: v2
name: myapp
description: A Helm chart for Kubernetes
version: 1.0.0
```

2.  **values.yaml**:

    - Default config values; overridable at install/upgrade.

    - **Example**:

```yaml
replicaCount: 1
image:
repository: myapp
tag: "latest"
service:
type: ClusterIP
port: 80
```

3.  **templates/**:

    - K8s manifest templates with Helm templating syntax.

    - **Example** — **deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
name: {{ include "myapp.fullname" . }}
spec:
replicas: {{ .Values.replicaCount }}
selector:
matchLabels:
app: {{ include "myapp.name" . }}
template:
metadata:
labels:
app: {{ include "myapp.name" . }}
spec:
containers:
- name: {{ .Chart.Name }}
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
ports:
- containerPort: 80
```

4.  **charts/**: Dependency charts (e.g., Redis sub-chart).

5.  **README.md**: Install, configure, and usage docs.

6.  **values.schema.json** (Optional): JSON schema validating `values.yaml`.

    - **Example**:

```yaml
{
"$schema": "http://json-schema.org/draft-07/schema#",
"type": "object",
"properties": {
"replicaCount": {
"type": "integer",
"minimum": 1
},
"image": {
"type": "object",
"properties": {
"repository": {
"type": "string"
},
"tag": {
"type": "string"
}
},
"required": ["repository", "tag"]
}
},
"required": ["replicaCount", "image"]
}
```

### How Helm Charts Work

1. **Template Rendering** — Helm merges `values.yaml` + `templates/` → final manifests.
2. **Deployment** — `helm install` creates Deployments, Services, ConfigMaps, etc.
3. **Configuration** — Override via custom `values.yaml` or `--set` flags.

### Example Usage

1.  **Add a Chart Repository**:

```yaml
helm repo add bitnami https://charts.bitnami.com/bitnami
```

2.  **Search for a Chart**:

```yaml
helm search repo bitnami/mysql
```

3.  **Install a Chart**:

```yaml
helm install my-mysql bitnami/mysql
```

4.  **Upgrade a Chart**:

```yaml
helm upgrade my-mysql bitnami/mysql --set mysqlRootPassword=newpassword
```

5.  **Rollback a Release**:

```yaml
helm rollback my-mysql 1
```

6.  **Uninstall a Chart**:

```yaml
helm uninstall my-mysql
```

## How do you manage applications using Helm?

### 1. Install Helm

Install the Helm CLI from the official Helm website.

### 2. Add and Manage Helm Repositories

**Add a Chart Repository**:

```yaml
helm repo add <repo-name> <repo-url>
```

# Example: Add the Bitnami repository

```yaml
helm repo add bitnami https://charts.bitnami.com/bitnami
```

**Update Repositories**:

```yaml
helm repo update
```

**Search for Charts**:

```yaml
helm search repo <chart-name>
```

# Example: Search for MySQL charts

```yaml
helm search repo mysql
```

### 3. Install Applications

```yaml
helm install <release-name> <repo-name>/<chart-name> [flags]
```

# Example: Install MySQL from the Bitnami repository

```yaml
helm install my-mysql bitnami/mysql
```

- **\<release-name\>**: Deployment instance name.
- **\<repo-name\>/\<chart-name\>**: Chart source.
- **Flags**: `--values` for custom values file; `--set` for inline overrides.

### 4. Configure Applications

**Use Values Files** — override chart defaults:

**Example values.yaml**:

replicaCount: 3

image:

repository: myapp

tag: "2.0"

service:

type: LoadBalancer

```yaml
port: 80
```

**Apply Custom Values**:

```yaml
helm install <release-name> <repo-name>/<chart-name> -f custom-values.yaml
```

# or override values directly

```yaml
helm install <release-name> <repo-name>/<chart-name> --set image.tag=2.0
```

### 5. Upgrade Applications

```yaml
helm upgrade <release-name> <repo-name>/<chart-name> [flags]
```

# Example: Upgrade MySQL to a new version or change configuration

```yaml
helm upgrade my-mysql bitnami/mysql --set mysqlRootPassword=newpassword
```

### 6. Rollback Applications

```yaml
helm rollback <release-name> <revision>
```

# Example: Roll back MySQL to revision 1

```yaml
helm rollback my-mysql 1
```

List revisions:

```yaml
helm history <release-name>
```

### 7. Uninstall Applications

```yaml
helm uninstall <release-name>
```

# Example: Uninstall MySQL release

```yaml
helm uninstall my-mysql
```

### 8. Manage Dependencies

Define in `Chart.yaml` or `requirements.yaml`; store sub-charts in `charts/`.

**Add Dependencies**:

dependencies:

```yaml
- name: redis
```

version: "14.0.0"

repository: "https://charts.bitnami.com/bitnami"

**Update Dependencies**:

helm dependency update

### 9. Package and Share Charts

**Package a Chart**:

```yaml
helm package <chart-directory>
```

# Example: Package the chart in the current directory

helm package .

**Push to a Repository**:

```yaml
helm push <chart-package> <repo-name>
```

### .NET and Angular Helm Charts

Example charts for `dotnet-deployment.yaml` and `angular-deployment.yaml`.

### 1. Helm Chart for .NET Application

### Directory Structure

dotnet-chart/

├── Chart.yaml

├── values.yaml

├── templates/

├── deployment.yaml

├── service.yaml

├── ingress.yaml (optional)

### Chart.yaml

```yaml
apiVersion: v2
```

name: dotnet-app

description: A Helm chart for .NET application

version: 0.1.0

### values.yaml

replicaCount: 2

image:

repository: myregistry/dotnet-app

tag: latest

pullPolicy: IfNotPresent

service:

name: dotnet-app

type: ClusterIP

```yaml
port: 80
```

targetPort: 80

ingress:

enabled: false

name: ""

nginx:

host: "example.com"

path: /

tls: false

resources: {}

### templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
name: {{ include "dotnet-app.fullname" . }}
```

labels:

app.kubernetes.io/name: {{ include "dotnet-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
replicas: {{ .Values.replicaCount }}
selector:
```

matchLabels:

app.kubernetes.io/name: {{ include "dotnet-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

template:

```yaml
metadata:
```

labels:

app.kubernetes.io/name: {{ include "dotnet-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
containers:
- name: dotnet-app
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
imagePullPolicy: {{ .Values.image.pullPolicy }}
```

ports:

- containerPort: {{ .Values.service.targetPort }}

### templates/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
name: {{ include "dotnet-app.fullname" . }}
```

labels:

app.kubernetes.io/name: {{ include "dotnet-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
type: {{ .Values.service.type }}
```

ports:

- port: {{ .Values.service.port }}

targetPort: {{ .Values.service.targetPort }}

```yaml
selector:
app.kubernetes.io/name: {{ include "dotnet-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
```

### templates/ingress.yaml (Optional)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: {{ include "dotnet-app.fullname" . }}
```

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

```yaml
spec:
```

rules:

- host: {{ .Values.ingress.nginx.host }}

http:

paths:

- path: {{ .Values.ingress.nginx.path }}

pathType: Prefix

backend:

service:

name: {{ include "dotnet-app.fullname" . }}

port:

number: {{ .Values.service.port }}

{{- if .Values.ingress.tls }}

tls:

- hosts:

- {{ .Values.ingress.nginx.host }}

secretName: {{ include "dotnet-app.fullname" . }}-tls

{{- end }}

### 2. Helm Chart for Angular Application

### Directory Structure

angular-chart/

├── Chart.yaml

├── values.yaml

├── templates/

├── deployment.yaml

├── service.yaml

├── ingress.yaml (optional)

### Chart.yaml

```yaml
apiVersion: v2
```

name: angular-app

description: A Helm chart for Angular application

version: 0.1.0

### values.yaml

replicaCount: 2

image:

repository: myregistry/angular-app

tag: latest

pullPolicy: IfNotPresent

service:

name: angular-app

type: ClusterIP

```yaml
port: 80
```

targetPort: 80

ingress:

enabled: false

name: ""

nginx:

host: "example.com"

path: /

tls: false

resources: {}

### templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
name: {{ include "angular-app.fullname" . }}
```

labels:

app.kubernetes.io/name: {{ include "angular-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
replicas: {{ .Values.replicaCount }}
selector:
```

matchLabels:

app.kubernetes.io/name: {{ include "angular-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

template:

```yaml
metadata:
```

labels:

app.kubernetes.io/name: {{ include "angular-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
containers:
- name: angular-app
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
imagePullPolicy: {{ .Values.image.pullPolicy }}
```

ports:

- containerPort: {{ .Values.service.targetPort }}

### templates/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
name: {{ include "angular-app.fullname" . }}
```

labels:

app.kubernetes.io/name: {{ include "angular-app.name" . }}

app.kubernetes.io/instance: {{ .Release.Name }}

```yaml
spec:
type: {{ .Values.service.type }}
```

ports:

- port: {{ .Values.service.port }}

targetPort: {{ .Values.service.targetPort }}

```yaml
selector:
app.kubernetes.io/name: {{ include "angular-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
```

### templates/ingress.yaml (Optional)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: {{ include "angular-app.fullname" . }}
```

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

```yaml
spec:
```

rules:

- host: {{ .Values.ingress.nginx.host }}

http:

paths:

- path: {{ .Values.ingress.nginx.path }}

pathType: Prefix

backend:

service:

name: {{ include "angular-app.fullname" . }}

port:

number: {{ .Values.service.port }}

{{- if .Values.ingress.tls }}

tls:

- hosts:

- {{ .Values.ingress.nginx.host }}

secretName: {{ include "angular-app.fullname" . }}-tls

{{- end }}

**Chart files:** `Chart.yaml` (metadata), `values.yaml` (defaults), `templates/deployment.yaml`, `templates/service.yaml`, `templates/ingress.yaml` (optional).

Install from chart directory:

```yaml
helm install <release-name> .
```

### Helm Commands Reference

| Category | Command | Description |
|----------|---------|-------------|
| Version | `helm version` | Client and server versions |
| Chart | `helm create <chart-name>` | Scaffold new chart |
| Chart | `helm package <chart-path>` | Package to `.tgz` |
| Chart | `helm lint <chart-path>` | Lint chart |
| Chart | `helm pull <chart-name>` | Download from repo |
| Chart | `helm delete <release-name>` | Uninstall release |
| Repo | `helm repo add <name> <url>` | Add repository |
| Repo | `helm repo list` | List repositories |
| Repo | `helm repo update` | Refresh chart index |
| Repo | `helm repo remove <name>` | Remove repository |
| Release | `helm install <name> <path>` | Install chart |
| Release | `helm upgrade <name> <path>` | Upgrade release |
| Release | `helm rollback <name> <rev>` | Roll back |
| Release | `helm status <name>` | Release status |
| Release | `helm history <name>` | Revision history |
| Release | `helm get all/manifest/values <name>` | Release details |
| Test | `helm test <name>` | Run chart tests |
| Template | `helm template <name> <path>` | Render manifests locally |
| Upgrade | `helm upgrade ... --reuse-values` | Upgrade keeping values |
| Upgrade | `helm upgrade ... -f <file>` | Upgrade with values file |
| Install | `helm install ... --values <file>` | Install with values file |
| Install | `helm install ... --set key=value` | Install with overrides |
| Help | `helm help [command]` | Command documentation |

**Examples:**

1.  **Creating a New Chart**

helm create my-chart

2.  **Packaging a Chart**

helm package my-chart/

3.  **Adding a Repository**

```yaml
helm repo add my-repo https://example.com/charts
```

4.  **Installing a Chart**

```yaml
helm install my-release my-chart/
```

5.  **Upgrading a Release**

```yaml
helm upgrade my-release my-chart/
```

6.  **Rolling Back a Release**

```yaml
helm rollback my-release 1
```

7.  **Viewing Release Status**

```yaml
helm status my-release
```

8.  **Rendering Manifests**

```yaml
helm template my-release my-chart/
```

9.  **Listing Repositories**

```yaml
helm repo list
```

10. **Updating Repositories**

```yaml
helm repo update
```

11. **Deleting a Release**

helm delete my-release
