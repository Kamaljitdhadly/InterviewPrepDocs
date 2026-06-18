# Google Cloud Storage and Databases

## Questions Covered

1. What GCP storage services exist, and when do you use each?
2. What is Cloud Storage (GCS), and what storage classes exist?
3. What is object versioning, lifecycle, and uniform access?
4. What are Persistent Disks vs Local SSD vs Filestore?
5. What is Cloud SQL?
6. What is AlloyDB for PostgreSQL?
7. What is Firestore vs Cloud Datastore?
8. What is Bigtable and Spanner?
9. What is Memorystore (Redis/Memcached)?
10. How do you secure buckets and databases?
11. What is backup and DR for Cloud SQL?
12. How do you choose between SQL, Firestore, and Spanner?

## What GCP storage services exist, and when do you use each?

| Service | Type | Use case |
|---------|------|----------|
| **Cloud Storage (GCS)** | Object | Files, backups, static sites, data lake |
| **Persistent Disk** | Block | GCE boot/data volumes |
| **Local SSD** | Ephemeral block | High-IOPS scratch |
| **Filestore** | Managed NFS | Shared file storage |
| **Cloud SQL** | Managed RDBMS | MySQL, PostgreSQL, SQL Server |
| **AlloyDB** | PostgreSQL-compatible | High-performance PostgreSQL |
| **Firestore** | Document NoSQL | Mobile/web apps, real-time sync |
| **Bigtable** | Wide-column NoSQL | Large scale, low latency (IoT, ads) |
| **Spanner** | Globally distributed SQL | Global ACID, financial |

```text
User uploads / logs / assets  → Cloud Storage
VM disks                      → Persistent Disk
Shared NFS                    → Filestore
Relational app data           → Cloud SQL or AlloyDB
Global strongly consistent SQL → Spanner
```

## What is Cloud Storage (GCS), and what storage classes exist?

**Cloud Storage** — object storage; buckets globally unique; objects immutable (overwrite = new generation).

| Class | Use | Min storage duration |
|-------|-----|---------------------|
| **Standard** | Frequent access | — |
| **Nearline** | Monthly access | 30 days |
| **Coldline** | Quarterly access | 90 days |
| **Archive** | Yearly access | 365 days |
| **Autoclass** | Auto-tier by access pattern | — |

```bash
gsutil mb -l US-CENTRAL1 gs://myapp-prod-uploads/
gsutil cp report.pdf gs://myapp-prod-uploads/reports/
gsutil ls -l gs://myapp-prod-uploads/reports/
```

**Location types:** `region`, `dual-region`, `multi-region` (e.g. `US`, `EU`).

## What is object versioning, lifecycle, and uniform access?

```json
{
  "lifecycle": {
    "rule": [{
      "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
      "condition": { "age": 30, "matchesPrefix": ["logs/"] }
    }]
  }
}
```

| Feature | Detail |
|---------|--------|
| **Object versioning** | Keep history; protect overwrite/delete |
| **Retention policy** | WORM compliance — lock bucket |
| **Uniform bucket-level access** | IAM only — disable ACLs (**recommended**) |
| **Encryption** | Google-managed default; CMEK via Cloud KMS |

```bash
gsutil versioning set on gs://myapp-prod-uploads
gcloud storage buckets update gs://myapp-prod-uploads --uniform-bucket-level-access
```

## What are Persistent Disks vs Local SSD vs Filestore?

| | Persistent Disk | Local SSD | Filestore |
|---|-----------------|-----------|-----------|
| **Persistence** | Survives VM stop | Lost on VM delete/stop | Managed service |
| **Attach** | Read/write many (Hyperdisk) | Fixed to instance type | NFS mount |
| **Use** | Boot, databases on VM | Cache, temp | Legacy shared files |

```bash
gcloud compute disks create data-pd --size=200GB --type=pd-balanced --zone=us-central1-a
```

## What is Cloud SQL?

**Cloud SQL** — managed MySQL, PostgreSQL, SQL Server — automated backups, patching, HA.

| Feature | Detail |
|---------|--------|
| **High availability** | Standby in another zone — auto failover |
| **Read replicas** | Scale reads; cross-region |
| **Private IP** | VPC peering — no public internet |
| **IAM database auth** | PostgreSQL/MySQL — map Cloud IAM to DB user |

```bash
gcloud sql instances create prod-pg \
  --database-version=POSTGRES_15 --tier=db-custom-2-7680 --region=us-central1 \
  --availability-type=REGIONAL --network=projects/myapp-prod/global/networks/prod-vpc \
  --no-assign-ip
```

```csharp
// Connection via private IP + Cloud SQL Auth Proxy or connector
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(Configuration.GetConnectionString("CloudSql")));
```

## What is AlloyDB for PostgreSQL?

**AlloyDB** — Google-built PostgreSQL-compatible — higher throughput than Cloud SQL for demanding OLTP.

| vs Cloud SQL | AlloyDB |
|--------------|---------|
| **Performance** | Columnar engine for analytics queries |
| **Use** | PostgreSQL at scale, migration from on-prem PG |
| **Cost** | Premium tier |

Choose **Cloud SQL** for standard workloads; **AlloyDB** when PostgreSQL performance is bottleneck.

## What is Firestore vs Cloud Datastore?

| | Firestore (Native mode) | Datastore (legacy) |
|---|-------------------------|---------------------|
| **Model** | Document + collections | Entity/properties |
| **Realtime** | Listeners, offline sync | Limited |
| **Use** | New apps, Firebase integration | Legacy only |

```javascript
const doc = await db.collection('orders').doc('ORD-001').get();
await db.collection('orders').doc('ORD-002').set({ customerId: 'C123', total: 99.5 });
```

**Firestore modes:** Native vs Datastore compatibility mode in same project type considerations.

Compare with **MongoDB** and **DynamoDB** — Firestore strong for mobile/Firebase; multi-region replication built-in.

## What is Bigtable and Spanner?

| | Bigtable | Spanner |
|---|----------|---------|
| **Type** | Wide-column NoSQL (HBase-like) | Globally distributed relational |
| **Consistency** | Eventually per row | **External consistency** globally |
| **Scale** | Petabytes, millions OPS | Global SQL, horizontal |
| **Use** | Time-series, IoT, analytics feeds | Global financial, inventory |

```sql
-- Spanner SQL
SELECT CustomerId, SUM(Total) FROM Orders GROUP BY CustomerId;
```

**Spanner** — one of GCP's differentiators — know for global ACID interview questions.

## What is Memorystore (Redis/Memcached)?

**Memorystore** — managed in-memory cache.

| Engine | Use |
|--------|-----|
| **Redis** | Cache, pub/sub, sessions — **default choice** |
| **Memcached** | Simple cache |

Connect from GCE, GKE, Cloud Run (via VPC connector) — private IP in VPC.

## How do you secure buckets and databases?

| Control | Implementation |
|---------|----------------|
| **No public buckets** | Org policy + IAM; avoid `allUsers` |
| **Uniform bucket-level access** | Disable object ACLs |
| **Private IP only** | Cloud SQL `--no-assign-ip` |
| **CMEK** | Customer-managed encryption keys |
| **IAM Conditions** | Time/IP-bound access |
| **VPC Service Controls** | Perimeter around projects |

```bash
# Remove public access
gsutil iam ch -d allUsers:objectViewer gs://myapp-prod-uploads
```

Use **service accounts** — not HMAC keys unless required for interoperability.

## What is backup and DR for Cloud SQL?

| Feature | Detail |
|---------|--------|
| **Automated backups** | PITR — transaction log retention |
| **On-demand backups** | Before migrations |
| **Cross-region replica** | DR read + promote |
| **Export to GCS** | SQL dump for long-term archive |

Define **RPO/RTO** — regional HA for instance failure; cross-region for regional disaster.

## How do you choose between SQL, Firestore, and Spanner?

| Need | Choice |
|------|--------|
| Standard PostgreSQL/MySQL | **Cloud SQL** |
| Highest PostgreSQL perf | **AlloyDB** |
| Mobile/web document + sync | **Firestore** |
| Global strong consistency SQL | **Spanner** |
| Massive time-series / wide-column | **Bigtable** |
| Analytics warehouse | **BigQuery** (see data analytics paths) |
| Object files | **Cloud Storage** |

```text
E-commerce OLTP (regional)     → Cloud SQL PostgreSQL
Firebase mobile app backend    → Firestore
Global bank ledger             → Spanner
Product images                 → GCS + Cloud CDN
Session cache                  → Memorystore Redis
```

## Related Topics

- **Google Cloud Networking.md** — private IP, VPC peering for Cloud SQL
- **Google Cloud Identity and IAM.md** — bucket IAM, service accounts
- **MongoDB/MongoDB Basics.md** — compare with Firestore
- **AWS/AWS Storage and Databases.md** — comparison
