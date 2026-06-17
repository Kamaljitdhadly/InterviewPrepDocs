# Microservices DevOps and CICD

## Questions Covered

1. What role does CI/CD play in microservices?
2. How do you manage continuous deployment of microservices in a distributed environment?
3. How do you handle blue-green and canary deployments in microservices?

## What role does CI/CD play in microservices?

**CI/CD** streamlines building, testing, and deploying microservices consistently across teams.

| Role | Details |
|------|---------|
| **Automated builds & testing** | Frequent integration; automated unit, integration, and E2E tests on every change |
| **Rapid feedback** | Immediate quality feedback; defects caught early |
| **Environment consistency** | Containerization (Docker) + IaC ensure dev/staging/prod parity; Helm/Kustomize for K8s config |
| **Accelerated releases** | Faster, independent per-service deployments with minimal system-wide impact |
| **Rollback & recovery** | Automated rollback to previous versions; version control for easy reverts |
| **Monitoring integration** | Pipelines embed health/performance monitoring, logging, and analytics |

## How do you manage continuous deployment of microservices in a distributed environment?

| Area | Approach |
|------|----------|
| **CI/CD pipelines** | Jenkins, GitLab CI, or GitHub Actions; define pipelines as code (YAML) for version control |
| **Containerization** | Docker per service; Kubernetes for orchestration, scaling, and networking |
| **Automated testing** | Unit, integration, E2E per service; smoke tests post-deploy in staging/production |
| **Deployment strategies** | Canary (gradual rollout) and blue/green (dual environments) to reduce risk |
| **Configuration** | Centralized config (Consul, Spring Cloud Config); secrets via Vault or K8s Secrets |
| **Monitoring & logging** | Centralized logging (ELK, Splunk); APM (Prometheus, Grafana, Datadog) |
| **Feedback loops** | Capture production metrics and user feedback for continuous improvement |

## How do you handle blue-green and canary deployments in microservices?

**Blue-Green Deployments** — two identical environments; one serves live traffic, the other receives new releases.

| Step | Action |
|------|--------|
| 1. Deploy | Push new version to idle environment (e.g., green) |
| 2. Test | Run automated tests on green |
| 3. Switch traffic | Load balancer redirects from blue to green |
| 4. Monitor | Watch health and performance |
| 5. Rollback | Switch back to blue instantly if issues arise |

**Considerations:** extra infrastructure cost; careful DB migrations for compatibility across both versions.

**Canary Deployments** — roll out to a small user subset before full release.

| Step | Action |
|------|--------|
| 1. Deploy | Route 5–10% of traffic to new version via load balancer/API gateway |
| 2. Monitor | Watch error rates, latency, and behavior |
| 3. Gradual rollout | Increase traffic percentage if healthy |
| 4. Full rollout | Deploy to all users once validated |
| 5. Rollback | Revert to stable version on detected issues |

**Considerations:** user segmentation tooling; feature flags for dynamic enable/disable; traffic routing via API gateway or service mesh (Istio).

| Strategy | Risk mitigation | Trade-off |
|----------|-----------------|-----------|
| **Blue-green** | Instant rollback via traffic switch | Requires duplicate infrastructure |
| **Canary** | Limits blast radius to small user subset | Slower rollout; needs routing tooling |
