# Volumes & Data Persistence

## Concept Explanation

Containers are **ephemeral** — their writable layer is destroyed when removed. To persist data (databases, uploads, logs) beyond a container's life, Docker provides three mount types:

- **Named volumes** — managed by Docker (stored under `/var/lib/docker/volumes`). The **recommended** way to persist data; portable and decoupled from the host path.
- **Bind mounts** — map a specific host directory into the container. Great for development (live code reload) but tightly coupled to the host filesystem.
- **tmpfs mounts** — stored in host memory only; gone on stop. For sensitive/temporary data.

## Code Example(s)

```bash
# Named volume — Docker manages the storage
docker volume create pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16

# Bind mount — map a host folder (great for dev)
docker run -d -v "$(pwd)/src:/app/src" myapp

# Newer --mount syntax (explicit and preferred)
docker run -d \
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data \
  postgres:16

# Inspect / clean up
docker volume ls
docker volume inspect pgdata
docker volume prune          # remove unused volumes
```

```yaml
# In docker-compose.yml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data   # named volume
volumes:
  pgdata:
```

## Interview Q&A

**🟢 Why do you need volumes in Docker?**
Because a container's filesystem is deleted when the container is removed. Volumes persist data (e.g. databases) independently of the container lifecycle.

**🟢 What's the difference between a volume and a bind mount?**
A named volume is managed by Docker and stored in Docker's area, decoupled from the host path. A bind mount maps a specific host directory into the container, tightly coupling it to the host filesystem.

**🟡 When would you use a bind mount vs a named volume?**
Bind mounts for development (live-editing source on the host) or when you need a known host path. Named volumes for production data persistence (databases) where Docker should manage storage and you want portability.

**🟡 What happens to a volume when the container using it is deleted?**
The named volume persists — it's not removed with the container. You remove it explicitly (`docker volume rm`/`prune`). Anonymous volumes may linger as dangling volumes.

**🔴 How do you share data between multiple containers?**
Mount the same named volume into multiple containers. They all read/write the same underlying storage (be mindful of concurrent-write safety and the app's locking).

## ⚠️ Tricky / Gotchas

- **`docker rm` does NOT remove named volumes** — data survives by design, but this also means orphaned volumes pile up. Use `docker volume prune` to clean up.
- **Bind mounts hide the image's contents** at that path — mounting over `/app` shadows whatever the image had there. A frequent "my files disappeared" confusion.
- **Permissions/UID mismatches** between host and container users cause "permission denied" with bind mounts, especially on Linux.
- **Volumes are host-local** by default — they don't move between hosts. For multi-node (Kubernetes/Swarm) you need networked/persistent storage drivers.
- **Anonymous volumes** (declared by `VOLUME` in a Dockerfile or `-v /path`) get random names and are easy to leak.

## 📌 Quick Recap

- Container FS is ephemeral; volumes/bind mounts persist data.
- Named volume = Docker-managed (preferred for prod/DB); bind mount = host dir (great for dev); tmpfs = in-memory.
- Named volumes survive container removal — clean up with `volume prune`.
- Bind mounts shadow the image path; watch permissions/UIDs.
- Share data by mounting the same volume into multiple containers.
- Volumes are host-local — multi-node needs networked storage.
