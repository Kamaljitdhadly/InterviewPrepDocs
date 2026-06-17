# Layers, Caching & Multi-Stage Builds

## Concept Explanation

A Docker image is built from **layers** — each instruction in a Dockerfile (`FROM`, `COPY`, `RUN`, ...) creates a new **read-only layer** stacked on the previous ones. Layers are **cached**: if a layer and everything before it is unchanged, Docker reuses the cache instead of rebuilding, making builds fast.

**Build cache invalidation** is sequential: when one layer changes, that layer and **all layers after it** are rebuilt. So instruction *order* matters — put rarely-changing steps (dependency install) before frequently-changing steps (copying source code).

**Multi-stage builds** use multiple `FROM` stages so you can build in a heavy SDK image but ship only the small runtime output — dramatically shrinking the final image and excluding build tools.

## Code Example(s)

```dockerfile
# Multi-stage build for a .NET app
# Stage 1: build (heavy SDK image)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .                 # copy project file FIRST (changes rarely)
RUN dotnet restore               # cached unless .csproj changes
COPY . .                         # copy the rest of the source
RUN dotnet publish -c Release -o /app

# Stage 2: runtime (small image — no SDK, no source)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .         # copy ONLY the published output
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

```dockerfile
# Layer-order optimization for Node (same principle)
COPY package*.json ./
RUN npm ci            # cached unless package.json changes
COPY . .              # source changes here don't bust the npm layer
```

## Interview Q&A

**🟢 What is a Docker image layer?**
Each Dockerfile instruction produces a read-only layer; the image is the stack of those layers. Layers are shared and cached across images and builds.

**🟢 What is a multi-stage build and why use it?**
A Dockerfile with multiple `FROM` stages where you build in one stage and copy only the needed artifacts into a clean, smaller final stage. It reduces image size and removes build tools/secrets from the shipped image.

**🟡 How does build caching work and how do you optimize it?**
Docker reuses cached layers if the instruction and prior layers are unchanged. Optimize by ordering instructions from least- to most-frequently changing — e.g. copy dependency manifests and install before copying source code.

**🟡 Why copy `package.json`/`.csproj` before the rest of the code?**
So the dependency-install layer is cached and only re-runs when dependencies change, not on every source code edit — saving significant build time.

**🔴 How can you reduce Docker image size?**
Use multi-stage builds, slim/alpine/distroless base images, combine `RUN` commands to reduce layers, clean up package caches in the same layer, and use a `.dockerignore` to avoid copying unnecessary files.

## ⚠️ Tricky / Gotchas

- **Cache busting from bad ordering:** putting `COPY . .` before `RUN npm install` means every code change re-runs the install — slow builds. Order matters.
- **Cleaning up in a separate `RUN` doesn't shrink the image.** Each `RUN` is its own layer; deleting files in a later layer leaves them in the earlier one. Clean up in the *same* `RUN`:

```dockerfile
RUN apt-get update && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*   # same layer → actually smaller
```

- **`.dockerignore` is essential** — without it, `COPY . .` may copy `node_modules`, `.git`, secrets, and bust the cache on irrelevant changes.
- **`latest` tag isn't "always newest"** at build — it's just a tag; pin versions for reproducible builds.
- **Secrets in layers persist** — `COPY`ing a secret then deleting it leaves it in an earlier layer. Use build secrets / multi-stage instead.

## 📌 Quick Recap

- Each instruction = a cached, read-only layer; image = stacked layers.
- Cache invalidates from the changed layer onward → order least-changing first.
- Copy dependency manifests + install before copying source.
- Multi-stage builds: build in SDK image, ship only runtime output (small + clean).
- Shrink images: multi-stage, slim/distroless bases, combined `RUN` cleanup, `.dockerignore`.
- Deleting files in a later layer doesn't reduce size; clean in the same `RUN`.
