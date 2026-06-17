# SQL Server Backup and Restore

## Questions Covered

1. Explain File and Filegroup?
2. Explain the different types of backups in SQL Server.
3. What are SQL Server Recovery Models
4. What is NoRecovery and Recovery Option?
5. How would you restore a database from a backup?
6. How do you perform a database restore using different recovery models (Full, Bulk-Logged, Simple)?
7. How do you set up automated backups in SQL Server?
8. Example for backup and recovery model? Important

## Explain File and Filegroup?

SQL Server databases are stored as **physical files** grouped into **logical filegroups**. This structure improves manageability, performance (I/O placement), and backup/restore flexibility.

### Database files (physical)

| File Type | Extension | Purpose |
|---|---|---|
| Primary data file | `.mdf` | Stores system tables and user data (one per DB). |
| Secondary data file | `.ndf` | Optional extra data files; helps spread data across disks/partitions. |
| Transaction log file | `.ldf` | Records every transaction; required for recovery and point-in-time restores. |

### Filegroups (logical)

- **Primary filegroup**: contains the `.mdf` and objects not assigned elsewhere (default).
- **User-defined filegroups**: additional groups to separate large tables/indexes across different storage.

### Example SQL commands (filegroups)

- Creating a new filegroup:

```sql
ALTER DATABASE YourDatabase
ADD FILEGROUP SecondaryFilegroup;
```

- Adding a file to a filegroup:

```sql
ALTER DATABASE YourDatabase
ADD FILE (
NAME = 'YourDatabase_SecondaryFile',
FILENAME = 'C:\YourPath\YourDatabase_SecondaryFile.ndf',
SIZE = 5MB,
MAXSIZE = 100MB,
FILEGROWTH = 1MB
) TO FILEGROUP SecondaryFilegroup;
```

- Creating a table in a specific filegroup:

```sql
CREATE TABLE YourTable (
ID INT PRIMARY KEY,
Name NVARCHAR(100)
) ON SecondaryFilegroup;
```

### Benefits of filegroups

- Better performance by distributing data across multiple files/IO paths.
- Easier organization for large databases.
- More backup/restore options (optionally target specific filegroups).
- Storage optimization (place different workloads on different storage).

### Backup/restore flexibility to remember

- You can back up **specific filegroups** (plus primary) instead of the whole database.
- You can restore **only the needed filegroups** (then bring the DB online and apply logs as required).

**Example SQL command for filegroup backup**:

```sql
BACKUP DATABASE YourDatabase
```

FILEGROUP = 'SecondaryFilegroup'
TO DISK = 'C:\Backups\YourDatabase_SecondaryFilegroup.bak';

### Summary

- **Files** = `.mdf`, `.ndf`, `.ldf`
- **Filegroups** = logical grouping (Primary + User-defined)
- **Why it matters** = performance + organization + partial backup/restore flexibility

## Explain the different types of backups in SQL Server?

Backup types protect data and define how far you can restore (whole DB vs incremental vs point-in-time).

| Backup Type | Captures | Typical Restore Flow |
|---|---|---|
| **Full** | Entire DB (data + transactional baseline) | Restore full → (optional diff) → (optional logs) |
| **Differential** | Changes since last full | Restore full → restore latest diff → logs |
| **Transaction log** | Changes since last log backup | Restore full/diff → restore logs sequentially to target time |
| **File/Filegroup** | Specific file(s)/filegroup(s) | Restore primary → restore target file/filegroup(s) → logs |
| **Partial** | Primary + read-write filegroups (skips read-only) | Restore partial → restore extra filegroups if needed |
| **Copy-only** | A full/log backup that doesn’t affect normal backup chains | Use ad-hoc without breaking the differential base or log chain |
| **Snapshot** | Read-only point-in-time view | Query/report; not a substitute for backups |

### 1) Full backup

- Captures the entire database + transaction log at the time of backup.

```sql
BACKUP DATABASE SalesDB
TO DISK = 'C:\Backups\SalesDB_Full.bak';
```

### 2) Differential backup

- Captures changes since the **last full backup**.

```sql
BACKUP DATABASE SalesDB
```

TO DISK = 'C:\Backups\SalesDB_Diff.bak'
WITH DIFFERENTIAL;

### 3) Transaction log backup

- Captures transactions since the last log backup; enables point-in-time recovery.

```sql
BACKUP LOG SalesDB
TO DISK = 'C:\Backups\SalesDB_Log.trn';
```

### 4) File and filegroup backup

- Backup only specific files/filegroups (useful for very large DBs).

```sql
BACKUP DATABASE SalesDB
```

FILEGROUP = 'Primary'

TO DISK = 'C:\Backups\SalesDB_FileGroup.bak';

### 5) Partial backup

- Includes **primary filegroup + read-write filegroups** but excludes read-only ones.

```sql
BACKUP DATABASE SalesDB
```

TO DISK = 'C:\Backups\SalesDB_Partial.bak'

WITH PARTIAL;

### 6) Copy-only backup

- Special full or log backup that **does not** change the sequence of regular backups.

```sql
BACKUP DATABASE SalesDB
```

TO DISK = 'C:\Backups\SalesDB_CopyOnly.bak'

WITH COPY_ONLY;

### 7) Snapshot backup

- A database snapshot is a read-only static view of the DB at a point in time.

```sql
CREATE DATABASE SalesDB_Snapshot
ON (NAME = 'SalesDB_Data', FILENAME = 'C:\Backups\SalesDB_Snapshot.ss')
AS SNAPSHOT OF SalesDB;
```

## What are SQL Server Recovery Models

The recovery model controls **how the transaction log is managed** and **how far you can restore**.

### Quick comparison

| Recovery Model | Transaction Log | Restore Precision | Needs Log Backups? |
|---|---|---|---|
| **Simple** | Auto-truncated; not retained for PIT | No point-in-time beyond last full/diff | No |
| **Bulk-Logged** | Reduced logging for bulk ops, but log is still retained | Point-in-time limited around bulk operations | Yes |
| **Full** | Fully logged and retained via log backups | Yes (to any time within log chain) | Yes |

### 1) Simple Recovery Model

- Logs only enough to recover from crashes; **auto-truncates after checkpoints**.
- Backups: typically **full + differential** (no log backups).
- Recovery: only restore to the last full/differential backup (no PIT recovery).

### 2) Bulk-Logged Recovery Model

- Optimizes bulk operations (bulk inserts/index creation) by **minimizing logging** for those operations.
- Still requires **transaction log backups** so you can manage log growth and recover.
- Recovery behavior: PIT is possible, but you can’t recover *into* a bulk operation—only up to the end of the last log backup before the bulk operation began.

### 3) Full Recovery Model

- Logs every transaction and retains log records until they are removed via successful log backups.
- Requires **regular transaction log backups** to enable point-in-time recovery.
- Recovery: you can restore to a specific point in time inside the log backup chain (useful for errors, corruption, or accidental deletion).

### Choosing the right model (interview-ready)

- **Full**: production and compliance; minimizes data loss; PIT recovery required.
- **Bulk-Logged**: heavy bulk loads where you can accept limited recovery granularity for bulk operations.
- **Simple**: dev/test or scenarios where PIT recovery isn’t needed and some data loss is acceptable.

## What is NoRecovery and Recovery Option?

During restore sequences, **NORECOVERY** keeps the database in a **restoring state** so you can apply additional backups/logs. **RECOVERY** finalizes the restore and brings the database online.

### NORECOVERY

- Use when restoring **multiple backups in sequence** (e.g., full + differential + logs).
- The DB remains inaccessible until the final restore uses `RECOVERY`.

```sql
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log_1.trn'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log_2.trn'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log_Final.trn'
WITH RECOVERY;
```

### RECOVERY

- Use on the **final** restore step to make the database available for normal operations.

```sql
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log_Final.trn'
WITH RECOVERY;
```

## How would you restore a database from a backup?

Restoring depends on the backup type and target recovery point. The key pattern is:

- Restore the **base** (full)
- Apply **incrementals** (differentials, then logs) in order
- Finish with **RECOVERY** (or use `NORECOVERY` until the end)

### 1) Restore a full backup

```sql
-- Restore the full backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH RECOVERY;
```

### 2) Restore a differential backup

```sql
-- Restore the full backup first
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- Restore the differential backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Diff.bak'
WITH RECOVERY;
```

### 3) Restore a transaction log backup (point-in-time)

```sql
-- Restore the full backup first
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- Optionally restore a differential backup if applicable
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Diff.bak'
WITH NORECOVERY;
-- Restore transaction log backups
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log1.trn'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log2.trn'
WITH NORECOVERY;
-- Restore the final transaction log backup with RECOVERY
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log_Final.trn'
WITH RECOVERY;
```

### 4) Restore file/filegroup backups

Restore the **primary filegroup first**, then restore additional filegroups/files, then apply logs if needed.

```sql
-- Restore the primary filegroup
RESTORE DATABASE SalesDB
FILE = 'SalesDB_Data'
FROM DISK = 'C:\Backups\SalesDB_FileGroup.bak'
WITH NORECOVERY;
-- Restore additional filegroups
RESTORE DATABASE SalesDB
FILE = 'SalesDB_Additional'
FROM DISK = 'C:\Backups\SalesDB_FileGroup_Additional.bak'
WITH NORECOVERY;
-- Restore the transaction log backup if applicable
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log.trn'
WITH RECOVERY;
```

### 5) Restore with STANDBY (read-only while finishing restore)

```sql
-- Restore the full backup with STANDBY option
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH STANDBY = 'C:\Backups\SalesDB_Standby.bak';
```

## How do you perform a database restore using different recovery models (Full, Bulk-Logged, Simple)?

The core restore sequence is similar, but the recovery model determines whether transaction logs exist and what PIT recovery is possible.

### 1) Full recovery model

```sql
-- Restore the full backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- Restore the differential backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Diff.bak'
WITH NORECOVERY;
-- Restore the transaction log backups
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log1.trn'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log2.trn'
WITH RECOVERY; -- Final restore to bring the database online
```

### 2) Bulk-logged recovery model

```sql
-- Restore the full backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- Restore the transaction log backups
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log1.trn'
WITH NORECOVERY;
RESTORE LOG SalesDB
FROM DISK = 'C:\Backups\SalesDB_Log2.trn'
WITH RECOVERY; -- Final restore to bring the database online
```

### 3) Simple recovery model

```sql
-- Restore the full backup
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- Restore the differential backup (if applicable)
RESTORE DATABASE SalesDB
FROM DISK = 'C:\Backups\SalesDB_Diff.bak'
WITH RECOVERY; -- Final restore to bring the database online
```

### Summary by model

- **Full**: PIT recovery within log chain; requires full + diff + log backups.
- **Bulk-Logged**: PIT exists but bulk operations reduce recovery granularity.
- **Simple**: no log backup chain for PIT; restore using full and (optional) differential.

## How do you set up automated backups in SQL Server?

Automate backups using **SQL Server Agent**:

1. Create an Agent **Job**
2. Add a **T-SQL backup step** (full/diff/log)
3. Configure a **Schedule** (recurring daily/weekly/monthly)
4. Optionally add **Alerts/Notifications**

### Example T-SQL backup step commands

- Full backup:

```sql
BACKUP DATABASE [YourDatabase]
TO DISK = 'C:\Backups\YourDatabase_Full.bak'
WITH INIT, FORMAT;
```

- Differential backup:

```sql
BACKUP DATABASE [YourDatabase]
TO DISK = 'C:\Backups\YourDatabase_Diff.bak'
WITH DIFFERENTIAL;
```

- Transaction log backup:

```sql
BACKUP LOG [YourDatabase]
TO DISK = 'C:\Backups\YourDatabase_Log.trn';
```

### Summary of the setup flow

- Create the job → add backup step(s) → add schedule → optional notifications/alerts → save and test.

## Example for backup and recovery model? Important

### Backup strategy example

- **Full backup**: weekly (every Sunday at midnight)
- **Differential backup**: daily (except Sunday; daily at midnight)
- **Transaction log backups**: hourly during business hours (e.g., 8 AM–8 PM)

### Recovery scenario (accidental deletion at ~3 PM Tuesday)

1. Take a **tail-log backup** (to capture transactions up to the point of failure).
2. Restore the **full** backup (Sunday).
3. Restore the **latest differential** backup (Tuesday midnight).
4. Restore **transaction logs sequentially** up to just before the failure.
5. Restore the **tail-log backup** to reach the exact last moment before the incident.

### Summary (what each backup contributes)

- **Full** = baseline
- **Differential** = since-last-full changes (faster restore than replaying everything)
- **Log backups** = point-in-time recovery window

