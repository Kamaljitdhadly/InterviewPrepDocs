# Best Practices & Security

## Concept Explanation

Production-grade containers should be **small, secure, reproducible, and stateless**. Key practices span the image build, runtime, and supply chain.

- **Smaller, fewer layers** → faster pulls, smaller attack surface (multi-stage, slim/distroless bases).
- **Least privilege** → run as a **non-root** user, drop capabilities, read-only filesystem where possible.
- **No secrets in images** → pass via environment/secret stores at runtime, never bake into layers.
- **Reproducibility** → pin base image versions/digests, use `.dockerignore`.
- **Supply chain** → scan images for vulnerabilities, sign images, use trusted base images.

## Code Example(s)

```dockerfile
# Hardened Dockerfile example
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Create and switch to a non-root user
RUN adduser --disabled-password --uid 1001 appuser
USER appuser                      # don't run as root
WORKDIR /app
COPY --chown=appuser:appuser ./publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

```bash
# Runtime hardening
docker run -d \
  --read-only \                       # read-only root filesystem
  --cap-drop ALL \                    # drop Linux capabilities
  --memory=512m --cpus=1 \            # resource limits
  --user 1001 \
  myapp:1.0

# Scan an image for vulnerabilities
docker scout cves myapp:1.0     # (or trivy, grype, snyk)
```

```
# .dockerignore — keep build context small & avoid leaking files
.git
node_modules
**/bin
**/obj
*.env
secrets/
```

## Interview Q&A

**🟢 Why shouldn't containers run as root?**
If an attacker escapes the container or exploits the app, running as root gives them root-level access to processes and (potentially) the host. Running as a non-root user limits the blast radius.

**🟢 How do you keep images small?**
Multi-stage builds, slim/alpine/distroless base images, combine `RUN` steps and clean caches in the same layer, and use `.dockerignore` to exclude unneeded files.

**🟡 How should secrets be handled in Docker?**
Never bake secrets into images or `ENV` in the Dockerfile (they persist in layers/history). Inject them at runtime via environment variables from a secret manager, Docker/Kubernetes secrets, or BuildKit build secrets for build-time needs.

**🟡 What is image scanning and why does it matter?**
Tools (Docker Scout, Trivy, Grype, Snyk) inspect image layers for known CVEs in OS packages and dependencies. Scanning in CI catches vulnerable base images/libraries before they reach production.

**🔴 How do you ensure containers don't consume unbounded resources?**
Set resource limits (`--memory`, `--cpus`, or Kubernetes requests/limits). Without limits, one container can starve others (the "noisy neighbor" problem) or get OOM-killed unpredictably.

## ⚠️ Tricky / Gotchas

- **Secrets baked into a layer stay in history** even if deleted later (`docker history` can reveal them). Multi-stage builds or runtime injection are the fix.
- **`USER` must come after you install/chown** — switching to non-root too early can cause permission errors during `COPY`/`RUN`.
- **`latest` base images break reproducibility** and silently pull in new (possibly vulnerable) versions — pin versions/digests.
- **Running everything as root by default** — the default container user *is* root unless you set `USER`. Many images ship root.
- **No resource limits in dev → surprises in prod** where limits exist; test with limits applied.
- **Large build context** (no `.dockerignore`) slows builds and can leak `.git`/secrets into the image.

## 📌 Quick Recap

- Build small: multi-stage, slim/distroless, combined `RUN` cleanup, `.dockerignore`.
- Least privilege: non-root `USER`, drop capabilities, read-only FS, resource limits.
- No secrets in images/layers — inject at runtime; deleted secrets still live in history.
- Pin base image versions/digests for reproducibility & security.
- Scan images for CVEs in CI; prefer trusted/official base images.
- Set memory/CPU limits to avoid noisy-neighbor and OOM issues.
