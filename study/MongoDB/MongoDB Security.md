# MongoDB Security

## Questions Covered

1. What authentication mechanisms does MongoDB support?
2. How does RBAC work with built-in and custom roles?
3. How do you implement network isolation for MongoDB?
4. How does encryption at rest and in transit work?
5. What is Client-Side Field Level Encryption (CSFLE)?
6. How does audit logging work in MongoDB?
7. What are common MongoDB security misconfigurations?

## What authentication mechanisms does MongoDB support?

MongoDB supports **SCRAM** (default), **x.509**, **LDAP**, and **Kerberos** by edition.

| Mechanism | Use case |
|-----------|----------|
| SCRAM-SHA-256 | Default username/password |
| SCRAM-SHA-1 | Legacy — migrate to SHA-256 |
| x.509 | mTLS; internal cluster auth |
| LDAP / Kerberos | Enterprise directory auth |
| OIDC (Atlas) | Cloud identity federation |

**Always enable authentication.** Localhost exception allows first user on a fresh node.

```javascript
// Create admin user (first user on standalone / primary)
use admin
db.createUser({
  user: "clusterAdmin",
  pwd: passwordPrompt(),   // or strong generated string — never commit
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
```

```javascript
// Application user — least privilege on one database
use ecommerce
db.createUser({
  user: "ordersApp",
  pwd: "use-vault-secret-here",
  roles: [ { role: "readWrite", db: "ecommerce" } ]
})

// Connect with credentials
// mongodb://ordersApp:SECRET@host1:27017,host2:27017/ecommerce?authSource=ecommerce
```

```yaml
# mongod.conf — require auth + TLS
security:
  authorization: enabled
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/server.pem
    CAFile: /etc/mongodb/ca.pem
```

**Interview:** SCRAM for apps; x.509 for service/cluster auth; LDAP/Kerberos in enterprise. Never run without `authorization: enabled`.

## How does RBAC work with built-in and custom roles?

**RBAC** assigns **roles** (privilege bundles) to **users**. Privileges = `{ resource, actions }`.

| Built-in role | Scope |
|---------------|-------|
| `read` / `readWrite` | Database or collection |
| `dbAdmin` | Indexes, stats, profiling |
| `userAdmin` | Manage users on that database |
| `clusterAdmin` | Sharding, replication |
| `readAnyDatabase` | All DBs — use sparingly |

```javascript
// Custom role — read-only on specific collections
use ecommerce
db.createRole({
  role: "ordersReader",
  privileges: [
    { resource: { db: "ecommerce", collection: "orders" }, actions: [ "find" ] },
    { resource: { db: "ecommerce", collection: "customers" }, actions: [ "find" ] }
  ],
  roles: []
})

db.createUser({
  user: "reportingSvc",
  pwd: "vault-secret",
  roles: [ "ordersReader" ]
})
```

```javascript
// Collection-level readWrite
db.createUser({
  user: "inventoryBot",
  pwd: "vault-secret",
  roles: [
    { role: "readWrite", db: "ecommerce", collection: "inventory" }
  ]
})

// Inspect effective privileges
db.getUser("ordersApp")
db.getRole("ordersReader", { showPrivileges: true })
```

```javascript
// Sharded cluster — userAdmin on admin for cross-db user management
use admin
db.createUser({
  user: "appDeployer",
  pwd: "vault-secret",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

**Interview:** Built-in roles for common cases; custom roles for least privilege. Avoid `AnyDatabase` for app accounts.

## How do you implement network isolation for MongoDB?

**Bind private IPs**, **firewall**, **TLS**, **VPC/private endpoints** — never expose mongod publicly.

| Layer | Practice |
|-------|----------|
| Bind address | `bindIp: 10.0.1.5` — not `0.0.0.0` without firewall |
| Firewall | 27017 from app subnets only |
| TLS | Client ↔ server and intra-cluster |
| Cloud | IP access list, VPC peering, PrivateLink |
| Segmentation | Apps → mongos; shards internal |

```yaml
# mongod.conf — network hardening
net:
  bindIp: 10.0.1.10,127.0.0.1
  port: 27017
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/server.pem
    CAFile: /etc/mongodb/ca.pem
    allowConnectionsWithoutCertificates: false
```

```javascript
// Verify TLS connection (mongosh)
db.adminCommand({ connectionStatus: 1 })
// authInfo.authenticatedUsers + TLS in serverStatus

db.serverStatus().security.SSL
```

```yaml
# Kubernetes — NetworkPolicy example (conceptual)
# ingress to mongod pods only from app namespace on port 27017
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-ingress
spec:
  podSelector:
    matchLabels:
      app: mongodb
  policyTypes: [ Ingress ]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: orders-api
      ports:
        - port: 27017
```

**Interview:** Private networking, firewall, TLS, no public mongod. Apps → mongos; shards stay internal.

## How does encryption at rest and in transit work?

| Type | Protects | How |
|------|----------|-----|
| **In transit** | Wire data | `net.tls.mode: requireTLS` |
| **At rest** | Disk files | WiredTiger + KMIP/keyfile (Enterprise) or cloud disk encryption |
| **Atlas** | Both | Default; CMK optional |

```yaml
# mongod.conf — TLS in transit (all editions)
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/server.pem
    CAFile: /etc/mongodb/ca.pem
```

```yaml
# Enterprise — encryption at rest
security:
  enableEncryption: true
  encryptionKeyFile: /etc/mongodb/master-key   # or KMIP provider
```

```javascript
// Connection string — enforce TLS
// mongodb://user:pass@host:27017/mydb?tls=true&tlsCAFile=/path/ca.pem

// Verify encryption at rest (Enterprise)
db.serverStatus().wiredTiger.encryption
```

**Interview:** TLS mandatory in production. At-rest via WiredTiger (Enterprise) or cloud disk. Atlas encrypts both by default.

## What is Client-Side Field Level Encryption (CSFLE)?

**CSFLE** encrypts fields **in the application** before MongoDB. Server stores ciphertext only.

| Aspect | Detail |
|--------|--------|
| Key management | AWS/Azure/GCP KMS or local master key |
| Algorithms | Deterministic (equality) vs random (max security) |
| Use case | PII, PCI — SSN, credit card |
| Limitation | Random encryption — no range queries |

```javascript
// Node.js — MongoDB driver CSFLE setup (conceptual)
const { MongoClient, ClientEncryption } = require("mongodb");

const kmsProviders = {
  aws: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET }
};

const client = new MongoClient(uri, {
  autoEncryption: {
    keyVaultNamespace: "encryption.__keyVault",
    kmsProviders,
    schemaMap: {
      "ecommerce.customers": {
        bsonType: "object",
        properties: {
          ssn: {
            encrypt: {
              keyId: [UUID("...")],
              bsonType: "string",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
            }
          }
        }
      }
    }
  }
});
```

```javascript
// Shell — create data encryption key in key vault
use encryption
db.createCollection("__keyVault")

// Application encrypts/decrypts transparently via driver autoEncryption
// Server sees: { ssn: Binary(...) } not plaintext
```

**Interview:** Client-side encryption; server never sees plaintext. Deterministic = equality queries; random = no queries on field.

## How does audit logging work in MongoDB?

**Audit logging** (Enterprise / Atlas) records auth, authz failures, and admin commands.

| Filter category | Examples |
|-----------------|----------|
| `authCheck` | Failed login, insufficient privileges |
| `createUser` / `dropUser` | Account lifecycle |
| `dropCollection` | Destructive ops |

```yaml
# mongod.conf — Enterprise audit (JSON file)
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.json
  filter: '{ "atype": { "$in": [ "authenticate", "authCheck", "createUser", "dropCollection" ] } }'
```

```javascript
// Atlas — audit via UI / API; query Atlas audit logs
// On-prem — parse audit JSON
// { "atype": "authCheck", "ts": ..., "users": [...], "roles": [...], "result": 13 }

db.adminCommand({
  getAuditConfig: 1
})
```

```javascript
// Set runtime audit filter (Enterprise)
db.adminCommand({
  setParameter: 1,
  auditAuthorizationSuccess: false   // log failures only — reduce volume
})
```

**Interview:** Enterprise audit to file/syslog; filter auth failures and admin ops. Atlas managed audit. Ship to SIEM.

## What are common MongoDB security misconfigurations?

| Misconfiguration | Risk | Fix |
|------------------|------|-----|
| No authentication | Full exposure | `authorization: enabled` |
| `bindIp: 0.0.0.0` public | Internet access | Private IP + firewall |
| No TLS | Sniffing | `requireTLS` |
| Overprivileged user | Lateral movement | Custom roles |
| Hardcoded secrets | Repo leak | Vault / env vars |
| Exposed shards | Data theft | Network segmentation |

```javascript
// Dangerous — avoid in application queries
db.users.find({ $where: "this.password == 'admin'" })   // server-side JS

// Safe — parameterized query
db.users.findOne({ username: userInput })
```

```javascript
// Check for open deployment (security checklist)
db.adminCommand({ getParameter: 1, authenticationMechanisms: 1 })
db.adminCommand({ serverStatus: 1 }).security
// authorization: "enabled", SSL: "server" ...

// List users with broad roles — audit
use admin
db.system.users.find({}, { user: 1, roles: 1 }).forEach(printjson)
```

```yaml
# Disable server-side JavaScript if not needed
security:
  javascriptEnabled: false
```

**Interview:** Top issues: no auth, public bind, no TLS, overprivileged users, secrets in code. Baseline: auth + TLS + RBAC + network isolation.
