# Google Cloud API Gateway

## Questions Covered

1. What API management options exist on GCP?
2. What is API Gateway (Google Cloud)?
3. How does API Gateway integrate with Cloud Run and Cloud Functions?
4. What is Apigee, and when do you use it?
5. What are OpenAPI specs and API configs?
6. How do you implement authentication on API Gateway?
7. What is quota and API key management?
8. How does API Gateway compare to Cloud Load Balancing?
9. What is Cloud Endpoints (legacy)?
10. How do you deploy and version APIs?
11. What is gRPC support on GCP gateways?
12. How does GCP API management compare to AWS APIM and Azure APIM?

## What API management options exist on GCP?

| Service | Scope | Use |
|---------|-------|-----|
| **API Gateway** | Fully managed — OpenAPI front door to Cloud Run/Functions/GCE | Mid-size API programs on GCP |
| **Apigee** | Enterprise API platform — products, monetization, analytics | Large enterprise, multi-cloud API programs |
| **Cloud Endpoints** | ESP proxy (legacy) — gRPC/REST on GCE/GKE | Existing deployments |
| **Global HTTP(S) LB + Cloud Armor** | L7 routing + WAF — not full API management | High-throughput passthrough |

```text
Startup / GCP-native API     → API Gateway + Cloud Run
Enterprise API marketplace     → Apigee
Simple public HTTP             → Cloud LB + IAP optional
```

## What is API Gateway (Google Cloud)?

**API Gateway** — managed service that hosts OpenAPI-defined APIs and routes to backends.

```text
Client → API Gateway (api.myapp.com) → Cloud Run / Cloud Functions / App Engine
              │
              ├── API key / Firebase auth (via OpenAPI security)
              ├── Quotas
              └── Logging to Cloud Logging
```

```bash
gcloud api-gateway apis create orders-api --project=myapp-prod
gcloud api-gateway api-configs create orders-config --api=orders-api --openapi-spec=openapi.yaml
gcloud api-gateway gateways create prod-gateway --api=orders-api --api-config=orders-config \
  --location=us-central1
```

Developers get stable **gateway URL** — swap backend without client changes.

## How does API Gateway integrate with Cloud Run and Cloud Functions?

OpenAPI backend definition points to Cloud Run URL or uses **backend address** with IAM auth.

```yaml
# openapi.yaml excerpt
x-google-backend:
  address: https://myapi-xxx.run.app
  protocol: h2
paths:
  /orders:
    get:
      operationId: listOrders
      security:
        - firebase: []
      responses:
        '200':
          description: OK
```

```bash
# Grant gateway SA permission to invoke Cloud Run
gcloud run services add-iam-policy-binding myapi \
  --member=serviceAccount:api-gateway-sa@myapp-prod.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

Gateway uses **service account** to authenticate to private Cloud Run (no public invoker needed).

## What is Apigee, and when do you use it?

**Apigee** — enterprise API management (Google acquired) — separate product from API Gateway.

| Feature | Apigee | API Gateway |
|---------|--------|-------------|
| **Developer portal** | Full-featured | Basic / external |
| **Monetization** | Rate plans, billing | Limited |
| **Analytics** | Deep API analytics | Cloud Logging/Monitoring |
| **Policies** | Extensive XML/JavaScript policies | OpenAPI + Google extensions |
| **Multi-cloud backends** | Yes | GCP-focused |
| **Cost** | Enterprise pricing | Lower, serverless pricing |

Use **Apigee** when interview mentions enterprise API program, API products, or partner ecosystems — like **Azure APIM**.

## What are OpenAPI specs and API configs?

| Artifact | Role |
|----------|------|
| **OpenAPI 2.0 (Swagger)** | Required for API Gateway — paths, schemas, security |
| **API config** | Immutable snapshot of OpenAPI + backends |
| **Gateway** | Runtime serving a specific config |

```bash
# Deploy new config version
gcloud api-gateway api-configs create orders-config-v2 --api=orders-api --openapi-spec=openapi-v2.yaml
gcloud api-gateway gateways update prod-gateway --api-config=orders-config-v2 --location=us-central1
```

Treat OpenAPI in **Git** — CI/CD deploys configs (like AWS API Gateway import).

## How do you implement authentication on API Gateway?

| Method | OpenAPI security |
|--------|------------------|
| **API key** | `x-google-api-key` header |
| **Firebase / Identity Platform** | `firebase` security scheme — JWT validation |
| **Google ID token** | Service account / user tokens |
| **Auth0 / external OIDC** | JWT validation via extensions or backend |

```yaml
securityDefinitions:
  firebase:
    authorizationUrl: ""
    flow: implicit
    type: oauth2
    x-google-issuer: "https://securetoken.google.com/my-project-id"
    x-google-jwks_uri: "https://www.googleapis.com/service_accounts/v1/metadata/x509/..."
    x-google-audiences: "my-project-id"
```

For **service-to-service**, clients use Google ID tokens with `roles/run.invoker` or gateway-level keys.

## What is quota and API key management?

```yaml
x-google-management:
  metrics:
    - name: read-requests
      displayName: Read requests
  quota:
    limits:
      - name: read-limit
        metric: read-requests
        unit: "1/min/{project}"
        values:
          STANDARD: 1000
```

```bash
gcloud services api-keys create --display-name="Partner Key"
```

Restrict keys by **Android/iOS app**, **HTTP referrer**, or **IP** — not security alone; combine with OAuth for sensitive APIs.

## How does API Gateway compare to Cloud Load Balancing?

| Aspect | API Gateway | Global HTTP(S) LB |
|--------|-------------|-------------------|
| **Purpose** | API definition, keys, auth, quotas | Traffic distribution, CDN, WAF |
| **OpenAPI native** | Yes | No (URL maps only) |
| **Throughput** | Good for API workloads | Massive scale |
| **Cloud Armor** | Indirect (via backend) | Direct attachment |
| **Cost model** | Per call + gateway hours | Per rule + egress |

```text
High-scale static + API mix  → LB + CDN for static, API Gateway for /api/*
Ultra-high RPS passthrough   → LB → Cloud Run directly
```

## What is Cloud Endpoints (legacy)?

**Cloud Endpoints** — Extensible Service Proxy (**ESP** / **ESPv2**) deployed on GCE/GKE/App Engine — validates API keys, JWT, logs.

Still maintained for existing gRPC services — **new projects:** prefer **API Gateway** or **Apigee**.

## How do you deploy and version APIs?

```text
CI/CD pipeline:
  1. Lint OpenAPI (spectral)
  2. gcloud api-gateway api-configs create ...-v${BUILD}
  3. gcloud gateways update ... --api-config=...-v${BUILD}
  4. Integration tests against gateway URL
  5. Rollback = point gateway to previous config
```

Custom domains via **Certificate Manager** + DNS to gateway hostname.

## What is gRPC support on GCP gateways?

| Option | gRPC |
|--------|------|
| **Cloud Endpoints / ESPv2** | Native gRPC transcoding |
| **API Gateway** | Primarily HTTP/OpenAPI — gRPC via transcoding or gRPC backend on LB |
| **Global LB** | gRPC proxy support |

For **gRPC-first** microservices on GKE — often **Internal LB** or **service mesh (Anthos)** + auth — know trade-offs.

## How does GCP API management compare to AWS APIM and Azure APIM?

| | API Gateway (GCP) | API Gateway (AWS) | APIM (Azure) |
|---|-------------------|-------------------|--------------|
| **Tier** | Mid-market | HTTP + REST APIs | Enterprise portal |
| **Enterprise SKU** | Apigee | — | APIM Premium |
| **Serverless fit** | Cloud Run native | Lambda native | Functions/App Service |
| **Policy richness** | Moderate | REST API policies | Extensive XML |

**Interview answer:** GCP splits **API Gateway** (GCP workloads) and **Apigee** (enterprise) — analogous to AWS API Gateway vs optional Apigee/Kong self-hosted vs Azure APIM.

## Related Topics

- **Google Cloud Compute.md** — Cloud Run backends
- **Google Cloud Identity and IAM.md** — service accounts, Firebase auth
- **Google Cloud Load Balancing and CDN.md** — when LB alone is enough
- **AWS/AWS API Gateway.md** · **Azure Cloud 1/Azure API Management and Gateways.md**
