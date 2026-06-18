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

MongoDB uses **SCRAM** (default), **x.509 certificates**, **LDAP**, and **Kerberos** depending on edition and deployment.

| Mechanism | Use case |
|-----------|----------|
| SCRAM-SHA-256 | Default username/password (MongoDB 4.0+) |
| SCRAM-SHA-1 | Legacy; migrate to SHA-256 |
| x.509 | mTLS between clients and servers; internal cluster auth |
| LDAP | Enterprise — corporate directory bind |
| Kerberos | Enterprise — Windows/AD environments |
| OIDC (Atlas) | Cloud identity federation |

**Always enable authentication** — `authorization: enabled` requires users. The localhost exception allows creating the first user on a fresh node before remote access.

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

**Interview answer:** SCRAM-SHA-256 for apps; x.509 for service-to-service and cluster internal auth; LDAP/Kerberos in enterprise. Never run production without `authorization: enabled`.

## How does RBAC work with built-in and custom roles?

MongoDB **RBAC** assigns **roles** (bundles of privileges) to **users**. Privileges = `{ resource, actions }`.

| Built-in role | Scope |
|---------------|-------|
| `read` / `readWrite` | Database or collection |
| `dbAdmin` | Indexes, stats, profiling |
| `userAdmin` | Manage users on that database |
| `clusterAdmin` | Sharding, replication, cluster ops |
| `backup` / `restore` | Backup tools |
| `readAnyDatabase` / `readWriteAnyDatabase` | All DBs — use sparingly |

**Custom roles** compose fine-grained privileges for least privilege.

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

**Interview answer:** Built-in roles cover common cases; custom roles enforce least privilege per collection/action. Avoid `AnyDatabase` roles for application accounts.

## How do you implement network isolation for MongoDB?

Defense in depth: **bind to private IPs**, **firewall**, **TLS**, and **VPC/private endpoints** — never expose mongod to the public internet.

| Layer | Practice |
|-------|----------|
| Bind address | `bindIp: 10.0.1.5,127.0.0.1` — not `0.0.0.0` without firewall |
| Firewall | Allow 27017 only from app subnets / bastion |
| TLS | Encrypt client ↔ server and intra-cluster |
| Atlas / cloud | IP access list, VPC peering, PrivateLink |
| Segmentation | App tier → mongos only; shards not reachable from apps |

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

**Interview answer:** Private networking, strict firewall rules, TLS everywhere, and never expose mongod publicly. Apps connect to mongos in sharded clusters; shards stay internal.

## How does encryption at rest and in transit work?

| Type | What it protects | How |
|------|------------------|-----|
| **In transit (TLS)** | Data on the wire | `net.tls.mode: requireTLS` on all nodes |
| **At rest (WiredTiger)** | Data files on disk | Encryption via KMIP/local keyfile (Enterprise) or cloud provider disk encryption |
| **Atlas** | Both | Enabled by default; customer-managed keys (CMK) optional |

**TLS** covers client ↔ mongod/mongos and inter-node replication/sharding traffic when configured.

**Encryption at rest** uses WiredTiger's native encryption with a master key from a key vault or KMIP. Backups inherit encryption if taken from encrypted data files.

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

**Interview answer:** TLS for in-transit (mandatory in production). At-rest via WiredTiger encryption (Enterprise) or cloud disk encryption. Atlas encrypts both by default.

## What is Client-Side Field Level Encryption (CSFLE)?

**CSFLE** encrypts specific fields **in the application** before sending to MongoDB. The server stores ciphertext — it cannot read plaintext without the client key.

| Aspect | Detail |
|--------|--------|
| Key management | AWS KMS, Azure Key Vault, GCP KMS, or local master key |
| Algorithms | Deterministic (equality queries) vs random (maximum security) |
| Use case | PII, PCI, HIPAA fields — SSN, credit card |
| Limitation | Encrypted fields have query constraints (no range on random encryption) |

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

**Interview answer:** CSFLE encrypts sensitive fields client-side; MongoDB never sees plaintext. Trade-off: deterministic allows equality queries; random encryption does not.

## How does audit logging work in MongoDB?

**Audit logging** (Enterprise / Atlas) records authentication, authorization failures, and administrative commands for compliance and forensics.

| Filter category | Examples |
|-----------------|----------|
| `authCheck` | Failed login, insufficient privileges |
| `createUser` / `dropUser` | Account lifecycle |
| `dropCollection` / `dropDatabase` | Destructive ops |
| `shardCollection` | Cluster topology changes |

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

**Interview answer:** Enterprise audit logs security-relevant events to file or syslog. Filter for auth failures and admin commands. Atlas provides managed audit. Ship logs to SIEM.

## What are common MongoDB security misconfigurations?

| Misconfiguration | Risk | Fix |
|------------------|------|-----|
| No authentication | Full data exposure | `authorization: enabled` + strong users |
| `bindIp: 0.0.0.0` on public host | Internet-wide access | Private IP + firewall |
| Default/no TLS | Credential and data sniffing | `requireTLS` everywhere |
| Overprivileged app user | Lateral movement | Custom roles, collection-scoped |
| Hardcoded connection strings | Secret leak in repos | Vault / env vars / IAM auth |
| Exposed config servers / shards | Metadata and data theft | Network segmentation |
| `$where` / `$function` enabled | Server-side JS injection | Disable server-side JS if unused |
| No backup encryption | Data leak from backups | Encrypt at rest + secure backup store |

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

**Interview answer:** Top issues: no auth, public bind, no TLS, overprivileged users, and secrets in code. Enable auth + TLS + least-privilege RBAC + network isolation as baseline.
