# Images, Containers & the Dockerfile

## Concept Explanation

**Docker** packages an application and its dependencies into a portable, isolated unit so it runs the same everywhere.

- **Image** — a read-only **template/blueprint** built from a `Dockerfile`. It contains the OS libs, runtime, app code, and config. Images are immutable and versioned by tags.
- **Container** — a **running instance** of an image. It adds a thin writable layer on top of the image. You can run many containers from one image.
- **Dockerfile** — a recipe of instructions (`FROM`, `RUN`, `COPY`, `CMD`, ...) used by `docker build` to create an image.

> Analogy: an **image is a class**, a **container is an object** (instance). The Dockerfile is the source code that compiles into the class.

Containers share the host **OS kernel** (unlike VMs which run a full guest OS), making them lightweight and fast to start.

## Code Example(s)

```dockerfile
# Dockerfile for a .NET app
FROM mcr.microsoft.com/dotnet/aspnet:8.0      # base image
WORKDIR /app                                   # working directory inside the image
COPY ./publish .                               # copy build output in
EXPOSE 8080                                    # document the port
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "MyApp.dll"]             # process that runs when container starts
```

```bash
docker build -t myapp:1.0 .          # build image from Dockerfile
docker run -d -p 8080:8080 myapp:1.0 # run a container (detached, map host:container port)
docker ps                            # list running containers
docker exec -it <id> /bin/bash       # shell into a running container
docker stop <id> && docker rm <id>   # stop and remove
docker images                        # list images
```

## Interview Q&A

**🟢 What is the difference between an image and a container?**
An image is a read-only template (the blueprint); a container is a running instance of an image with a writable layer. One image → many containers.

**🟢 How is a container different from a virtual machine?**
A container shares the host OS kernel and isolates at the process level (lightweight, seconds to start). A VM runs a full guest OS on a hypervisor (heavier, minutes to boot). Containers are more efficient; VMs offer stronger isolation.

**🟡 What's the difference between `CMD` and `ENTRYPOINT`?**
`ENTRYPOINT` sets the executable that always runs; `CMD` provides default arguments (or a default command) that can be overridden at `docker run`. Often combined: `ENTRYPOINT` = the program, `CMD` = default args.

**🟡 What's the difference between `COPY` and `ADD`?**
Both copy files into the image. `ADD` also auto-extracts local tar archives and can fetch URLs. Best practice: prefer `COPY` for clarity; use `ADD` only when you need its extra features.

**🔴 What happens to data written inside a container when it's removed?**
The container's writable layer is deleted with it — data is lost. To persist data, use **volumes** or **bind mounts**. This is why containers should be stateless.

## ⚠️ Tricky / Gotchas

- **`RUN` vs `CMD` vs `ENTRYPOINT`:** `RUN` executes at **build time** (creating a layer); `CMD`/`ENTRYPOINT` define what runs at **container start**. Confusing these is common.
- **Shell vs exec form:** `CMD echo hi` (shell form) runs via `/bin/sh -c` and doesn't forward signals well; `CMD ["echo", "hi"]` (exec form) is preferred so `SIGTERM` reaches your process for graceful shutdown.
- **Containers are ephemeral** — anything written to the container filesystem vanishes on removal. Don't store state there.
- **`EXPOSE` doesn't publish a port** — it's documentation. You still need `-p host:container` to actually map it.
- **One main process per container** — Docker tracks PID 1; if it exits, the container stops. Don't try to run multiple services in one container.

## 📌 Quick Recap

- Image = read-only blueprint; Container = running instance (image + writable layer).
- Containers share the host kernel (lightweight); VMs run a full guest OS.
- Dockerfile instructions: `FROM`, `WORKDIR`, `COPY`, `RUN` (build time), `CMD`/`ENTRYPOINT` (start time).
- `ENTRYPOINT` = program, `CMD` = default args; prefer exec form `["..."]`.
- Container filesystem is ephemeral → use volumes for persistence.
- `EXPOSE` documents; `-p` actually publishes a port.
