# Registries, Tags & Image Management

## Concept Explanation

A **registry** is a service that stores and distributes Docker images (like a package repository for containers). **Docker Hub** is the default public registry; others include **Azure Container Registry (ACR)**, **Amazon ECR**, **GitHub Container Registry**, and private/self-hosted registries.

An image reference has the form:
```
[registry/]repository:tag
myregistry.azurecr.io/myapp:1.2.3
```
- **Repository** — the named image (e.g. `myapp`).
- **Tag** — a label for a version (e.g. `1.2.3`, `latest`). Tags are mutable pointers; a **digest** (`@sha256:...`) is an immutable content hash.

`docker push`/`pull` move images between your machine and a registry. Authentication via `docker login`.

## Code Example(s)

```bash
# Tag, login, push to a registry
docker build -t myapp:1.2.3 .
docker tag myapp:1.2.3 myregistry.azurecr.io/myapp:1.2.3

docker login myregistry.azurecr.io      # authenticate
docker push myregistry.azurecr.io/myapp:1.2.3
docker pull myregistry.azurecr.io/myapp:1.2.3

# Pull by immutable digest (reproducible, can't be moved)
docker pull myapp@sha256:9f8b...c21
```

```bash
# Common housekeeping
docker images                 # list local images
docker rmi myapp:1.2.3        # remove an image
docker image prune            # remove dangling images
docker system df              # disk usage by images/containers/volumes
docker system prune -a        # aggressive cleanup (careful!)
```

## Interview Q&A

**🟢 What is a Docker registry?**
A storage and distribution service for Docker images. Docker Hub is the default public one; ACR/ECR/private registries are alternatives.

**🟢 What is an image tag?**
A human-readable label identifying a version of an image within a repository (e.g. `myapp:1.2.3`). If omitted, Docker uses `latest`.

**🟡 What's the difference between a tag and a digest?**
A tag is a mutable pointer that can be reassigned to different images over time. A digest (`@sha256:...`) is an immutable cryptographic hash of the exact image content — pulling by digest is fully reproducible.

**🟡 Why is relying on the `latest` tag risky?**
`latest` is just a conventional tag, not "newest"; it can point to different images at different times, breaking reproducibility and causing "works on my machine" issues. Pin explicit versions (or digests) for deployments.

**🔴 How do you secure access to a private registry?**
Use authentication (`docker login` with credentials/tokens), role-based access, scoped pull/push tokens, image signing/scanning, and in cloud setups use managed identities (e.g. AKS pulling from ACR via managed identity) instead of long-lived passwords.

## ⚠️ Tricky / Gotchas

- **`latest` doesn't mean newest** — it's a default tag. An image without `:latest` pushed later won't update `latest` unless you tag it so.
- **Re-pushing the same tag** silently changes what that tag points to — consumers pulling `myapp:1.0` may get different content. Use immutable tags or digests for safety.
- **Untagged "dangling" images** (`<none>`) accumulate from rebuilds and eat disk — prune regularly.
- **`docker system prune -a` is destructive** — it removes all unused images (not just dangling), which can delete images you wanted to keep.
- **Rate limits**: Docker Hub throttles anonymous pulls; in CI you may hit limits — authenticate or use a mirror/private registry.

## 📌 Quick Recap

- Registry = image store/distribution (Docker Hub, ACR, ECR, private).
- Reference = `registry/repository:tag`; `latest` is the default tag, not "newest".
- Tags are mutable pointers; digests (`@sha256`) are immutable — pin for reproducibility.
- `login` → `push`/`pull`; prune dangling images and watch disk usage.
- `system prune -a` is aggressive; secure private registries with auth/managed identities.
