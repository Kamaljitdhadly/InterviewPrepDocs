# Docker Commands Important

## Questions Covered

1. What is the command to list all running Docker containers?
2. How do you start and stop a container in Docker?
3. How can you remove all stopped containers in Docker?
4. Explain how to check the logs of a running Docker container.
5. How do you get inside a running Docker container to execute commands?
6. List of instructions in dockerfile?
7. List of docker commands?
8. Details example of docker run command?
9. Details example of docker build command?
10. List of Docker Compose Commands?
11. Details example of docker compose file?

## What is the command to list all running Docker containers?

```bash
docker ps
```

Lists running containers with ID, image, command, created time, status, ports, and names.

**Options:**

```bash
docker ps -a
```

```bash
docker ps --no-trunc
```

```bash
docker ps --filter "name=mycontainer"
```

- `-a` — include stopped containers
- `--no-trunc` — full output (no truncation)
- `--filter` — filter by criteria (e.g., name)

## How do you start and stop a container in Docker?

**Start:**

```bash
docker start <container_name_or_id>
```

```bash
docker start my-container
```

```bash
docker start 3c1d2e3a4b5f
If you want to start a container and attach to it interactively, you can use:
docker start -a <container_name_or_id>
```

**Stop:**

```bash
docker stop <container_name_or_id>
```

```bash
docker stop my-container
```

```bash
docker stop 3c1d2e3a4b5f
```

`docker stop` sends **SIGTERM** (10s grace period by default), then **SIGKILL** if needed:

```bash
docker stop -t 30 <container_name_or_id>
```

**Docker Compose:**

```bash
docker-compose up
```

```bash
docker-compose up -d
```

```bash
docker-compose down
```

## How can you remove all stopped containers in Docker?

```bash
docker container prune
```

Prompts for confirmation; use `-f` to skip:

```bash
docker container prune -f
```

**Manual alternative:**

```bash
docker ps -a -q -f status=exited
```

```bash
docker rm $(docker ps -a -q -f status=exited)
```

```bash
docker rm $(docker ps -a -q -f status=exited)
```

## Explain how to check the logs of a running Docker container.

```bash
docker logs <container_name_or_id>
```

**Options:** `--tail N` (recent lines), `-f` (follow/stream), `--since` / `--until` (time range), `--timestamps`.

Examples: `docker logs --tail 100 my-container` | `docker logs -f my-container` | `docker logs --tail 100 -f my-container` | `docker logs --since 2024-09-13T12:00:00 my-container` | `docker logs --timestamps my-container`

## How do you get inside a running Docker container to execute commands?

```bash
docker exec [options] <container_name_or_id> <command>
```

**Interactive shell:**

```bash
To start an interactive shell session (such as /bin/bash or /bin/sh) inside the container, use the -it options with docker exec:
docker exec -it <container_name_or_id> /bin/bash
If /bin/bash is not available, you can use /bin/sh:
docker exec -it <container_name_or_id> /bin/sh
docker exec -it my-container /bin/bash
```

**Single command:**

```bash
To run a single command inside the container, you can omit the -it options:
docker exec <container_name_or_id> <command>
docker exec my-container ls /app
```

**As specific user:**

```bash
To run a command as a specific user, use the -u option followed by the username or UID:
docker exec -u <username_or_uid> <container_name_or_id> <command>
docker exec -u www-data my-container whoami
```

| Option | Purpose |
|--------|---------|
| `-i` | Keep STDIN open (interactive) |
| `-t` | Allocate pseudo-TTY |
| `-u` | Run as specific user |
| `--env` | Set env vars for command |

## List of instructions in dockerfile?

| # | Instruction | Purpose |
|---|-------------|---------|
| 1 | `FROM` | Base image; every Dockerfile starts here |
| 2 | `WORKDIR` | Working directory for subsequent commands |
| 3 | `COPY` | Copy files from host to container |
| 4 | `ADD` | Like COPY + archive extraction and URLs |
| 5 | `RUN` | Execute command during build (install, compile) |
| 6 | `CMD` | Default command at container start (overridable) |
| 7 | `ENTRYPOINT` | Main command (not overridden by args) |
| 8 | `EXPOSE` | Document listening port (metadata only) |
| 9 | `ENV` | Environment variables (build + runtime) |
| 10 | `ARG` | Build-time variable (`--build-arg`) |
| 11 | `VOLUME` | Mount point for external storage |
| 12 | `USER` | Run subsequent instructions as non-root |
| 13 | `LABEL` | Key-value metadata |
| 14 | `SHELL` | Override default shell for RUN |
| 15 | `STOPSIGNAL` | Signal to stop container |
| 16 | `ONBUILD` | Trigger when image used as base |
| 17 | `HEALTHCHECK` | Periodic health check command |
| 18 | `MAINTAINER` | Deprecated — use LABEL |

**Examples:**

```bash
FROM node:16-alpine
```

```bash
WORKDIR /app
```

```bash
COPY . /app
```

```bash
ADD my-archive.tar.gz /app
```

```bash
RUN npm install
```

```bash
CMD ["node", "app.js"]
```

```bash
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

```bash
EXPOSE 80
```

```bash
ENV NODE_ENV=production
```

```bash
ARG app_version=1.0
```

```bash
VOLUME /data
```

```bash
USER node
```

```bash
LABEL version="1.0" description="MyApp"
```

```bash
HEALTHCHECK CMD curl --fail http://localhost:5000/health || exit 1
```

**Full example Dockerfile:**

```bash
FROM node:16-alpine
```

```bash
WORKDIR /app
```

```bash
COPY package.json ./
RUN npm install
```

```bash
COPY . .
```

```bash
EXPOSE 3000
```

```bash
ENV NODE_ENV=production
```

```bash
CMD ["npm", "start"]
```

## List of docker commands?

### Container Management

```bash
docker run [options] IMAGE [command]
```

```bash
docker ps
```

```bash
docker ps -a
```

```bash
docker stop CONTAINER_ID/NAME
```

```bash
docker start CONTAINER_ID/NAME
```

```bash
docker rm CONTAINER_ID/NAME
```

```bash
docker exec -it CONTAINER_ID/NAME command
```

### Image Management

```bash
docker pull IMAGE_NAME
```

```bash
docker images
```

```bash
docker build -t IMAGE_NAME:TAG .
```

```bash
docker tag SOURCE_IMAGE:TAG TARGET_IMAGE:TAG
```

```bash
docker push IMAGE_NAME:TAG
```

```bash
docker rmi IMAGE_ID
```

### Volume Management

```bash
docker volume create VOLUME_NAME
```

```bash
docker volume ls
```

```bash
docker volume inspect VOLUME_NAME
```

```bash
docker volume rm VOLUME_NAME
```

### Network Management

```bash
docker network ls
```

```bash
docker network inspect NETWORK_NAME
```

```bash
docker network create NETWORK_NAME
```

```bash
docker network rm NETWORK_NAME
```

```bash
docker network connect NETWORK_NAME CONTAINER_NAME
```

```bash
docker network disconnect NETWORK_NAME CONTAINER_NAME
```

### Cleaning Up

```bash
docker volume prune
```

Also: `docker system prune` | `docker container prune` | `docker image prune`

## Details example of docker run command?

```bash
docker run -d --name my_container \\
```

-p 8080:80 \\

-e ENV_VAR=value \\

-v /host/path:/container/path \\

--network my_network \\

--restart always \\

--cpu-shares 512 \\

--memory 512m \\

--cap-add SYS_ADMIN \\

--device /dev/sda:/dev/xvda \\

--link another_container:alias \\

--log-driver json-file \\

--log-opt max-size=10m \\

--security-opt seccomp=unconfined \\

--user 1000:1000 \\

--workdir /app \\

--entrypoint /bin/bash \\

my_image:latest

| Flag | Purpose |
|------|---------|
| `-d` | Detached (background) mode |
| `--name` | Container name |
| `-p 8080:80` | Port mapping host:container |
| `-e` | Environment variables |
| `-v` | Volume/bind mount |
| `--network` | Connect to network |
| `--restart always` | Auto-restart policy |
| `--cpu-shares 512` | CPU weight (default 1024) |
| `--memory 512m` | RAM limit |
| `--cap-add` | Add Linux capabilities |
| `--device` | Map host device |
| `--link` | Link containers (deprecated; use networks) |
| `--log-driver` / `--log-opt` | Logging configuration |
| `--security-opt` | Security profile (e.g., seccomp) |
| `--user` | Run as UID:GID |
| `--workdir` | Working directory |
| `--entrypoint` | Override image entrypoint |

**Simple Nginx example:**

```bash
docker run -d --name my_nginx \\
```

-p 8080:80 \\

--memory 256m \\

nginx:latest

## Details example of docker build command?

```bash
docker build --file Dockerfile.prod \\
```

--build-arg APP_ENV=production \\

--target build-stage \\

--tag myapp:latest \\

--no-cache \\

--pull \\

--label "maintainer=you@example.com" \\

--compress \\

--memory 1g \\

--cpuset-cpus="0,1" \\

--build-arg SECRET_KEY=supersecret \\

/path/to/context

| Flag | Purpose |
|------|---------|
| `--file` | Alternate Dockerfile |
| `--build-arg` | Build-time ARG variable |
| `--target` | Multi-stage build target stage |
| `--tag` | Image name:tag |
| `--no-cache` | Disable layer cache |
| `--pull` | Always pull latest base image |
| `--label` | Image metadata |
| `--compress` | Compress build context |
| `--memory` / `--cpuset-cpus` | Resource limits during build |

**Other options:** `--squash` (single layer, experimental) | `--rm` (remove intermediate containers, default) | `--force-rm` | `--shm-size`

**Production example:**

```bash
docker build --file Dockerfile.prod \\
```

--build-arg APP_ENV=production \\

--tag myapp:prod .

**Key concepts:**

- **Build context** — files Docker accesses during build; minimize with `.dockerignore`.
- **Layer caching** — unchanged layers reused; order instructions for cache efficiency.
- **Multi-stage builds** — `--target` builds to a specific stage.
- **Build args** — available at build time only, not persisted in final image.

## List of Docker Compose Commands

| # | Command | Purpose |
|---|---------|---------|
| 1 | `docker-compose up` | Start all services (`-d` detached, `--build` rebuild, `--scale SERVICE=N`) |
| 2 | `docker-compose down` | Stop/remove containers (`--volumes`, `--remove-orphans`) |
| 3 | `docker-compose build` | Build images (`--no-cache`, `--force-rm`) |
| 4 | `docker-compose start` | Start existing stopped containers |
| 5 | `docker-compose stop` | Stop without removing |
| 6 | `docker-compose restart` | Restart services |
| 7 | `docker-compose ps` | List service status |
| 8 | `docker-compose logs` | View logs (`-f` follow, `--tail N`) |
| 9 | `docker-compose exec` | Run command in running service (`-T` no TTY) |
| 10 | `docker-compose run` | One-off command in new container (`--rm`, `--service-ports`) |
| 11 | `docker-compose config` | Validate/display config (`--services`, `--volumes`) |
| 12 | `docker-compose pull` | Pull latest images |
| 13 | `docker-compose rm` | Remove stopped containers (`-f`, `-v`) |
| 14 | `docker-compose scale` | Scale service (deprecated; use `up --scale`) |
| 15 | `docker-compose version` | Show Compose version |
| 16 | `docker-compose top` | Processes inside containers |
| 17 | `docker-compose port` | Show mapped port |
| 18 | `docker-compose events` | Real-time events |

**Command examples:**

```bash
Example:
docker-compose up -d --build
```

```bash
Example:
docker-compose down --volumes
```

```bash
Example:
docker-compose build --no-cache
```

```bash
Example:
docker-compose start
```

```bash
Example:
docker-compose stop
```

```bash
Example:
docker-compose restart
```

```bash
Example:
docker-compose ps
```

```bash
Example:
docker-compose logs -f
```

```bash
Example:
docker-compose exec SERVICE_NAME command
Example:
docker-compose exec web /bin/bash
```

```bash
Example:
docker-compose run --rm web /bin/bash
```

```bash
Example:
docker-compose config --services
```

```bash
Example:
docker-compose pull
```

```bash
Example:
docker-compose rm -f
```

```bash
Example:
docker-compose scale web=3
```

```bash
Example:
docker-compose version
```

```bash
Example:
docker-compose top
```

```bash
Example:
docker-compose port SERVICE_NAME CONTAINER_PORT
Example:
docker-compose port web 80
```

```bash
Example:
docker-compose events
```

**Workflow:**

```bash
docker-compose build
```

```bash
docker-compose up -d
```

```bash
docker-compose ps
```

```bash
docker-compose logs -f
```

```bash
docker-compose exec web /bin/bash
```

```bash
docker-compose stop
```

```bash
docker-compose down --volumes
```

## Details example of docker compose file?

Angular + .NET Core + Nginx reverse proxy stack.

**Directory structure:**

/my-project

```bash
├── docker-compose.yml
```

├── backend/ # .NET Core application

│ └── Dockerfile

├── frontend/ # Angular application

│ └── Dockerfile

└── nginx/ # Nginx reverse proxy

└── default.conf # Nginx configuration

```bash
version: '3.8'
services:
```

# Angular Frontend Service

frontend:

build:

context: ./frontend

dockerfile: Dockerfile

container_name: angular_app

ports:

```bash
- "4200:80" # Exposing Angular on port 4200 (default Angular dev server port)
```

depends_on:

- backend

networks:

- app-network

# .NET Core Backend Service

backend:

build:

context: ./backend

dockerfile: Dockerfile

container_name: dotnet_app

ports:

```bash
- "5000:80" # Exposing .NET Core API on port 5000
```

networks:

- app-network

# Nginx Proxy Service

proxy:

image: nginx:alpine

container_name: nginx_proxy

volumes:

```bash
- ./nginx/default.conf:/etc/nginx/conf.d/default.conf
```

ports:

```bash
- "80:80" # Exposing Nginx on port 80 for HTTP requests
```

depends_on:

- frontend

- backend

networks:

- app-network

# Network for inter-service communication

networks:

app-network:

driver: bridge

**Frontend Dockerfile:**

```bash
FROM node:16-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod
```

```bash
FROM nginx:alpine
COPY --from=build /app/dist/angular-app /usr/share/nginx/html
EXPOSE 80
```

**Backend Dockerfile:**

```bash
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
```

```bash
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
```

```bash
RUN dotnet build -c Release -o /app/build
```

```bash
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish
```

```bash
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

**Nginx config:**

```bash
server {
listen 80;
location / {
proxy_pass http://frontend:80; # Proxy traffic to the Angular frontend
}
location /api/ {
proxy_pass http://backend:80; # Proxy API requests to the .NET Core backend
}
}
```

**Flow:** Nginx routes `/` → Angular frontend, `/api/` → .NET backend. `docker-compose up` starts the full stack.
