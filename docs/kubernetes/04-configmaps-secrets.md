# ConfigMaps & Secrets

## Concept Explanation

To follow the 12-factor principle of separating **config from code**, Kubernetes provides:

- **ConfigMap** — stores **non-sensitive** configuration as key-value pairs (app settings, feature flags, config files). Plain text.
- **Secret** — stores **sensitive** data (passwords, API keys, TLS certs). Values are **base64-encoded** (NOT encrypted by default) and treated with extra care (can be encrypted at rest, RBAC-restricted).

Both can be consumed by Pods as **environment variables** or mounted as **files** (volumes). Updating them lets you change config without rebuilding images.

## Code Example(s)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "Information"
  appsettings.json: |
    { "FeatureX": true }
---
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  password: c2VjcmV0           # base64 of "secret"  (echo -n secret | base64)
```

```yaml
# Consume in a Pod
spec:
  containers:
    - name: app
      image: myapp:1.0
      envFrom:
        - configMapRef: { name: app-config }   # all keys as env vars
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef: { name: db-secret, key: password }
      volumeMounts:
        - name: config-vol
          mountPath: /etc/config
  volumes:
    - name: config-vol
      configMap: { name: app-config }           # mount as files
```

## Interview Q&A

**🟢 What is a ConfigMap?**
A Kubernetes object that stores non-sensitive configuration as key-value pairs, injected into Pods as environment variables or mounted files — separating config from the image.

**🟢 What's the difference between a ConfigMap and a Secret?**
Both store config; Secrets are for sensitive data and get extra handling (base64-encoded, can be encrypted at rest, RBAC-protected, not shown in plain `describe`). ConfigMaps are plain text for non-sensitive settings.

**🟡 Are Kubernetes Secrets encrypted?**
By default they're only **base64-encoded** (trivially decodable), stored in etcd. For real protection, enable **encryption at rest** for etcd, restrict access via RBAC, and/or use an external secret store (Vault, cloud KMS, Sealed Secrets).

**🟡 How can a Pod consume a ConfigMap/Secret?**
As environment variables (`envFrom`/`valueFrom`) or mounted as files via a volume. File mounts can update when the ConfigMap changes; env vars do not.

**🔴 If you update a ConfigMap, does the Pod see the change automatically?**
Mounted-as-volume values update (eventually, with a delay) without a restart. Values injected as **environment variables do NOT update** — the Pod must be restarted/rolled to pick up the new value.

## ⚠️ Tricky / Gotchas

- **Secrets are base64, not encrypted.** Anyone with read access can decode them. The #1 misconception — enable etcd encryption + RBAC.
- **Env-var config doesn't hot-reload** — changing a ConfigMap won't update env vars in running Pods; you must restart (`kubectl rollout restart`). Mounted files do update (with a sync delay).
- **base64 ≠ security** — committing base64 secrets to git is just as exposed as plaintext.
- **Size limit**: ConfigMaps/Secrets are capped (~1 MiB) — they're for config, not large files.
- **Immutable ConfigMaps/Secrets** (`immutable: true`) improve performance and safety but require recreating to change.

## 📌 Quick Recap

- ConfigMap = non-sensitive config; Secret = sensitive data (base64, not encrypted by default).
- Consume as env vars or mounted files.
- Mounted files hot-update (with delay); env vars need a Pod restart.
- Secure Secrets: enable etcd encryption-at-rest, RBAC, external stores (Vault/KMS).
- base64 is encoding, not encryption — don't treat it as secure.
- ~1 MiB size limit; use immutable for stability/perf.
