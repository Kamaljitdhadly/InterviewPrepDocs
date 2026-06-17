# Docker Compose

## Concept Explanation

**Docker Compose** defines and runs **multi-container applications** with a single YAML file (`docker-compose.yml`) and one command (`docker compose up`). Instead of long `docker run` commands, you declare your **services**, **networks**, and **volumes** declaratively.

Compose automatically:
- Creates a shared network so services resolve each other by **service name**.
- Manages startup/teardown of the whole stack.
- Supports **environment variables**, **dependencies** (`depends_on`), **build** vs **image**, and scaling.

It's ideal for **local development** and small deployments; for production clustering you'd use Kubernetes or Swarm.

## Code Example(s)

```yaml
# docker-compose.yml
services:
  api:
    build: ./api                 # build from a Dockerfile
    ports:
      - "8080:80"
    environment:
      - ConnectionStrings__Default=Host=db;Database=app;Username=postgres;Password=secret
    depends_on:
      db:
        condition: service_healthy   # wait until db is healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

volumes:
  pgdata:
```

```bash
docker compose up -d         # start the whole stack (detached)
docker compose ps            # status
docker compose logs -f api   # follow logs for one service
docker compose down          # stop & remove containers + network
docker compose down -v       # also remove named volumes
docker compose up --build    # rebuild images
```

## Interview Q&A

**🟢 What is Docker Compose used for?**
To define and run multi-container applications declaratively in one YAML file, starting/stopping the whole stack with a single command. Great for local dev.

**🟢 How do services in a Compose file talk to each other?**
Compose creates a shared network; services reach each other by their **service name** as the hostname (e.g. `api` connects to `db` at host `db`).

**🟡 What does `depends_on` actually guarantee?**
By default only **start order**, not readiness — it waits for the container to *start*, not for the app inside to be *ready*. Use `condition: service_healthy` with a healthcheck (or app-level retries) to wait for actual readiness.

**🟡 Difference between `docker compose down` and `stop`?**
`stop` halts containers but keeps them, the network, and volumes. `down` stops and **removes** containers and the default network (add `-v` to also remove named volumes).

**🔴 Is Docker Compose suitable for production?**
For simple single-host deployments it can work, but it lacks self-healing, autoscaling, rolling updates across nodes, and multi-host scheduling. For production at scale, use Kubernetes (or Swarm).

## ⚠️ Tricky / Gotchas

- **`depends_on` ≠ "wait until ready".** The classic bug: the API starts before the DB is accepting connections and crashes. Add a healthcheck + `condition: service_healthy`, or implement connection retries in the app.
- **Environment variable nesting:** in .NET, `ConnectionStrings__Default` (double underscore) maps to `ConnectionStrings:Default` — a common source of "config not picked up" confusion.
- **`docker compose down -v` deletes your data** by removing named volumes — easy to wipe a dev database accidentally.
- **Rebuild needed after Dockerfile changes:** `up` alone may reuse the old image; use `--build`.
- **Compose v1 (`docker-compose`) vs v2 (`docker compose`)** — newer Docker uses the plugin (`docker compose`, no hyphen); some flags/behaviors differ.

## 📌 Quick Recap

- Compose = declarative multi-container apps in one YAML, one command.
- Services resolve each other by service name on an auto-created network.
- `depends_on` controls start order only; use healthchecks + `service_healthy` for readiness.
- `up -d` start, `down` remove (`-v` also drops volumes — destroys data), `--build` rebuild.
- Great for local dev; use Kubernetes/Swarm for production clustering.
