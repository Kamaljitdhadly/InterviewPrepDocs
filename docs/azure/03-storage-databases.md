# Storage & Databases (Blob, SQL, Cosmos DB)

## Concept Explanation

**Azure Storage Account** offers several data services:
- **Blob storage** — unstructured objects (files, images, backups). Access tiers: **Hot / Cool / Archive** trade storage cost vs access cost/latency.
- **Queue, Table, File** — simple queues, NoSQL key-value, and SMB file shares.
- **Redundancy:** LRS (local), ZRS (zonal), GRS/RA-GRS (geo-replicated).

**Databases:**
- **Azure SQL Database** — managed (PaaS) SQL Server. Models: single DB, elastic pool, managed instance.
- **Azure Cosmos DB** — globally distributed, multi-model NoSQL with tunable consistency and single-digit-ms latency; partition-key-based horizontal scaling.
- Also **Azure Database for PostgreSQL/MySQL**, **Azure Cache for Redis**.

## Code Example(s)

```bash
# Blob storage
az storage account create -g rg-shop -n shopstorage --sku Standard_LRS --kind StorageV2
az storage container create --account-name shopstorage -n images
az storage blob upload --account-name shopstorage -c images -f logo.png -n logo.png

# Azure SQL
az sql server create -g rg-shop -n shop-sql --admin-user sa --admin-password '***'
az sql db create -g rg-shop -s shop-sql -n shopdb --service-objective S1

# Cosmos DB (NoSQL/SQL API)
az cosmosdb create -g rg-shop -n shop-cosmos --locations regionName=eastus
```

```csharp
// Cosmos DB query — partition key is critical for performance/cost
var container = cosmosClient.GetContainer("shop", "orders");
var query = new QueryDefinition(
    "SELECT * FROM c WHERE c.customerId = @id")
    .WithParameter("@id", customerId);
// Querying by partition key (customerId) is cheap & fast; cross-partition is costly.
```

## Interview Q&A

**🟢 What is Azure Blob storage used for?**
Storing large amounts of unstructured data — images, videos, documents, backups, logs — accessed via HTTP(S). It supports tiers (Hot/Cool/Archive) to optimize cost by access frequency.

**🟢 What is the difference between Azure SQL Database and Cosmos DB?**
Azure SQL is a managed relational database (structured, SQL, strong consistency, vertical-ish scaling). Cosmos DB is a globally distributed NoSQL database with horizontal partitioning, tunable consistency, and very low latency — for massive scale and global reach.

**🟡 What are blob access tiers?**
Hot (frequent access, higher storage cost, low access cost), Cool (infrequent, ~30 days), and Archive (rarely accessed, cheapest storage but retrieval takes hours and costs more). You tier data to balance storage vs access cost.

**🟡 What is a partition key in Cosmos DB and why is it important?**
It determines how data is distributed across physical partitions. A good (high-cardinality, evenly accessed) partition key spreads load and keeps queries within a single partition (cheap/fast); a poor one creates "hot partitions" and expensive cross-partition queries.

**🔴 Explain Cosmos DB consistency levels.**
Five levels from strongest to weakest: **Strong, Bounded Staleness, Session, Consistent Prefix, Eventual**. Stronger consistency means higher latency/cost and less availability; weaker means faster/cheaper but you may read stale data. **Session** (default) is a good balance for most apps.

## ⚠️ Tricky / Gotchas

- **Archive tier retrieval is slow (hours) and not instant** — reading archived blobs requires "rehydration." Don't archive data you may need quickly.
- **Cosmos DB charges in RU/s (Request Units)** — poorly chosen partition keys and cross-partition queries burn RUs fast, spiking cost and causing throttling (429s).
- **Cosmos "Strong" consistency limits multi-region writes** and adds latency — people pick it by default unnecessarily. Session is usually right.
- **Storage redundancy ≠ backup** — GRS protects against region loss but won't undo an accidental delete/overwrite; you still need backups/soft-delete/versioning.
- **Connection strings/keys in code** are a security risk — prefer Managed Identity + RBAC (see Identity topic).

## 📌 Quick Recap

- Storage account: Blob (objects, Hot/Cool/Archive tiers), Queue, Table, File; redundancy LRS/ZRS/GRS.
- Azure SQL = managed relational (structured, strong consistency); Cosmos DB = global NoSQL (partitioned, tunable consistency, low latency).
- Cosmos partition key drives scale/cost — avoid hot partitions & cross-partition queries.
- Cosmos consistency: Strong → Bounded → Session (default) → Consistent Prefix → Eventual.
- Archive tier = cheap storage, slow/costly retrieval.
- Redundancy isn't backup; use Managed Identity over keys.
