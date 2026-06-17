# Docker Container Lifecycle

## Questions Covered

1. What are the different states a Docker container can be in (e.g., created, running, paused, stopped, exited)?
2. How do you handle the restart policies for Docker containers (e.g., --restart on-failure, --restart always)?
3. How do you gracefully shut down a running Docker container?

## What are the different states a Docker container can be in (e.g., created, running, paused, stopped, exited)?

| State | Description | View |
|-------|-------------|------|
| **Created** | Image downloaded, config set, not yet started | `docker ps -a` |
| **Running** | Main process actively executing | `docker ps` |
| **Paused** | Processes halted temporarily (not stopped) | `docker ps -a` |
| **Stopped** | Gracefully terminated; can be restarted | `docker ps -a` |
| **Exited** | Process completed or errored out | `docker ps -a` |
| **Dead** | Failed state; cannot restart or clean up normally | `docker ps -a` (rare) |

**State transition commands:**

```bash
docker start <container_id>    # created/stopped → running
docker stop <container_id>     # running → stopped
docker pause <container_id>    # running → paused
docker unpause <container_id>  # paused → running
docker restart <container_id>  # restart from any restartable state
docker rm <container_id>       # remove stopped/exited container
```

## How do you handle the restart policies for Docker containers (e.g., --restart on-failure, --restart always)?

Restart policies control automatic container restarts on exit or daemon restart.

| Policy | Behavior |
|--------|----------|
| `--restart no` | No auto-restart (default) |
| `--restart always` | Always restart on stop or daemon restart |
| `--restart unless-stopped` | Restart unless manually stopped |
| `--restart on-failure[:max-retries]` | Restart only on non-zero exit; optional retry limit |

```bash
docker run --restart no <image>
docker run --restart always <image>
docker run --restart unless-stopped <image>
docker run --restart on-failure:5 <image>
```

**Applying policies:**

```bash
# New container
docker run --name my-container --restart always -d my-image

# Existing container
docker update --restart always my-container

# Docker Compose
version: '3'
services:
  my-service:
    image: my-image
    restart: always
```

Choose based on availability needs: `always` for critical services, `unless-stopped` for flexibility, `on-failure` for error-only retries.

## How do you gracefully shut down a running Docker container?

Graceful shutdown lets the app clean up (save data, close connections) before termination.

### 1. `docker stop` (SIGTERM)

Sends SIGTERM, waits default **10 seconds**, then SIGKILL if still running:

```bash
docker stop <container_id>
docker stop my-container
```

### 2. Custom timeout (`-t`)

```bash
docker stop -t 30 my-container
```

### 3. Handle SIGTERM inside the container

Ensure the app responds to SIGTERM. Example (.NET):

```csharp
public static async Task Main(string[] args)
{
  var host = CreateHostBuilder(args).Build();
  await host.RunAsync();
}
public class YourBackgroundService : BackgroundService
{
  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    stoppingToken.Register(() => { /* cleanup logic */ });
    // application logic
  }
}
```

### 4. `docker kill` (SIGKILL — immediate)

Force-terminates without graceful shutdown — use only when necessary:

```bash
docker kill <container_id>
```

**Summary:** Prefer `docker stop` (SIGTERM + grace period) → customize with `-t` → handle signals in-app → use `docker kill` only for forced termination.
