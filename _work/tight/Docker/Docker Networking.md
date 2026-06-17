# Docker Networking

## Questions Covered

1. What are Docker networks, and why are they important?
2. Explain the different types of Docker networks: bridge, host, none, and overlay.
3. How do you connect multiple containers using Docker networking?
4. How can you expose a port from a Docker container to the host system?
5. What is the purpose of network aliases in Docker?

## What are Docker networks, and why are they important?

**Docker networks** are virtual networks controlling how containers communicate with each other and external systems. Essential for scalable, secure containerized applications.

**Network types:**

| Type | Description | Use Case |
|------|-------------|----------|
| **Bridge** (default) | Private internal network on single host | Single-host inter-container communication |
| **Host** | Shares host's network stack (no separate IP) | Performance-sensitive apps bypassing virtualization |
| **Overlay** | Spans multiple Docker hosts | Docker Swarm, multi-host Compose |
| **Macvlan** | Unique MAC per container; appears as physical device | Legacy apps needing direct network access |
| **None** | All networking disabled | Security isolation, networkless containers |

**Create/run examples:**

```bash
docker network create --driver bridge my-bridge-network
```

```bash
docker run --network host <image>
```

```bash
docker network create --driver overlay my-overlay-network
```

```bash
docker network create --driver macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 my-macvlan-network
```

```bash
docker run --network none <image>
```

**Why networks matter:**

1. **Isolation & security** — separate container groups; limit attack surface.
2. **Inter-container communication** — service discovery by container name; internal DNS.
3. **Flexibility** — custom IP ranges, subnets; containers on multiple networks.
4. **Scalability** — overlay networks for distributed/microservice deployments.
5. **Ease of use** — built-in DNS; Compose integration for multi-container apps.

## Explain the different types of Docker networks: bridge, host, none, and overlay.

### Bridge Network

Default driver. Private internal network on a single host. Containers communicate by name; ports exposed to host via `-p`.

```bash
docker network create --driver bridge my-bridge-network
```

```bash
docker run --network bridge --name my-container -d my-image
```

### Host Network

Container shares the host's IP and network interfaces directly. Better performance, no network isolation.

```bash
docker run --network host my-image
```

```bash
docker run --network host --name my-container -d my-image
```

### None Network

Disables all networking. Container has no network access.

```bash
docker run --network none my-image
```

```bash
docker run --network none --name my-container -d my-image
```

### Overlay Network

Spans multiple Docker hosts. Used in Swarm or Kubernetes for distributed apps.

```bash
docker network create --driver overlay my-overlay-network
```

```bash
docker service create --name my-service --network my-overlay-network my-image
```

| Network | Isolation | Multi-host | Performance |
|---------|-----------|------------|-------------|
| Bridge | Yes (single host) | No | Good |
| Host | No (shares host) | No | Best |
| None | Complete | No | N/A |
| Overlay | Yes | Yes | Good |

## How do you connect multiple containers using Docker networking?

### Bridge (same host)

```bash
docker network create --driver bridge my-bridge-network
```

```bash
docker run --network my-bridge-network --name container1 -d my-image
docker run --network my-bridge-network --name container2 -d my-image
```

Containers resolve each other by name:

```bash
docker exec -it container1 ping container2
```

### Host network

```bash
docker run --network host --name container1 -d my-image
docker run --network host --name container2 -d my-image
```

Containers share the host IP and communicate via host network interfaces.

### Overlay (multi-host)

```bash
docker network create --driver overlay my-overlay-network
```

Swarm:

```bash
docker service create --name my-service1 --network my-overlay-network my-image
docker service create --name my-service2 --network my-overlay-network my-image
```

Compose:

```bash
version: '3'
services:
app1:
image: my-image
networks:
- my-overlay-network
app2:
image: my-image
networks:
- my-overlay-network
networks:
my-overlay-network:
driver: overlay
```

Containers across hosts communicate using service names (e.g., `app1` reaches `app2`).

### Macvlan

```bash
docker network create --driver macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 my-macvlan-network
```

```bash
docker run --network my-macvlan-network --name container1 --ip 192.168.1.10 -d my-image
docker run --network my-macvlan-network --name container2 --ip 192.168.1.11 -d my-image
```

Each container appears as a separate device with a unique IP.

## How can you expose a port from a Docker container to the host system?

Use **`-p` / `--publish`** to map host ports to container ports:

```bash
docker run -p <host_port>:<container_port> <image>
```

**Basic mapping:**

```bash
docker run -p 8080:80 my-image
```

Access via `http://localhost:8080`.

**Multiple ports:**

```bash
docker run -p 8080:80 -p 443:443 my-image
```

**Specific host IP:**

```bash
docker run -p 192.168.1.100:8080:80 my-image
```

**TCP/UDP protocols** (default is TCP):

```bash
docker run -p 8080:80/tcp -p 9090:90/udp my-image
```

**Docker Compose:**

```bash
version: '3'
services:
```

web:

image: my-image

ports:

```bash
- "8080:80"
- "443:443"
```

**Verify:** `docker ps` shows port mappings in the PORTS column.

```bash
docker ps
```

## What is the purpose of network aliases in Docker?

**Network aliases** assign alternative DNS names to containers/services within a Docker network — simplifying service discovery and configuration.

**Benefits:**

- Multiple names for one container/service
- Compatibility with systems expecting specific hostnames
- Cleaner Compose configs and reduced renaming

**Compose example:**

```bash

```

```bash
version: '3'
services:
```

web:

image: my-web-image

networks:

my-network:

aliases:

- web-alias1

- web-alias2

networks:

my-network:

driver: bridge

Other services reach `web` via `web-alias1` or `web-alias2`.

**CLI example:**

```bash
docker run --network my-network --network-alias web-alias1 --network-alias web-alias2 my-web-image
```

Aliases enable flexible service discovery without changing container names.
