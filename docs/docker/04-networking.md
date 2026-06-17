# Networking

## Concept Explanation

Docker networking lets containers talk to each other, the host, and the outside world. The main **network drivers**:

- **bridge** (default) — containers on the same user-defined bridge network can reach each other by **container name** (built-in DNS). The default `bridge` network requires `--link` (legacy) or IPs; a **user-defined bridge** gives automatic name resolution.
- **host** — the container shares the host's network stack directly (no isolation, no port mapping needed). Linux-only, high performance.
- **none** — no networking.
- **overlay** — connects containers across **multiple hosts** (Swarm/Kubernetes-style clustering).

**Port mapping** (`-p host:container`) exposes a container port to the host so external clients can reach it.

## Code Example(s)

```bash
# Create a user-defined bridge so containers resolve each other by name
docker network create app-net

docker run -d --name db --network app-net postgres:16
docker run -d --name api --network app-net -p 8080:80 myapi

# Inside the "api" container, connect to the DB simply as host "db":
#   ConnectionString = "Host=db;Port=5432;..."   ← DNS resolves "db"
```

```bash
docker network ls                  # list networks
docker network inspect app-net     # see connected containers + IPs
docker run --network host nginx    # share host network (Linux)
```

```yaml
# Compose puts all services on one network automatically → resolve by service name
services:
  api:
    build: .
    ports: ["8080:80"]
  db:
    image: postgres:16
# api can reach db at hostname "db"
```

## Interview Q&A

**🟢 How do two containers communicate with each other?**
Put them on the same user-defined bridge (or Compose) network; Docker's built-in DNS lets them reach each other by container/service name. Across hosts, use an overlay network.

**🟢 What does `-p 8080:80` mean?**
It maps host port 8080 to container port 80 — traffic to the host's 8080 is forwarded into the container's 80. Format is `host:container`.

**🟡 What's the difference between the default bridge and a user-defined bridge?**
The default `bridge` doesn't provide automatic DNS resolution between containers (you'd need IPs or legacy `--link`). A user-defined bridge gives automatic name-based DNS resolution and better isolation — always prefer it.

**🟡 When would you use `host` networking?**
When you need maximum network performance or the container must use host ports directly without mapping (Linux only). The trade-off is no network isolation and potential port conflicts.

**🔴 How does container-to-container communication work across multiple hosts?**
Using an **overlay** network, which creates a virtual network spanning hosts (via VXLAN tunneling). This is how Docker Swarm and similar clustering connect services on different machines.

## ⚠️ Tricky / Gotchas

- **The default `bridge` network has no automatic DNS** — `docker run` two containers on it and they *can't* resolve each other by name. Use a user-defined network (or Compose, which makes one for you).
- **`localhost` inside a container is the container itself**, not the host or another container. To reach the host from a container use `host.docker.internal` (Docker Desktop) or the host's IP.
- **Publishing vs exposing:** `EXPOSE` only documents; you must `-p` to actually publish. And published ports bind on the host — watch for conflicts.
- **Connecting services by `localhost`** between containers is a classic bug — use the service/container name on a shared network.
- **`host` networking is Linux-only** and behaves differently on Docker Desktop (Mac/Windows run a Linux VM).

## 📌 Quick Recap

- Drivers: bridge (default, single host), host (shares host stack), none, overlay (multi-host).
- User-defined bridge → automatic DNS by container/service name (default bridge does not).
- `-p host:container` publishes a port to the host.
- Inside a container, `localhost` = that container; use service names to reach peers.
- Use `host.docker.internal` to reach the host from a container (Docker Desktop).
- Overlay networks connect containers across hosts (Swarm/clusters).
