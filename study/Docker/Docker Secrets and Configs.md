# Docker Secrets and Configs

## Questions Covered

1. What are Docker secrets, and how do you use them in Swarm mode?
2. How do you securely manage sensitive data (like passwords, API keys) in Docker containers?

## What are Docker secrets, and how do you use them in Swarm mode?

**Docker secrets** securely store sensitive data (passwords, API keys, certificates) for Swarm-mode services. Encrypted at rest and in transit; only accessible to authorized services.

**How they work:**

1. **Creation** — via CLI or Compose; stored in the Swarm manager's raft log.
2. **Access** — mounted as files at `/run/secrets/` (not env vars).
3. **Encryption** — at rest and in transit between nodes.

**Usage:**

```bash
# Create from stdin
echo "supersecretpassword" | docker secret create my_secret -

# Create from file
docker secret create my_secret ./path/to/secret_file

# Use in a service
docker service create --name my_service --secret my_secret my_image

# Manage
docker secret ls
docker secret inspect my_secret
docker secret rm my_secret
```

Secrets appear inside containers at `/run/secrets/<secret_name>`.

**Dockerfile example:**

```dockerfile
FROM alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY . .
CMD ["sh", "-c", "cat /run/secrets/my_secret"]
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  web:
    image: my_image
    secrets: [my_secret]
secrets:
  my_secret:
    file: ./path/to/secret_file
```

## How do you securely manage sensitive data (like passwords, API keys) in Docker containers?

### 1. Docker Secrets (Swarm — preferred)

```bash
echo "my_secret_password" | docker secret create my_secret -
docker service create --name my_service --secret my_secret my_image
# Inside container: cat /run/secrets/my_secret
```

### 2. Environment Variables (use with caution)

Less secure — visible via `docker inspect` and logs.

```bash
# Dockerfile (avoid for secrets)
ENV DB_PASSWORD=my_secret_password

# Runtime override
docker run -e DB_PASSWORD=my_secret_password my_image
```

**Compose with `.env`:**

```yaml
version: '3.8'
services:
  web:
    image: my_image
    env_file: [.env]
```

### 3. Configuration Management Tools

HashiCorp Vault, AWS Secrets Manager, Azure Key Vault for advanced secret management.

```bash
vault kv put secret/myapp db_password=my_secret_password
vault kv get -field=db_password secret/myapp
```

### 4. Avoid Hardcoding

Never embed secrets in Dockerfiles or source code. Pass at runtime:

```bash
docker run -e DB_PASSWORD=$DB_PASSWORD my_image
```

### 5. Restrict Access

- Use Swarm/Kubernetes RBAC to control secret access.
- Monitor and audit access via logging.

### 6. Encrypt Data

- **At rest** — database/storage encryption.
- **In transit** — HTTPS/TLS between containers and external services.

### 7. Rotate Secrets Regularly

Update secrets and re-deploy/restart services to apply new values.

**Summary:**

| Method | Security | Use case |
|--------|----------|----------|
| Docker Secrets | High (Swarm) | Production sensitive data |
| Env vars | Lower | Non-critical config |
| Vault / cloud KMS | Highest | Enterprise secret management |
| Hardcoding | Never | — |

Rotate secrets, restrict access, and encrypt data at rest and in transit.
