# Docker Compose

## Questions Covered

1. What is Docker Compose, and how does it work?
2. How do you define services in a docker-compose.yml file?
3. How do you scale services using Docker Compose?
4. Explain the difference between docker-compose up and docker-compose run.
5. How can you restart services automatically in Docker Compose?

## What is Docker Compose, and how does it work?

**Docker Compose** defines and runs multi-container applications from a single `docker-compose.yml` YAML file. One command manages services, networks, and volumes.

**Key features:** declarative configuration, multi-container deployment, service orchestration, centralized environment management.

**Workflow:**

1. Define `docker-compose.yml` with services, networks, and volumes.
2. Use the Compose CLI to build, start, stop, and scale.

```bash

```

```bash
version: '3.8'
services:
```

web:

image: nginx:latest

ports:

```bash
- "8080:80"
```

volumes:

```bash
- ./html:/usr/share/nginx/html
```

networks:

- mynetwork

app:

image: myapp:latest

build:

context: ./app

environment:

- ENV=production

networks:

- mynetwork

networks:

mynetwork:

driver: bridge

volumes:

mydata:

- **version** — Compose file format version.
- **services** — containers to create (`web`: Nginx on 8080; `app`: custom build with env vars).
- **networks** — bridge network for inter-service communication.
- **volumes** — named volumes for persistent storage.

**Common commands:**

```bash
docker-compose up
```

```bash
docker-compose up -d
Runs the services in the background.
```

```bash
docker-compose down
```

```bash
docker-compose logs
Displays the logs for all services.
```

```bash
docker-compose build
```

```bash
docker-compose up --scale web=3
```

**Use cases:** development environments, reproducible testing, multi-tier apps (web + DB + cache).

**Advantages:** simplified configuration, efficient management, reproducibility across environments, isolated dev/test/prod stacks.

## How do you define services in a docker-compose.yml file?

Each service under `services:` maps to one container. Common keys:

| Key | Purpose |
|-----|---------|
| `image` | Docker image to run |
| `build` | Build from Dockerfile (`context`, `dockerfile`) |
| `ports` | `"host:container"` port mappings |
| `volumes` | Host paths or named volumes |
| `environment` | Env vars |
| `networks` | Networks to join |
| `depends_on` | Startup order dependencies |
| `restart` | Restart policy |
| `logging` | Log driver and options |
| `command` | Override image default command |

**Example — web + database:**

```bash
version: '3.8'
services:
```

web:

image: nginx:latest

ports:

```bash
- "8080:80"
```

volumes:

```bash
- ./html:/usr/share/nginx/html
```

networks:

- webnet

db:

image: postgres:13

environment:

POSTGRES_DB: mydatabase

POSTGRES_USER: myuser

POSTGRES_PASSWORD: mypassword

volumes:

```bash
- dbdata:/var/lib/postgresql/data
```

networks:

- webnet

networks:

webnet:

driver: bridge

volumes:

dbdata:

**Service configuration details:**

1. **Service name** — unique identifier referenced within Compose (`web`, `db`):

```bash
Each service is given a name (web and db in the example). This name is used to reference the service within the Docker Compose configuration.
```

2. **Image** — existing or registry image:

```bash
image: nginx:latest
```

3. **Build** — build from local Dockerfile:

```bash
The build key specifies the configuration for building an image from a Dockerfile. This can include the context (directory) and Dockerfile location.
build:
context: ./app
dockerfile: Dockerfile.dev
```

4. **Ports** — `"host_port:container_port"`:

```bash
ports:
- "8080:80"
```

5. **Volumes** — bind mounts or named volumes:

```bash
volumes:
- ./html:/usr/share/nginx/html
volumes:
- dbdata:/var/lib/postgresql/data
```

6. **Environment:**

```bash
environment:
POSTGRES_DB: mydatabase
POSTGRES_USER: myuser
POSTGRES_PASSWORD: mypassword
```

7. **Networks:**

```bash
networks:
- webnet
```

8. **Depends_on** — ensures dependency starts first:

```bash
depends_on:
- db
```

**Advanced:** `restart: always`; `command` to override the image default.

```bash
Configure logging options for services.
logging:
driver: "json-file"
options:
max-size: "10m"
max-file: "3"
```

## How do you scale services using Docker Compose?

Use `--scale` with `docker-compose up` to run multiple instances of a service:

```bash
docker-compose up --scale service_name=num_instances
```

Example — 3 web containers in detached mode:

```bash
docker-compose up -d --scale web=3
```

Compose creates multiple containers for that service. Scaling is **per-service on a single host**; for multi-host scaling use Docker Swarm or Kubernetes.

## Explain the difference between docker-compose up and docker-compose run.

| Aspect | `docker-compose up` | `docker-compose run` |
|--------|---------------------|----------------------|
| Scope | Starts **all** services | Runs a **one-off command** for one service |
| Containers | Creates/starts all; recreates on config changes | Creates a **new** container for the command |
| Dependencies | Manages networking and dependencies | Does **not** start other services |
| Detached | `-d` for background | `-it` for interactive shells |
| Scaling | Supports `--scale` | N/A |
| Use case | Start full application stack | Migrations, debugging, ad-hoc tasks |

**`docker-compose up`:**

```bash
docker-compose up
```

```bash
docker-compose up -d
```

```bash
docker-compose up --scale service_name=num_instances
```

**`docker-compose run`:**

```bash
docker-compose run service_name command
```

```bash
docker-compose run -it service_name command
```

Interactive shell example:

```bash
docker-compose run -it web /bin/bash
```

Creates a new `web` container with a Bash shell; other services are not started.

## How can you restart services automatically in Docker Compose?

Set the **`restart`** policy per service in `docker-compose.yml`:

| Policy | Behavior |
|--------|----------|
| `no` | Default — no auto-restart |
| `always` | Always restart unless manually stopped |
| `unless-stopped` | Restart unless explicitly stopped by user |
| `on-failure[:max]` | Restart only on non-zero exit; optional retry limit |

**Example:**

```bash
version: '3.8'
services:
```

web:

image: nginx:latest

ports:

```bash
- "8080:80"
```

restart: always

app:

image: myapp:latest

build:

context: ./app

restart: on-failure:5

db:

image: postgres:13

environment:

POSTGRES_DB: mydatabase

POSTGRES_USER: myuser

POSTGRES_PASSWORD: mypassword

restart: unless-stopped

- **web** — `always`: always running.
- **app** — `on-failure:5`: retry up to 5 times on failure.
- **db** — `unless-stopped`: keeps running unless manually stopped.

Supported in Compose file versions 2 and 3. Manual restart: `docker-compose restart <service_name>`.
