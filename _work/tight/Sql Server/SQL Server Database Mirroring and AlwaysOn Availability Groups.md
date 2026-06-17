# SQL Server Database Mirroring and AlwaysOn Availability Groups

## Questions Covered

1. Difference between High Availability (HA) and Disaster Recovery (DR)
2. What is database mirroring in SQL Server? Explain its modes.
3. How do you set up SQL Server database mirroring?
4. What is SQL Server replication, and what are the types of replication (Snapshot, Transactional, Merge)?
5. What is SQL Server log shipping?
6. What is the difference between replication and log shipping?
7. What is SQL Server AlwaysOn Availability Groups?
8. How do you set up and configure AlwaysOn in SQL Server?
9. What is the difference between AlwaysOn Failover Cluster Instances (FCI) and AlwaysOn Availability Groups?

## Difference between High Availability (HA) and Disaster Recovery (DR)

| Concept | Focus | Goal |
|---|---|---|
| **High Availability (HA)** | Failures during normal operation | Keep the service up with minimal downtime/fast failover |
| **Disaster Recovery (DR)** | Major outages/disasters | Restore service/data after a severe event (RTO/RPO-driven) |

Real-world example (e-commerce):
- **HA**: a server fails during peak hours → another node takes over immediately; users don’t notice.
- **DR**: a whole data center is destroyed → you restore from a secondary site/backups (hours to a day, depending on plan).

## What is database mirroring in SQL Server? Explain its modes.

**Database mirroring** duplicates database transactions from a **principal** server to a **mirror** server for HA and redundancy. It’s built for **full recovery model** databases, and it’s **one-to-one** (principal serves workload; mirror is standby).

### Modes

| Mode | Sync | Principal waits for mirror? | Automatic failover | Data-loss risk |
|---|---|---|---|---|
| **High-Safety (Synchronous)** | Yes | Yes | With **witness** | Minimal |
| **High-Performance (Asynchronous)** | No | No | Not supported | Possible (mirror can lag) |
| **High-Safety + Witness** | Yes | Yes | Yes (witness promotes mirror) | Minimal |

- **High-Safety**: prioritize data safety; more latency.
- **High-Performance**: better performance; mirror might not be fully caught up.
- **Witness**: third server enabling automatic failover in high-safety scenarios.

### Why mirroring (and why it isn’t scaling/distributed)

- Mirroring’s main goals: **high availability**, **data redundancy**, and **disaster recovery** for a single DB.
- It is **not** for scalability/load balancing: only the principal handles queries; the mirror waits.
- It’s not a distributed/sharded design (distributed systems partition/scale out; mirroring is one-to-one).

## How do you set up SQL Server database mirroring?

Mirroring setup connects **two (or three)** SQL Server instances and configures mirroring endpoints, permissions, and partnership settings.

### Prerequisites

1. **Two (or three) instances**
   - Principal (active DB)
   - Mirror (copy)
   - Witness (optional for automatic failover)
2. **Editions**
   - SQL Server Standard supports high-safety without auto failover
   - Enterprise supports high-safety with automatic failover / high-performance options
3. **FULL recovery model** on the database
4. On the principal: have a **full backup** + **transaction log backup**

### Step-by-step (T-SQL examples)

#### Step 1: switch database to FULL

```sql
USE master;
ALTER DATABASE [YourDatabaseName] SET RECOVERY FULL;
```

#### Step 2: full + log backups from the principal

```sql
BACKUP DATABASE [YourDatabaseName]
TO DISK = 'C:\Backup\YourDatabaseName_Full.bak';
```

```sql
BACKUP LOG [YourDatabaseName]
TO DISK = 'C:\Backup\YourDatabaseName_Log.bak';
```

#### Step 4: restore on the mirror (NORECOVERY)

```sql
-- Restore Full Backup on Mirror
RESTORE DATABASE [YourDatabaseName]
FROM DISK = 'C:\Backup\YourDatabaseName_Full.bak'
WITH NORECOVERY;
-- Restore Transaction Log Backup on Mirror
RESTORE LOG [YourDatabaseName]
FROM DISK = 'C:\Backup\YourDatabaseName_Log.bak'
WITH NORECOVERY;
```

#### Step 5: configure database mirroring endpoints (TCP)

You need to create **endpoints** on both the principal and mirror servers for communication. These endpoints use **TCP/IP** for data transfer.

- On the **Principal Server**:

CREATE ENDPOINT [MirroringEndpoint]
STATE = STARTED
AS TCP (LISTENER_PORT = 5022)

```sql
FOR DATABASE_MIRRORING (ROLE = PARTNER);
```

- On the **Mirror Server**:

CREATE ENDPOINT [MirroringEndpoint]
STATE = STARTED
AS TCP (LISTENER_PORT = 5022)

```sql
FOR DATABASE_MIRRORING (ROLE = PARTNER);
```

- On the **Witness Server** (optional):

CREATE ENDPOINT [WitnessEndpoint]
STATE = STARTED
AS TCP (LISTENER_PORT = 5023)

```sql
FOR DATABASE_MIRRORING (ROLE = WITNESS);
```

Make sure the **firewall** on all servers allows traffic on the configured ports (5022 or 5023 by default).

#### Step 6: grant CONNECT permissions on endpoints

Each SQL Server instance must be granted permission to connect to the endpoints of the other instances.

- On the **Principal Server**:

GRANT CONNECT ON ENDPOINT::[MirroringEndpoint] TO [Domain\MirrorServerLogin];
GRANT CONNECT ON ENDPOINT::[MirroringEndpoint] TO [Domain\WitnessServerLogin];

- On the **Mirror Server**:

GRANT CONNECT ON ENDPOINT::[MirroringEndpoint] TO [Domain\PrincipalServerLogin];

- On the **Witness Server** (optional):

GRANT CONNECT ON ENDPOINT::[WitnessEndpoint] TO [Domain\PrincipalServerLogin];
GRANT CONNECT ON ENDPOINT::[WitnessEndpoint] TO [Domain\MirrorServerLogin];

#### Step 7: configure mirroring partner + witness

Option 1: **SSMS wizard** (right-click DB → Tasks → Mirror → Configure Security → Start Mirroring).

Option 2: **T-SQL**

On the **principal**:

```sql
ALTER DATABASE [YourDatabaseName]
SET PARTNER = 'TCP://MirrorServerName:5022';
```

On the **mirror**:

```sql
ALTER DATABASE [YourDatabaseName]
SET PARTNER = 'TCP://PrincipalServerName:5022';
```

For automatic failover, set witness:

On the **principal**:

```sql
ALTER DATABASE [YourDatabaseName]
SET WITNESS = 'TCP://WitnessServerName:5023';
```

#### Step 8: verify mirroring

```sql
SELECT DB_NAME(database_id) AS DatabaseName, mirroring_state_desc, mirroring_role_desc, mirroring_safety_level_desc
FROM sys.database_mirroring;
```

#### Step 9: test failover (optional)

```sql
-- Manual failover (if automatic failover is not enabled)
ALTER DATABASE [YourDatabaseName] SET PARTNER FAILOVER;
```

### Summary of mirroring setup

1. Ensure **FULL** recovery model
2. Full backup + transaction log backup on principal
3. Restore on mirror using **NORECOVERY**
4. Create mirroring endpoints (and optional witness endpoint)
5. Grant **CONNECT** permissions
6. Configure partner/witness via SSMS or T-SQL
7. Verify + test failover

## What is SQL Server replication, and what are the types of replication (Snapshot, Transactional, Merge)?

**SQL Server Replication** copies/distributes data and database objects from a **publisher** to **subscribers**, syncing changes (near real-time or scheduled).

### Replication components

- **Publisher**: source of replicated data
- **Subscriber**: destination that receives changes
- **Distributor**: manages distribution DB/metadata/history + transaction holding (can be publisher)
- **Publication**: a set of articles
- **Article**: table/view/object in the publication
- **Subscription**: how/when the subscriber receives the publication

### Replication types (interview comparison)

| Type | Update direction | How it syncs | Typical use |
|---|---|---|---|
| **Snapshot** | One-way | Copy entire data set at an interval | Reference data that changes infrequently |
| **Transactional** | One-way | Incremental INSERT/UPDATE/DELETE captured and applied near real-time | Reporting/data warehousing; read-mostly subscribers |
| **Merge** | Two-way | Publisher + subscriber can update; changes merged with conflict resolution | Offline/disconnected scenarios (mobile/remote) |

#### Snapshot replication
- Best when data changes infrequently and overwriting the dataset is acceptable.

#### Transactional replication
- Best when the subscriber needs near-real-time updates and consistent data.

#### Merge replication
- Best when both publisher and subscriber can change data independently (requires conflict resolution).

## What is SQL Server log shipping?

**Log shipping** automates sending **transaction log backups** from a primary DB to one or more secondary DBs on separate servers. It’s a cost-effective DR approach that maintains a **warm standby**.

### How it works (3 stages)

1. **Backup** transaction logs on primary at intervals
2. **Copy** those log backup files to the secondary server(s)
3. **Restore** logs on secondary (keeping it synchronized)

### Key components

- Primary server (backup job)
- Secondary server(s) (copy + restore jobs)
- Optional monitor server (alerts on failures)

### Advantages

- Disaster recovery with controllable data loss window (based on log backup interval).
- Multiple secondaries possible.
- Works without AlwaysOn/enterprise-only clustering features (cost effective).
- Can be configured for **read-only reporting** using standby mode.

### Disadvantages

- Failover is typically **manual** (admin brings secondary online).
- Data loss possible based on log backup timing.
- Not real-time like AGs/mirroring; backup/copy/restore runs periodically.
- No automatic client redirection.

### Modes

- **Restoring mode**: secondary not usable between restores.
- **Standby mode**: secondary becomes **read-only** for reporting while restore continues.

## What is the difference between replication and log shipping?

The difference is primarily about **purpose** and **how synchronization happens**:
- **Replication** distributes/propagates data changes (can replicate specific objects) and is configurable for near real-time updates or bidirectional merge.
- **Log shipping** ships **transaction log backups** at intervals (database-level), mainly for DR and standby reporting.

### Replication vs Log Shipping

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 40%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><strong>Feature/Characteristic</strong></th>
<th style="text-align: center;"><strong>Replication</strong></th>
<th style="text-align: center;"><strong>Log Shipping</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Purpose</strong></td>
<td>- Distribute data across multiple databases for read/write operations.<br />
- Allows data to be modified and synchronized between databases.</td>
<td>- Provide high availability and disaster recovery.<br />
- Create a standby copy of the database for failover purposes.</td>
</tr>
<tr>
<td><strong>Data Synchronization</strong></td>
<td>- Changes (INSERTs, UPDATEs, DELETEs) are captured and applied to subscribers in near real-time or periodically.</td>
<td>- Transaction log backups from the primary server are periodically shipped and restored to the secondary server.</td>
</tr>
<tr>
<td><strong>Granularity of Replication</strong></td>
<td>- Can replicate individual tables, views, stored procedures, or other objects.</td>
<td>- Works at the database level, shipping entire databases.</td>
</tr>
<tr>
<td><strong>Data Flow</strong></td>
<td>- Can be <strong>one-way</strong> (from publisher to subscriber) or <strong>two-way</strong> (bi-directional with merge replication).</td>
<td>- One-way: from the <strong>primary</strong> to the <strong>secondary</strong> server.</td>
</tr>
<tr>
<td><strong>Type of Operations</strong></td>
<td>- Allows data to be modified at both ends (with merge replication).</td>
<td>- Read-only on the secondary server (except during failover).</td>
</tr>
<tr>
<td><strong>Latency</strong></td>
<td>- Near real-time or scheduled updates depending on the replication type.</td>
<td>- Typically has <strong>delayed updates</strong>, depending on the frequency of transaction log backups (e.g., every few minutes).</td>
</tr>
<tr>
<td><strong>Conflict Resolution</strong></td>
<td>- Built-in conflict resolution in <strong>merge replication</strong>.</td>
<td>- No conflict resolution because the secondary database is in <strong>read-only mode</strong>.</td>
</tr>
<tr>
<td><strong>Failover Support</strong></td>
<td>- Primarily for data <strong>distribution</strong>, not automatic failover.<br />
- <strong>Transactional replication</strong> can be used for high availability, but manual intervention is required for failover.</td>
<td>- Designed for <strong>disaster recovery</strong> and <strong>failover</strong> scenarios.<br />
- The secondary server can take over as the primary after failover.</td>
</tr>
<tr>
<td><strong>Complexity</strong></td>
<td>- More complex setup with multiple configuration options (e.g., snapshot, transactional, and merge replication).</td>
<td>- Simpler to set up compared to replication, primarily requiring transaction log backups to be shipped and restored.</td>
</tr>
<tr>
<td><strong>Supported Databases</strong></td>
<td>- Allows replication between different databases (including non-SQL Server databases).</td>
<td>- Limited to SQL Server databases.</td>
</tr>
<tr>
<td><strong>Read-Only Option</strong></td>
<td>- Subscribers in <strong>snapshot</strong> or <strong>transactional replication</strong> are typically <strong>read-only</strong> but can be <strong>read-write</strong> with merge replication.</td>
<td>- The secondary database is <strong>read-only</strong>, unless <strong>standby mode</strong> is enabled.</td>
</tr>
<tr>
<td><strong>Network Usage</strong></td>
<td>- Higher network usage in <strong>real-time</strong> replication scenarios (transactional replication).</td>
<td>- Lower network usage, as it relies on <strong>periodic transaction log backups</strong>.</td>
</tr>
<tr>
<td><strong>Failover Time</strong></td>
<td>- Not designed for failover. Manual intervention needed for <strong>transactional replication</strong>.</td>
<td>- Faster failover compared to replication, especially in <strong>automated log shipping</strong> setups.</td>
</tr>
</tbody>
</table>

## What is SQL Server AlwaysOn Availability Groups?

**AlwaysOn Availability Groups** (SQL Server 2012+) provide HA/DR by grouping databases and replicating them across SQL Server instances with automatic/manual failover and redundancy.

### Key components

1. **Availability Group**: container for one or more DBs; failover occurs as a group.
2. **Replica**
   - **Primary Replica**: clients connect here; read/write occurs.
   - **Secondary Replicas**: store copies; some can be readable (offload reporting).
3. **Failover**
   - **Automatic**: secondary takes over automatically (requires synchronous + automatic failover configuration).
   - **Manual**: admin promotes a secondary.
   - **Planned**: maintenance failover without unexpected outage.
4. **Synchronous vs asynchronous replication**
   - **Synchronous**: commit on both primary and secondary first (consistency; possible latency).
   - **Asynchronous**: commit on primary first; secondaries may lag (better perf; more failover risk).

### Features (commonly asked)

- Multiple DBs per group (unlike mirroring which targets single DBs).
- Read-scale via **readable secondaries**.
- Up to **8 secondary replicas** (up to **5** can be readable).
- **Listener**: virtual network name for connecting without knowing current primary.
- Flexible failover policies with health checks/monitoring.
- Cross-datacenter disaster recovery using async replicas to reduce latency.

### AlwaysOn vs Database Mirroring

| **Feature** | **Database Mirroring** | **AlwaysOn Availability Groups** |
|---|---|---|
| **Database Scope** | Single database | Multiple databases grouped together |
| **Secondary Replicas** | 1 mirror (non-readable) | Up to 8 secondaries (5 readable) |
| **Read-Only Workloads** | Not supported | Readable secondaries |
| **Replication Modes** | Synchronous/Asynchronous | Synchronous/Asynchronous |
| **Failover** | Automatic or manual | Automatic or manual (sync replicas for automatic) |
| **Load Balancing** | Not supported | Read-query load balancing across secondaries |

## How do you set up and configure AlwaysOn in SQL Server?

High-level setup: prepare prerequisites, configure replicas, create the Availability Group, validate synchronization, test failover, and connect via listener.

### Prerequisites

1. **Enterprise Edition** on all nodes
2. **Windows Failover Clustering** configured
3. Databases in **FULL recovery model**
4. Full backups created before adding DBs to the AG
5. Listener setup optional (but recommended)

### Steps to set up (condensed)

#### Step 1: enable AlwaysOn on each instance
- Use SQL Server Configuration Manager → AlwaysOn High Availability → enable → restart SQL Server.

#### Step 2: create Windows Failover Cluster
- Ensure a WSFC exists with these nodes as cluster members.

#### Step 3: set DB recovery model to FULL

```sql
USE master;
ALTER DATABASE [YourDatabaseName] SET RECOVERY FULL;
```

Then take a full backup.

#### Step 4: create the Availability Group in SSMS
- Wizard: select DBs, add replicas, choose failover mode (automatic/manual) and commit mode (synchronous for automatic failover; readable secondaries for offloading).
- Optionally configure **listener** (DNS name, port default 1433, IP).

#### Step 5: verify
- In SSMS, check Availability Replicas/Databases show **Synchronized** for synchronous replicas.

#### Step 6: test failover (SSMS wizard)

```sql
-- Check the status of Availability Group and replicas
SELECT ag.name, ar.replica_server_name, adc.database_name, adc.synchronization_state_desc
FROM sys.availability_groups ag
JOIN sys.availability_replicas ar ON ag.group_id = ar.group_id
JOIN sys.dm_hadr_availability_replica_cluster_nodes arcn ON ar.replica_id = arcn.replica_id
JOIN sys.dm_hadr_database_replica_cluster_states adc ON ar.replica_id = adc.replica_id;
```

#### Step 7: connect using the listener

`Data Source=AGListenerName;Initial Catalog=YourDatabaseName;Integrated Security=True;`

### Summary of the process

- Enable AlwaysOn → set up WSFC → create AG → configure replication + failover policy → optional listener → test failover → use listener for connections.

## What is the difference between AlwaysOn Failover Cluster Instances (FCI) and AlwaysOn Availability Groups?

Both provide HA/DR, but they differ in protection level and architecture:
- **FCI**: instance-level protection using WSFC + shared storage.
- **Availability Groups**: database-level protection using replicated database copies across replicas.

### AlwaysOn FCI (instance-level)

- Protects the whole SQL Server instance (all DBs, system DBs, jobs/logins).
- Uses **shared storage** so there’s a single physical copy of data.
- Fails over automatically at instance level; no data synchronization overhead, but storage is a single dependency.

### AlwaysOn Availability Groups (database-level)

- Protects only user databases in the AG (system DBs excluded).
- Each replica has its own copy (redundancy by replication).
- Supports readable secondaries and read-scale; automatic failover requires synchronous replicas.
- Can be used across geographically dispersed replicas (async).

### Comparison table

| **Feature** | **AlwaysOn Failover Cluster Instances (FCI)** | **AlwaysOn Availability Groups** |
|---|---|---|
| **Level of Protection** | Instance-level | Database-level |
| **Storage** | Shared storage | Each replica has its own DB copy |
| **Failover Nodes** | One SQL Server instance floating across nodes | Up to 9 replicas (1 primary + up to 8 secondaries) |
| **Read-only Workloads** | Not possible (one active instance) | Readable secondary replicas |
| **Automatic Failover** | Supported | Supported for synchronous replicas |
| **Replication Mode** | N/A (shared storage) | Synchronous or asynchronous replication |
| **Failover Granularity** | Instance-level | Database-level |
| **Cross-data center support** | Limited (shared storage must be accessible) | Better support via geographically distributed replicas |
| **Data redundancy** | No redundancy beyond shared storage | Redundant copies on each replica |
| **Setup complexity** | Requires shared storage + WSFC | More moving parts (instances, replication, storage per replica) |

### Which one to use?

- **Use FCI when** you need instance-level HA, rely on SAN/shared-storage redundancy, and want system DBs/jobs/logins protected too.
- **Use Availability Groups when** you need database-level protection, read-scale (readable secondaries), redundancy across nodes, and flexibility with synchronous/asynchronous replication and DR.

