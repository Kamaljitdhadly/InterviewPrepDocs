# Bash System and DevOps Commands

## Questions Covered

1. How do you monitor processes and system resources?
2. How do you manage services with systemd?
3. What are essential disk and memory commands?
4. How do you use curl for API testing and downloads?
5. How do you work with archives and compression?
6. What are essential networking and DNS commands?
7. How do you use SSH and transfer files?
8. How do you troubleshoot a Linux server quickly?
9. How do Bash scripts interact with Docker and Kubernetes?
10. How do you schedule tasks with cron?
11. What are file descriptor and permission troubleshooting tips?
12. What DevOps interview scenarios use Bash?

## How do you monitor processes and system resources?

```bash
ps aux                       # all processes
ps aux | grep nginx
ps -ef --forest              # process tree

top                          # interactive (q to quit)
htop                         # improved top (if installed)

kill 12345                   # SIGTERM — graceful
kill -9 12345                # SIGKILL — force
killall nginx
pkill -f "dotnet.*MyApp"

pgrep -a dotnet              # find PIDs by name
nice -n 10 long_running.sh   # lower priority
```

| Signal | Meaning |
|--------|---------|
| **15 (TERM)** | Graceful shutdown |
| **9 (KILL)** | Immediate kill — last resort |
| **1 (HUP)** | Reload config (many daemons) |

```bash
# What's using port 8080?
ss -tlnp | grep 8080
# or: lsof -i :8080
```

## How do you manage services with systemd?

Most modern Linux uses **systemd** for services:

```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl enable nginx      # start on boot
sudo systemctl disable nginx

sudo journalctl -u nginx -f      # follow service logs
sudo journalctl -u nginx --since "1 hour ago"
sudo journalctl -xe              # recent system errors
```

```bash
# Reload unit files after edit
sudo systemctl daemon-reload
sudo systemctl restart myapp.service
```

**Service unit file** lives in `/etc/systemd/system/myapp.service` — interviews may ask you to recognize `[Unit]`, `[Service]`, `[Install]` sections.

## What are essential disk and memory commands?

```bash
df -h                        # filesystem disk usage
df -i                        # inode usage — "disk full" but files small?
du -sh *                     # size of each item in cwd
du -sh /var/log/* | sort -hr | head

free -h                      # memory and swap
vmstat 1 5                   # virtual memory stats, 1s interval

# Find large files
find /var -type f -size +100M -exec ls -lh {} \; 2>/dev/null

# Block devices
lsblk
mount | column -t
```

**DevOps scenario:** Disk full on server → `df -h` → `du -sh /*` → find log rotation issue → `journalctl --vacuum-size=500M`.

## How do you use curl for API testing and downloads?

**curl** — HTTP client essential for APIs and CI:

```bash
# GET
curl -s https://api.example.com/health
curl -s -o response.json -w "%{http_code}" https://api.example.com/users/1

# POST JSON
curl -s -X POST https://api.example.com/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId": 42, "quantity": 1}'

# Headers only
curl -I https://example.com

# Follow redirects
curl -sL https://short.url/abc

# Download file
curl -sLO https://releases.example.com/app.tar.gz

# Fail on HTTP errors (CI)
curl -sf https://api.example.com/health || exit 1
```

| Flag | Purpose |
|------|---------|
| `-s` | Silent (no progress) |
| `-f` | Fail silently on HTTP errors |
| `-S` | Show error with -s |
| `-H` | Header |
| `-d` | POST body |
| `-o` | Output file |
| `-w` | Write-out format (status code) |

**vs wget:** `wget` good for recursive downloads; `curl` better for APIs and headers.

## How do you work with archives and compression?

```bash
# tar — archive (often combined with gzip)
tar -cvf archive.tar files/           # create
tar -czvf archive.tar.gz files/       # create compressed (.gz)
tar -xzvf archive.tar.gz                # extract
tar -xzvf archive.tar.gz -C /opt/app    # extract to directory

# zip
zip -r backup.zip project/
unzip backup.zip -d /tmp/restore

# single file compression
gzip large.log                          # creates large.log.gz, removes original
gunzip large.log.gz
```

| Flag (tar) | Meaning |
|------------|---------|
| `-c` | Create |
| `-x` | Extract |
| `-v` | Verbose |
| `-z` | gzip |
| `-f` | Filename |
| `-C dir` | Change to directory |

**Docker context:** `COPY` in Dockerfile; CI artifacts often `.tar.gz`.

## What are essential networking and DNS commands?

```bash
ping -c 4 google.com
curl -s ifconfig.me                    # public IP

# DNS
nslookup api.example.com
dig api.example.com +short
host api.example.com

# Modern ip command (replaces ifconfig)
ip addr show
ip route show

# Connections
ss -tuln                               # listening TCP/UDP ports
ss -tan | head

# Trace route
traceroute api.example.com
mtr api.example.com                    # if installed
```

```bash
# Test TCP port open
nc -zv db.example.com 5432
timeout 3 bash -c 'cat < /dev/null > /dev/tcp/localhost/8080' && echo open
```

**Container debugging:** `docker exec -it container curl localhost:8080/health`

## How do you use SSH and transfer files?

```bash
# SSH
ssh user@server.example.com
ssh -i ~/.ssh/deploy_key.pem ec2-user@1.2.3.4
ssh user@host "cd /app && ./deploy.sh"

# Copy files
scp file.txt user@host:/remote/path/
scp -r ./dist user@host:/var/www/
rsync -avz --delete ./build/ user@host:/var/www/app/

# SSH config (~/.ssh/config)
# Host prod
#   HostName 1.2.3.4
#   User deploy
#   IdentityFile ~/.ssh/prod.pem
ssh prod
```

| Tool | Use |
|------|-----|
| **scp** | Simple copy |
| **rsync** | Incremental sync, `--delete` for mirrors |
| **sftp** | Interactive file transfer |

**Security:** Key-based auth, disable password login on servers, never commit private keys.

## How do you troubleshoot a Linux server quickly?

**Interview checklist — app "down":**

```bash
# 1. Is the process running?
ps aux | grep myapp
systemctl status myapp

# 2. Is the port listening?
ss -tlnp | grep 8080

# 3. Local health check
curl -sf localhost:8080/health

# 4. Recent logs
journalctl -u myapp -n 100 --no-pager
tail -100 /var/log/myapp/error.log

# 5. Resources
df -h
free -h
top -bn1 | head -20

# 6. Network / DNS
ping -c 2 database.internal
nc -zv database.internal 5432
```

```text
Process down → start service / check crash loop
Port closed  → app not binding / wrong config
Health fail  → read stack trace in logs
Disk full    → rotate logs, expand volume
OOM killed   → dmesg | grep -i oom
```

## How do Bash scripts interact with Docker and Kubernetes?

**Docker:**

```bash
#!/usr/bin/env bash
set -euo pipefail

IMAGE="contoso.azurecr.io/api:${BUILD_ID:?}"

docker build -t "$IMAGE" .
docker push "$IMAGE"

docker run --rm -d -p 8080:8080 --name api-test "$IMAGE"
sleep 5
curl -sf http://localhost:8080/health
docker stop api-test
```

**Kubernetes:**

```bash
kubectl apply -f k8s/
kubectl rollout status deployment/contoso-api -n shop --timeout=300s
kubectl get pods -n shop
kubectl logs -n shop -l app=contoso-api --tail=50

# Debug pod
kubectl exec -it -n shop deploy/contoso-api -- bash
kubectl describe pod -n shop POD_NAME
```

Scripts in CI often wrap `docker`/`kubectl`/`az`/`aws` CLIs — Bash glues them together.

## How do you schedule tasks with cron?

**cron** — scheduled jobs on Linux:

```bash
crontab -e                    # edit user crontab
crontab -l                    # list

# Format: minute hour day month weekday command
# Every day at 2:30 AM — backup
30 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Every 5 minutes
*/5 * * * * /opt/scripts/health-check.sh
```

| Field | Values |
|-------|--------|
| Minute | 0-59 |
| Hour | 0-23 |
| Day of month | 1-31 |
| Month | 1-12 |
| Weekday | 0-7 (0 and 7 = Sunday) |

**Modern alternative:** systemd timers, Kubernetes CronJob, Azure Logic Apps — cron still common on VMs.

Always redirect output and use absolute paths in cron scripts.

## What are file descriptor and permission troubleshooting tips?

```bash
# Permission denied
ls -la script.sh
namei -l /path/to/nested/file          # trace path permissions

# Too many open files
ulimit -n
lsof -p PID | wc -l

# Who has file open
lsof /var/log/app.log

# SELinux (RHEL/CentOS) — "permission denied" despite chmod
getenforce
ausearch -m avc -ts recent
```

```bash
# Run as another user (careful)
sudo -u appuser ./script.sh
```

## What DevOps interview scenarios use Bash?

| Scenario | Bash role |
|----------|-----------|
| **CI pipeline step** | Build, test, publish artifact |
| **Deploy script** | Pull image, restart service, health check |
| **Log analysis** | grep/awk pipeline on access logs |
| **Incident response** | Quick process/port/disk checks |
| **Bootstrap VM** | Install Docker, clone repo, run setup |
| **Cron backup** | pg_dump, tar, upload to blob |

**Sample interview answer:** "I'd `ssh` to the box, check `systemctl status` and `journalctl`, verify the port with `ss`, hit `/health` with `curl`, and check `df` for disk — all standard Bash tooling before diving into application code."

## Related Topics

- Bash/Bash Basics.md
- Bash/Bash Shell Scripting.md
- Docker/Docker Basics.md
- Kubernetes/Kubernetes Basics.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
