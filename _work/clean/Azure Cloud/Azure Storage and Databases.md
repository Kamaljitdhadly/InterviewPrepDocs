# Azure Storage and Databases

## Questions Covered

1. What is an Azure Storage Account, and what types exist?
2. What are Blob Storage tiers and when do you use each?
3. What is Azure Files vs Blob Storage?
4. What is Azure Queue Storage?
5. What is Azure Table Storage?
6. What is Azure SQL Database vs SQL Server on VM?
7. What are Azure SQL service tiers (DTU vs vCore)?
8. What is Azure Cosmos DB, and what are API models?
9. What are Cosmos DB consistency levels?
10. What is geo-redundancy (LRS, ZRS, GRS, GZRS)?
11. How do you secure storage and database access?
12. What is Azure Cache for Redis?
13. How do you choose between SQL, Cosmos DB, and PostgreSQL on Azure?

## What is an Azure Storage Account, and what types exist?

A **Storage Account** is a namespace for Azure Storage data services.

| Service | Purpose |
|---------|---------|
| **Blob** | Objects — files, images, backups, data lakes |
| **File** | SMB/NFS file shares |
| **Queue** | Simple message queue |
| **Table** | NoSQL key-value (legacy; use Cosmos Table API) |

**Account types:**

| Kind | Supported services |
|------|-------------------|
| **StorageV2 (general purpose v2)** | Blob, File, Queue, Table — **default choice** |
| **BlockBlobStorage** | Premium block blobs only |
| **FileStorage** | Premium file shares only |

```bash
az storage account create \
  --resource-group rg-prod \
  --name myappprodstore \
  --sku Standard_GRS \
  --kind StorageV2 \
  --access-tier Hot
```

**Naming:** globally unique, 3–24 lowercase letters/numbers.

## What are Blob Storage tiers and when do you use each?

| Tier | Access pattern | Cost |
|------|----------------|------|
| **Hot** | Frequent read/write | Higher storage, lower access |
| **Cool** | Infrequent (≥30 days) | Lower storage, higher access |
| **Cold** | Rare (≥90 days) | Cheaper storage |
| **Archive** | Long-term retention (≥180 days) | Cheapest; rehydrate delay hours |

```bash
az storage blob upload \
  --account-name myappprodstore \
  --container-name uploads \
  --name report.pdf \
  --file ./report.pdf \
  --tier Hot
```

**Lifecycle management** — auto-transition to Cool/Archive or delete after N days.

```json
{
  "rules": [{
    "name": "move-to-cool",
    "type": "Lifecycle",
    "definition": {
      "actions": { "baseBlob": { "tierToCool": { "daysAfterModificationGreaterThan": 30 } } },
      "filters": { "blobTypes": ["blockBlob"], "prefixMatch": ["logs/"] }
    }
  }]
}
```

## What is Azure Files vs Blob Storage?

| | Azure Files | Blob Storage |
|---|-------------|--------------|
| **Protocol** | SMB, NFS | REST API |
| **Use case** | Lift-and-shift file shares, shared config | App uploads, static sites, data lake |
| **Mount** | `\\server\share` or NFS mount | SDK/REST |
| **Example** | Legacy app needs shared drive | Web app stores user photos |

```bash
az storage share create --account-name myappprodstore --name appconfig
# Mount on Windows VM: \\myappprodstore.file.core.windows.net\appconfig
```

## What is Azure Queue Storage?

Simple **async message queue** — cost-effective, REST-based, for decoupling app components.

| Concept | Detail |
|---------|--------|
| **Message** | Up to 64 KB text |
| **Visibility timeout** | Message hidden after dequeue |
| **TTL** | Auto-delete unprocessed messages |

```csharp
var queueClient = new QueueClient(connectionString, "orders");
await queueClient.SendMessageAsync(JsonSerializer.Serialize(order));

var message = await queueClient.ReceiveMessageAsync();
await ProcessOrder(message.Value.MessageText);
await queueClient.DeleteMessageAsync(message.Value.MessageId, message.Value.PopReceipt);
```

For advanced messaging (topics, sessions, dead-letter) → **Azure Service Bus**. See **Azure Messaging and Integration.md**.

## What is Azure Table Storage?

**Table Storage** — NoSQL key-value store (partition key + row key). Legacy for new apps; prefer **Cosmos DB Table API** for SLA and global distribution.

```csharp
var client = new TableClient(connectionString, "Customers");
await client.AddEntityAsync(new CustomerEntity { PartitionKey = "US", RowKey = "C001", Name = "Acme" });
```

## What is Azure SQL Database vs SQL Server on VM?

| | Azure SQL Database | SQL Server on VM |
|---|-------------------|------------------|
| **Model** | PaaS — managed | IaaS — you manage OS/SQL |
| **Patching** | Automatic | You |
| **Features** | Most SQL Server features; some gaps | Full SQL Server |
| **Best for** | New cloud apps, auto-scale | Legacy apps needing full SQL/agent control |

```bash
az sql server create --name myserver-prod --resource-group rg-prod --location eastus --admin-user sqladmin --admin-password 'ComplexP@ss1!'
az sql db create --resource-group rg-prod --server myserver-prod --name appdb --service-objective S1
```

**Connection from App Service:**

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSql")));
```

## What are Azure SQL service tiers (DTU vs vCore)?

| Model | Description |
|-------|-------------|
| **DTU** | Bundled compute+storage+IO — simple sizing (Basic, S1–S12, P1–P15) |
| **vCore** | Separate compute and storage — more control, Hyperscale option |

| Tier | Use case |
|------|----------|
| **Basic/Standard** | Dev, small prod |
| **Premium / Business Critical** | Low latency, high IO, zone redundancy |
| **Hyperscale** | Up to 100 TB, rapid scale, read replicas |

```bash
az sql db create --resource-group rg-prod --server myserver-prod \
  --name appdb --edition GeneralPurpose --compute-model Serverless \
  --family Gen5 --capacity 2
```

**Serverless** — auto-pause when idle (dev cost savings).

## What is Azure Cosmos DB, and what are API models?

**Cosmos DB** — globally distributed, multi-model NoSQL with guaranteed SLAs.

| API | Wire protocol compatible with |
|-----|-------------------------------|
| **NoSQL (native)** | Cosmos SDK — JSON documents |
| **MongoDB** | MongoDB drivers |
| **PostgreSQL (Citus)** | PostgreSQL |
| **Cassandra** | Cassandra |
| **Gremlin** | Graph databases |
| **Table** | Azure Table Storage |

```csharp
var client = new CosmosClient(connectionString);
var container = client.GetContainer("orders-db", "orders");
await container.CreateItemAsync(order, new PartitionKey(order.CustomerId));
```

**Partition key** — critical for performance; choose high-cardinality key with even distribution (e.g. `customerId`, not `country` alone).

## What are Cosmos DB consistency levels?

| Level | Description | Use case |
|-------|-------------|----------|
| **Strong** | Linearizable reads | Financial, inventory |
| **Bounded staleness** | Reads lag behind writes by K versions/T time | Configurable global apps |
| **Session** | Consistent within a session (default) | Most user-facing apps |
| **Consistent prefix** | Reads see writes in order | |
| **Eventual** | Fastest, may read stale data | Metrics, social feeds |

Trade-off: **stronger consistency = higher latency and RU cost**.

## What is geo-redundancy (LRS, ZRS, GRS, GZRS)?

| Redundancy | Copies | Scope |
|------------|--------|-------|
| **LRS** | 3 copies in one datacenter | Cheapest |
| **ZRS** | 3 copies across AZs in region | Zone-resilient |
| **GRS** | LRS + async copy to paired region | DR (secondary read-only) |
| **GZRS** | ZRS + geo copy | Best storage resilience |
| **RA-GRS / RA-GZRS** | Read access to secondary | Read from DR region |

```bash
az storage account create --name myappprodstore --sku Standard_GZRS ...
```

**Azure SQL:** active geo-replication, auto-failover groups for cross-region DR.

## How do you secure storage and database access?

| Control | Implementation |
|---------|----------------|
| **No public access** | Disable storage public blob access |
| **Private Endpoint** | Storage/SQL accessible only via VNet |
| **Managed Identity** | App Service → Storage/SQL without connection string secrets |
| **RBAC** | `Storage Blob Data Contributor` on scope |
| **Encryption** | SSE by default; CMK via Key Vault optional |
| **Firewall** | SQL: allow only Azure services or specific IPs/VNets |

```csharp
// Managed identity — no account key in config
var credential = new DefaultAzureCredential();
var blobClient = new BlobServiceClient(
    new Uri("https://myappprodstore.blob.core.windows.net"),
    credential);
```

```bash
az sql server update --name myserver-prod --resource-group rg-prod --public-network-access Disabled
```

## What is Azure Cache for Redis?

**Azure Cache for Redis** — in-memory cache for session state, output caching, pub/sub, rate limiting.

| Tier | Features |
|------|----------|
| **Basic** | Single node, dev |
| **Standard** | Two-node replica, SLA |
| **Premium** | Clustering, persistence, VNet injection |

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
});
```

Use with **cache-aside pattern** — read cache first, on miss query DB and populate cache.

## How do you choose between SQL, Cosmos DB, and PostgreSQL on Azure?

| Need | Choice |
|------|--------|
| Relational, ACID, JOINs, reporting | **Azure SQL** or **Azure Database for PostgreSQL** |
| Global scale, flexible schema, low latency worldwide | **Cosmos DB** |
| MongoDB compatibility | **Cosmos DB MongoDB API** or **Azure Cosmos for MongoDB vCore** |
| Existing SQL Server features (SSIS, agent jobs) | **SQL on VM** |
| Open-source PostgreSQL extensions | **Azure Database for PostgreSQL Flexible Server** |

```text
E-commerce orders + inventory (relational)  → Azure SQL
Product catalog (flexible JSON, global)       → Cosmos DB
Session cache                                 → Redis
File uploads                                  → Blob Storage
```

## Related Topics

- **Azure Networking.md** — private endpoints, VNet integration
- **Azure Messaging and Integration.md** — Queue vs Service Bus
- **Azure Compute.md** — App Service connection to databases
- **MongoDB/MongoDB Basics.md** — compare with Cosmos MongoDB API
