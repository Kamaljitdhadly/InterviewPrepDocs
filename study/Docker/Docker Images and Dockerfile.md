# Docker Images and Dockerfile

## Questions Covered

1. What is a Dockerfile, and how is it used?
2. What are Docker image layers, and how do they work?
3. How do you build a Docker image from a Dockerfile?
4. What is the purpose of the COPY and ADD commands in a Dockerfile?
5. How do the ENTRYPOINT and CMD instructions differ in a Dockerfile?
6. Explain the use of multi-stage builds in Docker.

## What is a Dockerfile, and how is it used?

A **Dockerfile** is a text file of instructions that Docker uses to build an image — defining the environment and configuration for running an application in a container.

**Example — .NET application:**

```bash
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
```

```bash
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
This uses the .NET SDK image, which includes the tools necessary to build .NET applications. The AS build part names this stage "build."
```

```bash
WORKDIR /app
# Copy the .csproj file and restore any dependencies (via `dotnet restore`)
COPY src/MyApp/MyApp.csproj ./src/MyApp/
RUN dotnet restore src/MyApp/MyApp.csproj
```

```bash
COPY src/MyApp/MyApp.csproj ./src/MyApp/
RUN dotnet restore src/MyApp/MyApp.csproj
```

```bash
COPY src/ ./src/
```

```bash
COPY src/ ./src/
RUN dotnet publish src/MyApp/MyApp.csproj -c Release -o /app/publish
```

```bash
RUN dotnet publish src/MyApp/MyApp.csproj -c Release -o /app/publish
```

```bash
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
```

```bash
WORKDIR /app
```

```bash
COPY --from=build /app/publish .
```

```bash
EXPOSE 80
```

```bash
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image; `AS build` names a stage |
| `WORKDIR` | Sets working directory |
| `COPY` + `RUN` | Copy project file, restore deps, build/publish |
| `FROM ... AS runtime` | Smaller runtime-only image |
| `COPY --from=build` | Copy artifacts from build stage |
| `EXPOSE` | Documents listening port (does not publish) |
| `ENTRYPOINT` | Command executed on container start |

**Per-instruction blocks (runtime stage):**

```bash
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
```

```bash
WORKDIR /app
```

```bash
COPY --from=build /app/publish .
```

```bash
EXPOSE 80
```

```bash
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

**Usage:**

```bash
docker build -t my-dotnet-app .
```

```bash
docker run -d -p 8080:80 my-dotnet-app
```

## What are Docker image layers, and how do they work?

Each Dockerfile instruction (`RUN`, `COPY`, `ADD`) creates a **new immutable layer**. Layers stack via a union filesystem (OverlayFS) into a single view.

**Structure:** base layer → intermediate layers → top writable layer (copy-on-write for container changes).

**Example:**

```bash
For example, given the following Dockerfile:
FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y curl
COPY myapp /app
```

```bash
FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y curl
COPY myapp /app
```

| Layer | Instruction |
|-------|-------------|
| 1 | `FROM ubuntu:20.04` |
| 2 | `RUN apt-get update` |
| 3 | `RUN apt-get install -y curl` |
| 4 | `COPY myapp /app` |

**Key concepts:**

- **Caching** — unchanged layers are reused; changing `COPY` invalidates that layer and all subsequent ones.
- **Sharing** — common layers are shared across images, saving disk space.
- **Read-only** — all layers except the container's writable top layer are read-only.

Optimize builds by ordering instructions from least to most frequently changed.

## How do you build a Docker image from a Dockerfile?

```bash
The basic syntax for the docker build command is:
docker build -t <image-name>:<tag> .
```

```bash
docker build -t <image-name>:<tag> .
```

- `-t` — tag (defaults to `latest` if omitted).
- `.` — build context (directory with Dockerfile and files).

**Example:**

```bash
docker build -t my-app:1.0 .
```

Verify:

```bash
Once the build completes, you can verify that the image was created by listing the available images:
docker images
```

`docker images`

**Example Dockerfile:**

```bash
FROM node:14
```

```bash
WORKDIR /usr/src/app
```

```bash
COPY package*.json ./
RUN npm install
```

```bash
COPY . .
```

```bash
EXPOSE 3000
```

```bash
CMD ["node", "app.js"]
```

```bash
docker build -t my-node-app:latest .
```

**Options:**

```bash
docker build -t my-app:1.0 /path/to/context
```

```bash
docker build --build-arg VERSION=1.0 -t my-app:1.0 .
```

```bash
docker build --no-cache -t my-app:1.0 .
```

Use `.dockerignore` to minimize build context size.

## What is the purpose of the COPY and ADD commands in a Dockerfile?

Both transfer files from the build context into the image.

### COPY

```bash
COPY <source> <destination>
```

Simple file/directory copy — no extraction, no URLs.

```bash
COPY ./app /usr/src/app
```

```bash
COPY ./config.json /usr/src/app/config.json
```

### ADD

```bash
ADD <source> <destination>
```

Same as COPY plus: auto-extracts archives (`.tar`, `.tar.gz`) and supports remote URLs.

```bash
ADD ./archive.tar.gz /usr/src/app/
```

```bash
ADD ./data.tar.gz /data/
```

| Feature | COPY | ADD |
|---------|------|-----|
| File copy | Yes | Yes |
| Archive extraction | No | Yes |
| Remote URLs | No | Yes |
| Recommended default | **Yes** | Only when extraction/URL needed |

Prefer **COPY** for predictability; use **ADD** only when you need extraction or URL fetching.

## How do the ENTRYPOINT and CMD instructions differ in a Dockerfile?

Both specify what runs when a container starts, but behave differently.

### ENTRYPOINT

Fixed main command — **not overridden** by runtime arguments.

```bash
ENTRYPOINT ["executable", "param1", "param2"]
or
ENTRYPOINT command param1 param2
```

```bash
ENTRYPOINT ["nginx", "-g", "daemon off;"]
This sets nginx as the command that will always run when the container starts, with -g "daemon off;" as an argument.
```

### CMD

Default arguments for ENTRYPOINT, or the command itself if no ENTRYPOINT. **Overridable** at runtime.

```bash
CMD ["param1", "param2"]
or
CMD command param1 param2
```

```bash
CMD ["nginx", "-g", "daemon off;"]
This sets nginx -g "daemon off;" as the command to run when the container starts, but it can be overridden at runtime.
```

### Combined usage

```bash
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
In this example:
```

Runs `nginx -g "daemon off;"` by default; runtime args override CMD only.

### Overriding behavior

```bash
docker run my-image /bin/sh
This command will run /bin/sh instead of the default nginx -g "daemon off;" because CMD arguments are overridden, but the ENTRYPOINT (nginx) is not.
```

```bash
CMD ["nginx", "-g", "daemon off;"]
Running the container without specifying any command will execute the default nginx -g "daemon off;", but you can override it:
docker run my-image /bin/sh
```

| Instruction | Overridable | Role |
|-------------|-------------|------|
| ENTRYPOINT | No | Main executable |
| CMD | Yes | Default args or standalone command |

## Explain the use of multi-stage builds in Docker.

**Multi-stage builds** use multiple `FROM` instructions to separate build and runtime environments — producing smaller, more secure final images.

**How it works:**

1. Early stages use full SDK/toolchain images to compile/build.
2. Final stage uses a minimal runtime image.
3. `COPY --from=<stage>` transfers only built artifacts.

**Example — .NET:**

```bash
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
```

```bash
WORKDIR /app
```

```bash
COPY *.csproj ./
RUN dotnet restore
```

```bash
COPY . ./
```

```bash
RUN dotnet publish -c Release -o /app/publish
```

```bash
FROM mcr.microsoft.com/dotnet/aspnet:7.0
```

```bash
WORKDIR /app
```

```bash
COPY --from=build /app/publish .
```

```bash
EXPOSE 80
```

```bash
ENTRYPOINT ["dotnet", "YourApp.dll"]
```

**Benefits:**

| Benefit | Description |
|---------|-------------|
| Smaller images | Build tools excluded from final image |
| Security | Reduced attack surface |
| Performance | Faster pulls and deploys |
| Maintainability | Clear separation of build vs runtime |

Build a specific stage: `docker build --target build-stage -t myapp:build .`
