# Docker Basics

## Questions Covered

1. What is Docker, and why is it used?
2. Explain the difference between Docker images and Docker containers.
3. How does Docker differ from a virtual machine?
4. What is a Docker daemon, and how does it work?
5. Explain the Docker architecture and its main components.
6. What are the benefits of using Docker?
7. What is a Docker registry, and how does it work?
8. How do you push and pull images to and from Docker Hub?
9. Explain the difference between Docker Hub and private registries.
10. How can you set up a multi-container application with Docker?
11. What is the difference between a Docker image tag and a Docker image digest?
12. Explain the use of Dockerfile ARG and ENV instructions.
13. How do you handle container orchestration in multi-host Docker deployments?
14. Explain the use of image caching in Docker?

## What is Docker, and why is it used?

**Docker** is a platform that packages applications and dependencies into **lightweight, portable containers** that run consistently across environments.

**Why use Docker:**

| Reason | Benefit |
|--------|---------|
| **Portability** | Run on any Docker-capable host — dev, test, prod |
| **Consistency** | Same image everywhere; eliminates "works on my machine" |
| **Isolation** | Apps isolated from each other and the host |
| **Scalability** | Spin up/down instances quickly; fits microservices |
| **Efficiency** | Lighter than VMs — fast startup, less overhead |
| **Version control** | Images are versioned for updates and rollbacks |
| **CI/CD** | Integrates with pipelines for automated build/deploy |

Docker streamlines development and deployment with consistent, isolated environments and better resource utilization.

## Explain the difference between Docker images and Docker containers.

| Aspect | Docker Image | Docker Container |
|--------|--------------|------------------|
| **Nature** | Static, read-only snapshot | Running instance of an image |
| **Mutability** | Immutable — changes require a new image | Mutable at runtime |
| **Role** | Blueprint / template | Executes the application |
| **Persistence** | Stored in registries or locally | Filesystem changes are ephemeral unless committed to a new image |
| **Lifecycle** | Built once, reused many times | Created → running → stopped → deleted |
| **Examples** | `ubuntu`, `nginx:latest`, custom app image | Live web server or DB process from those images |

**Summary:** Images are templates; containers are the live, isolated processes created from them.

**Lifecycle:** `docker build` → image → `docker run` → container → `docker stop` → `docker rm`. Multiple containers can run from the same image simultaneously.

## How does Docker differ from a virtual machine?

Both isolate applications, but differ in architecture, performance, and use cases.

| Aspect | Docker (Containers) | Virtual Machines |
|--------|---------------------|------------------|
| **Architecture** | Shares host OS kernel; isolated user spaces | Full guest OS per VM via hypervisor |
| **Overhead** | Minimal — app + deps only | High — guest OS + virtualized hardware |
| **Startup** | Near-instant | Slower — full OS boot |
| **Resource usage** | Lower density, higher per-host count | Higher per-instance cost |
| **Isolation** | Process/filesystem isolation; shared kernel | Strong hardware-level separation |
| **Use cases** | Microservices, CI/CD, fast scaling | Multiple OS types, legacy apps, strict isolation |
| **Management** | Docker CLI, Compose, Kubernetes | Hypervisor tools (vSphere, Hyper-V) |

Containers are lightweight and fast; VMs provide stronger isolation at the cost of resources and startup time.

## What is a Docker daemon, and how does it work?

The **Docker daemon** (`dockerd`) is the background service that manages containers, images, networks, and volumes.

**Key functions:**

- **Container management** — create, start, stop, delete; allocate CPU, memory, storage
- **Image management** — build from Dockerfiles; pull/push to registries
- **Networking** — virtual networks, IP assignment, inter-container communication
- **Storage** — volume creation and lifecycle for persistent data
- **API** — REST API on Unix socket (`/var/run/docker.sock`) or TCP; CLI talks to daemon via this API

**How it works:**

1. Starts and listens for API requests from CLI, Compose, or remote clients
2. Processes commands (e.g., `docker run` → create container, configure network, allocate resources)
3. Uses OS primitives (**cgroups**, **namespaces**) for isolation and storage drivers for layers
4. Maintains local image store; monitors health and logs

The daemon is the engine behind all Docker operations on a host.

**Typical request flow:** `docker run nginx` → CLI sends API request → daemon pulls image (if missing) → creates container with cgroups/namespaces → assigns network → starts process → streams logs back to CLI.

## Explain the Docker architecture and its main components.

Docker's modular architecture:

| Component | Function |
|-----------|----------|
| **Docker Daemon** | Runs containers, manages images, networks, volumes; serves REST API |
| **Docker Client** | CLI that sends commands to the daemon (local or remote) |
| **Docker Images** | Read-only templates (code, runtime, libs, config) |
| **Docker Containers** | Runnable instances of images; share host kernel |
| **Docker Registries** | Store and distribute images (Docker Hub, ECR, ACR, private) |
| **Dockerfile** | Build instructions for creating images |
| **Docker Compose** | Multi-container apps via `docker-compose.yml` |
| **Docker Swarm** | Native clustering — scheduling, scaling, load balancing |
| **Kubernetes** | Advanced orchestration (commonly used with Docker) |

**Flow:** Client → API → Daemon → creates/manages containers from images pulled from registries, built via Dockerfiles, and orchestrated with Compose/Swarm/Kubernetes.

- **Daemon + Client** form the core client-server model on each host.
- **Images → Containers** is the build-run lifecycle.
- **Registries** decouple image distribution from execution.
- **Compose** handles local/multi-service dev; **Swarm/Kubernetes** handle production multi-host orchestration.

## What are the benefits of using Docker?

| Category | Benefits |
|----------|----------|
| **Portability** | Consistent runs across dev, test, prod; any Docker host |
| **Isolation** | Separate deps per container; no version conflicts |
| **Efficiency** | Lightweight vs VMs; higher density on same hardware |
| **Speed** | Instant container startup; rapid scaling |
| **Reproducibility** | Versioned images; easy rollbacks |
| **Scalability** | Scale replicas; Swarm/Kubernetes for orchestration |
| **CI/CD** | Automated build, test, deploy in identical environments |
| **Security** | Process isolation; image scanning; controlled configs |
| **Cost** | Less infrastructure overhead than VM-per-app |
| **Developer experience** | Local prod-like environments; simpler dependency management |

Docker supports modern DevOps with portable, consistent, and efficient application delivery.

**Compared to traditional deployment:** No manual server configuration, dependency installation, or environment drift — the image *is* the environment.

## What is a Docker registry, and how does it work?

A **Docker registry** stores and distributes images. Developers push built images and pull them on any host for deployment.

**Key concepts:**

- **Repository** — collection of related images (e.g., `myapp`), differentiated by tags
- **Images** — layered artifacts tagged with versions (`myapp:1.0.0`, `myapp:latest`)

**Workflow:**

1. **Store** — registry holds image layers and metadata
2. **Tag** — `docker tag myapp:latest myregistry.com/myapp:latest`
3. **Push** — `docker push myregistry.com/myapp:latest`
4. **Pull** — `docker pull myregistry.com/myapp:latest`
5. **Access control** — authentication for push/pull on private registries

**Registry types:**

| Type | Examples |
|------|----------|
| Public | Docker Hub (`hub.docker.com`) |
| Enterprise | Docker Trusted Registry |
| Self-hosted | Docker Registry (open-source) |
| Cloud-managed | GCR, ECR, ACR |

Registries centralize image distribution for consistent deployments across environments.

**Image layers:** Each image is a stack of read-only layers. On push, only new/changed layers upload; on pull, only missing layers download — making transfers efficient.

**Metadata:** Registries store tags, labels, and layer manifests so teams can track versions and enforce access policies.

## How do you push and pull images to and from Docker Hub?

### Pushing Images

1. Create a Docker Hub account
2. Log in:

```bash
docker login
```

3. Tag the image with your username and repo:

```bash
docker tag local-image:tag username/repository:tag
```

```bash
docker tag myapp:latest johndoe/myapp:latest
```

4. Push:

```bash
docker push username/repository:tag
```

```bash
docker push johndoe/myapp:latest
```

### Pulling Images

1. Log in if the image is private (`docker login`)
2. Pull:

```bash
docker pull username/repository:tag
```

```bash
docker pull johndoe/myapp:latest
```

### Examples

**Push:**

```bash
docker tag myapp:latest johndoe/myapp:latest
```

```bash
docker push johndoe/myapp:latest
```

**Pull:**

```bash
docker pull johndoe/myapp:latest
```

**Notes:** Repository format is `username/repository` (auto-created on first push). Default tag is `latest` if omitted. Private repos require login and permissions.

## Explain the difference between Docker Hub and private registries.

| Aspect | Docker Hub | Private Registry |
|--------|------------|------------------|
| **Access** | Public by default; optional private repos | Restricted to authorized users |
| **Discovery** | Searchable public catalog; official images | Internal-only; no public listing |
| **Features** | Automated builds (GitHub/Bitbucket), official images | Custom auth (LDAP/OAuth), enterprise security |
| **Rate limits** | Limits on anonymous/free pulls | Controlled by your infrastructure |
| **Cost** | Free + paid tiers | Hosting/infra costs (self-hosted or cloud) |
| **Use case** | Open-source, community, small teams | Proprietary images, compliance, air-gapped |

**Docker Hub examples:**

```bash
docker pull nginx:latest
```

```bash
docker tag myapp:latest myusername/myapp:latest
docker push myusername/myapp:latest
```

**Private registry examples:**

```bash
docker pull myprivateregistry.com/myapp:latest
```

```bash
docker tag myapp:latest myprivateregistry.com/myapp:latest
docker push myprivateregistry.com/myapp:latest
```

**Private registry options:** Docker Registry (self-hosted), GCR, ECR, ACR.

**When to choose which:** Docker Hub for public/open-source sharing; private registries when images contain proprietary code, require compliance (HIPAA, SOC2), or must stay on-premises.

## How can you set up a multi-container application with Docker?

Use **Docker Compose** to define, build, and run multi-container apps via `docker-compose.yml`.

**Steps:**

1. Install Docker and Docker Compose
2. Create a **Dockerfile** per service
3. Define services, networks, and volumes in **docker-compose.yml**
4. Run with `docker-compose up`

### Example Dockerfile — web (Node.js)

```bash
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Example Dockerfile — database (MySQL)

```bash
FROM mysql:5.7
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=mydatabase
```

### Example docker-compose.yml

```bash
version: '3.8'
services:
```

web:

build:

context: ./web

ports:

```bash
- "3000:3000"
```

depends_on:

- db

networks:

- app-network

db:

image: mysql:5.7

environment:

MYSQL_ROOT_PASSWORD: rootpassword

MYSQL_DATABASE: mydatabase

networks:

- app-network

networks:

app-network:

driver: bridge

**Key fields:** `services` (web + db), `depends_on` (db before web), `networks` (shared `app-network`).

**Custom networks:** Services on the same Compose network resolve each other by service name (e.g., web connects to `db:3306`). Use named volumes for data that must survive container restarts.

### Run and manage

```bash
docker-compose up --build
```

```bash
docker-compose up -d
```

```bash
docker-compose down
```

```bash
docker-compose ps
```

```bash
docker-compose logs web
```

```bash
docker-compose exec web sh
```

### Volumes (persistent data)

```bash
services:
```

db:

image: mysql:5.7

environment:

MYSQL_ROOT_PASSWORD: rootpassword

MYSQL_DATABASE: mydatabase

volumes:

```bash
- db-data:/var/lib/mysql
```

networks:

- app-network

volumes:

db-data:

**Summary:** Dockerfiles build images → `docker-compose.yml` wires services → `docker-compose up` starts the stack.

## What is the difference between a Docker image tag and a Docker image digest?

| Aspect | Tag | Digest |
|--------|-----|--------|
| **Format** | `repository:tag` (e.g., `myapp:1.0.0`) | `sha256:<hash>` |
| **Readability** | Human-friendly | Cryptographic hash |
| **Mutability** | Mutable — `latest` can point to different builds | Immutable — uniquely identifies exact content |
| **Use case** | Dev workflows, versioning labels | Production, security, reproducible deploys |

**Tag examples:**

```bash
docker pull myapp:latest
```

```bash
docker tag myapp:latest myapp:1.0.1
```

**Digest examples:**

```bash
docker pull myapp@sha256:abc123...
```

```bash
docker inspect myapp:latest --format='{{.RepoDigests}}'
```

Tags are convenient references; digests guarantee the exact same image content every time.

**Best practice:** Use tags in development (`myapp:dev`); pin by digest in production (`myapp@sha256:...`) to prevent surprise updates when a tag is overwritten.

## Explain the use of Dockerfile ARG and ENV instructions.

| Aspect | ARG | ENV |
|--------|-----|-----|
| **Scope** | Build-time only | Build-time + runtime |
| **Purpose** | Build parameters | Runtime configuration |
| **Persistence** | Not in final container env | Stored in image; available to running container |
| **Override** | `--build-arg` at build | Set in Dockerfile; overridable at `docker run -e` |

### ARG — build-time variables

```bash
ARG <variable_name>[=<default_value>]
```

```bash
ARG VERSION=1.0
FROM alpine:${VERSION}
```

```bash
RUN echo "Building version ${VERSION}"
```

```bash
docker build --build-arg VERSION=2.0 -t myimage:latest .
```

### ENV — runtime environment variables

```bash
ENV <variable_name>=<value> [<variable_name>=<value> ...]
```

```bash
ENV APP_ENV=production
ENV APP_PORT=8080
```

```bash
RUN echo "Running in ${APP_ENV} mode on port ${APP_PORT}"
CMD ["node", "app.js"]
```

**Accessing values:**

- **ARG** — `${VAR}` in Dockerfile instructions during build only
- **ENV** — `$APP_ENV` inside the container shell and in application code at runtime

**Summary:** Use **ARG** for build-time inputs (base version, build flags); use **ENV** for settings the running app needs (`APP_ENV`, ports, paths). ARG values can feed into ENV: `ARG VERSION` → `ENV APP_VERSION=$VERSION`.

## How do you handle container orchestration in multi-host Docker deployments?

Multi-host orchestration automates deployment, scaling, networking, and failover across a cluster of Docker hosts.

### Docker Swarm (native, simpler)

- Service replicas, load balancing, DNS service discovery, scaling, HA
- **Workflow:**
  1. `docker swarm init` on manager node
  2. Workers join with token from init output
  3. `docker service create --name my-service --replicas 3 my-image`
  4. `docker service scale my-service=5` to scale
  5. `docker service ls` to check status

```bash
docker swarm join --token <token> <manager-ip>:<port>
```

### Kubernetes (feature-rich, industry standard)

- Advanced scheduling, auto-scaling, self-healing, config/secrets management
- Install via Minikube, kubeadm, or managed services (GKE, AKS, EKS)
- **Workflow:** define Deployment YAML → `kubectl apply` → `kubectl scale` → `kubectl get pods/services`
- Deploy via YAML manifests:

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
name: my-deployment
spec:
replicas: 3
selector:
matchLabels:
app: my-app
template:
metadata:
labels:
app: my-app
spec:
containers:
- name: my-container
image: my-image
kubectl apply -f deployment.yaml
```

### Apache Mesos + Marathon

- Distributed resource abstraction for large-scale clusters

```bash
{
"id": "my-service",
"cmd": "my-command",
"cpus": 1,
"mem": 512,
"instances": 3
}
```

### HashiCorp Nomad

- Schedules containers and non-containerized workloads; integrates with Consul/Vault

```bash
job "my-job" {
datacenters = ["dc1"]
type = "service"
task "my-task" {
driver = "docker"
config {
image = "my-image"
}
}
}
bash
Copy code
nomad job run job.hcl
```

| Tool | Best for |
|------|----------|
| **Docker Swarm** | Simple native Docker clustering |
| **Kubernetes** | Complex, large-scale production |
| **Mesos/Marathon** | Large heterogeneous clusters |
| **Nomad** | Mixed container + legacy workloads |

Choose based on scale, complexity, and team expertise.

## Explain the use of image caching in Docker?

Docker **caches image layers** during builds. Each Dockerfile instruction creates a layer; unchanged layers are reused, speeding rebuilds.

### How layer caching works

```bash
FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y curl
COPY . /app
RUN cd /app && make
CMD ["./app"]
```

1. `FROM` — uses local image or pulls
2. `RUN apt-get update` — cached if unchanged
3. `RUN apt-get install` — cached if base + command unchanged
4. `COPY . /app` — **invalidated** when source files change
5. Subsequent layers rebuild from first changed step onward

### Cache invalidation

- **Dockerfile change** — invalidates that layer and all following layers
- **Build context change** — invalidates `COPY`/`ADD` and subsequent layers

**Example:** Changing a file in `/app` invalidates `COPY . /app` and every layer after it (`RUN make`, etc.), even if earlier `RUN apt-get` layers remain cached.

### Managing cache

Use `--no-cache` for a fresh build:

```bash
docker build --no-cache -t myapp:latest .
```

Clean unused cache:

```bash
docker system prune
```

```bash
docker image prune
```

### Optimization tips

**Order commands** — put rarely-changing steps first:

```bash
RUN apt-get update && apt-get install -y curl
```

```bash
COPY . /app
RUN cd /app && make
```

**Combine RUN commands** to reduce layers:

```bash
RUN apt-get update && \\
apt-get install -y curl && \\
```

apt-get clean

**Multi-stage builds** for lean final images:

```bash
FROM node:14 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build
```

```bash
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```

**Limit build context** with `.dockerignore`:

```bash
node_modules
*.log
.git
```

Effective caching and Dockerfile ordering dramatically reduce build times.

**Rule of thumb:** Static dependencies (OS packages, `npm install` from lockfile) before dynamic source (`COPY . .`). This maximizes cache hits on the most expensive layers.
