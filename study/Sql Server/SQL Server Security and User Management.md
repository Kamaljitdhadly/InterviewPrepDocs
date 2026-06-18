# SQL Server Security and User Management

## Questions Covered

1. What are the different types of authentication modes in SQL Server?
2. How do you manage database roles and permissions?
3. How do you secure data using encryption in SQL Server?
4. What are SQL Server security best practices?
5. How do you configure SQL Server for secure remote access?
6. What is SQL Server Audit and how do you use it for security monitoring?

## What are the different types of authentication modes in SQL Server?

SQL Server supports **Windows Authentication**, **SQL Server Authentication**, and **Mixed Mode** (both).

### 1. Windows Authentication

Uses Windows credentials via the OS security subsystem — no separate SQL login needed.

**Example:** User JohnDoe logs into Windows; SSMS connects using those credentials automatically.

**Configuration:** SSMS → Server Properties → Security → **Windows Authentication mode** → restart SQL Server.

**Benefits:** SSO; inherits Windows password policies and account lockout.

### 2. SQL Server Authentication

Uses SQL Server–managed usernames and passwords — independent of Windows.

**Example:** Login `appUser` / `securePassword123` for non-domain apps.

**Configuration:** Server Properties → Security → **SQL Server and Windows Authentication mode** → restart.

**Benefits:** flexibility for non-Windows users/apps; cross-platform support.

### 3. Mixed Mode Authentication

Accepts both Windows and SQL Server logins — same configuration as SQL Server Authentication mode.

**Example:** Internal users via Windows; external apps via SQL logins.

| Mode | Credentials | Best For |
|------|-------------|----------|
| Windows | OS/domain account | Domain-joined environments |
| SQL Server | SQL login/password | Non-Windows clients |
| Mixed | Both | Diverse user/app requirements |

## How do you manage database roles and permissions?

Roles group permissions; **GRANT/DENY/REVOKE** control access at database, schema, table, or column level.

### 1. Understanding Database Roles

**Fixed database roles** (predefined, unalterable permissions):

| Role | Permissions |
|------|-------------|
| db_owner | Full database control |
| db_accessadmin | Manage database users |
| db_securityadmin | Manage roles and permissions |
| db_backupoperator | Backup database |
| db_datareader | Read all user tables |
| db_datawriter | Insert/update/delete all user tables |

**User-defined roles** — custom permission groups:

```sql
USE YourDatabase;
GO
-- Create a custom role
CREATE ROLE YourCustomRole;
GO
-- Add a user to the role
ALTER ROLE YourCustomRole ADD MEMBER YourUser;
GO
```

### 2. Managing Permissions

**GRANT** — allow access:

```sql
USE YourDatabase;
GO
-- Grant SELECT permission on a table to a role
GRANT SELECT ON dbo.YourTable TO YourCustomRole;
GO
```

**DENY** — explicitly block (overrides GRANT):

```sql
USE YourDatabase;
GO
-- Deny DELETE permission on a table to a user
DENY DELETE ON dbo.YourTable TO YourUser;
GO
```

**REVOKE** — remove granted or denied permissions:

```sql
USE YourDatabase;
GO
-- Revoke SELECT permission on a table from a role
REVOKE SELECT ON dbo.YourTable FROM YourCustomRole;
GO
```

### 3. Assigning Roles to Users

```sql
USE YourDatabase;
GO
-- Add a user to a role
ALTER ROLE YourCustomRole ADD MEMBER YourUser;
GO
```

### 4. Viewing Roles and Permissions

```sql
USE YourDatabase;
GO
-- List all database roles
SELECT * FROM sys.database_principals
WHERE type = 'R';
GO
```

```sql
USE YourDatabase;
GO
-- List all permissions for a specific user
SELECT * FROM sys.database_permissions
WHERE grantee_principal_id = USER_ID('YourUser');
GO
```

### 5. Security Best Practices

- **Least privilege** — minimum permissions needed.
- **Role-based access** — assign roles, not individual permissions.
- **Regular audits** — review roles and permissions periodically.
- **Protect sensitive data** — restrict access to authorized users.

## How do you secure data using encryption in SQL Server?

SQL Server provides encryption for data **at rest**, **in use** (column-level), and **in transit**.

### 1. Types of Encryption

| Type | Scope | Key Point |
|------|-------|-----------|
| TDE | Entire database at rest | Transparent; no app changes |
| Always Encrypted | Specific columns | Client-side encrypt/decrypt |
| Column-level (symmetric key) | Individual columns | `ENCRYPTBYKEY`/`DECRYPTBYKEY` |
| SSL/TLS | Data in transit | Connection encryption |

### 2. Transparent Data Encryption (TDE)

**Step 1: Master key**

```sql
USE master;
GO
-- Create a master key
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'YourStrongPasswordHere';
GO
```

**Step 2: Certificate**

```sql
USE master;
GO
-- Create a certificate for encryption
CREATE CERTIFICATE YourDatabaseCertificate
WITH SUBJECT = 'Database Encryption Certificate';
GO
```

**Step 3: Database Encryption Key (DEK)**

```sql
USE YourDatabase;
GO
-- Create a database encryption key
CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE YourDatabaseCertificate;
GO
```

**Step 4: Enable TDE**

```sql
-- Enable encryption for the database
ALTER DATABASE YourDatabase
SET ENCRYPTION ON;
GO
```

**Verify:**

```sql
-- Check encryption state
SELECT name, is_encrypted
FROM sys.databases;
GO
```

### 3. Always Encrypted

**Step 1: Column Master Key (CMK)** — stored externally (cert store, Azure Key Vault):

```sql
-- Create Column Master Key
CREATE COLUMN MASTER KEY MyColumnMasterKey
WITH (
KEY_STORE_PROVIDER_NAME = 'MSSQL_CERTIFICATE_STORE',
KEY_PATH = 'CurrentUser/My/CertificateThumbprint'
);
GO
```

**Step 2: Column Encryption Key (CEK)**

```sql
-- Create Column Encryption Key
CREATE COLUMN ENCRYPTION KEY MyColumnEncryptionKey
WITH VALUES (
COLUMN_MASTER_KEY = MyColumnMasterKey,
ALGORITHM = 'RSA_OAEP',
ENCRYPTED_VALUE = 0xC3... -- Encrypted value generated
);
GO
```

**Step 3: Encrypted column**

```sql
-- Create table with Always Encrypted column
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
SSN NVARCHAR(11) COLLATE Latin1_General_BIN2 ENCRYPTED WITH (
COLUMN_ENCRYPTION_KEY = MyColumnEncryptionKey,
ENCRYPTION_TYPE = Randomized
)
);
GO
```

**Step 4:** Set `Column Encryption Setting=Enabled` in the client connection string.

### 4. Column-Level Encryption (Symmetric Key)

```sql
USE YourDatabase;
GO
-- Create a symmetric key
CREATE SYMMETRIC KEY YourSymmetricKey
WITH ALGORITHM = AES_256
ENCRYPTION BY PASSWORD = 'YourStrongPasswordHere';
GO
```

```sql
-- Open the symmetric key
```

OPEN SYMMETRIC KEY YourSymmetricKey

DECRYPTION BY PASSWORD = 'YourStrongPasswordHere';

```sql
GO
```

```sql
-- Insert encrypted data
INSERT INTO Employees (EmployeeID, EncryptedData)
VALUES (1, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKey'), 'SensitiveDataHere'));
GO
```

```sql
-- Query and decrypt data
SELECT EmployeeID,
CAST(DECRYPTBYKEY(EncryptedData) AS NVARCHAR(50)) AS DecryptedData
FROM Employees;
GO
```

```sql
-- Close the symmetric key
CLOSE SYMMETRIC KEY YourSymmetricKey;
GO
```

### 5. Encryption for Data in Transit (SSL/TLS)

1. Install a valid SSL certificate on the SQL Server machine.
2. SQL Server Configuration Manager → Protocols → set **Force Encryption = Yes**.
3. Client connection string: `Encrypt=True;TrustServerCertificate=False`.

Data Source=YourServer;Initial Catalog=YourDatabase;Integrated Security=True;Encrypt=True;TrustServerCertificate=False;

## What are SQL Server security best practices?

### 1. Authentication and Authorization

**Windows Authentication preferred** — integrates with AD, Kerberos, centralized management. Check mode:

```sql
-- Check authentication mode (1 = Windows only, 2 = Mixed)
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly');
```

**Least privilege:**

```sql
-- Grant minimum permission example (SELECT only on a specific table)
GRANT SELECT ON dbo.YourTable TO YourUser;
```

**Disable/rename sa:**

```sql
-- Disable the sa account
ALTER LOGIN sa DISABLE;
```

**RBAC:**

```sql
-- Create a custom role and assign users
CREATE ROLE DataAnalyst;
GRANT SELECT ON dbo.YourTable TO DataAnalyst;
ALTER ROLE DataAnalyst ADD MEMBER YourUser;
```

### 2. Network Security

- **Firewalls** — restrict to trusted IPs; block unnecessary ports.

# Example: Configure firewall rules to allow SQL Server port (default is 1433)

netsh advfirewall firewall add rule name="Allow SQL Server" protocol=TCP dir=in localport=1433 action=allow

- **Encrypt in transit:**

# Example connection string with encryption

Data Source=YourServer;Initial Catalog=YourDatabase;Integrated Security=True;Encrypt=True;TrustServerCertificate=False;

- **Disable SQL Server Browser** if not needed:

# Example: Disable SQL Server Browser service

net stop "SQL Server Browser"

sc config "SQL Server Browser" start= disabled

### 3. Data Encryption

**TDE:**

```sql
-- Enable TDE
CREATE DATABASE ENCRYPTION KEY WITH ALGORITHM = AES_256 ENCRYPTION BY SERVER CERTIFICATE YourCertificate;
ALTER DATABASE YourDatabase SET ENCRYPTION ON;
```

**Always Encrypted for sensitive columns:**

```sql
-- Create an encrypted column
CREATE TABLE Customers (
CustomerID INT PRIMARY KEY,
SSN NVARCHAR(11) COLLATE Latin1_General_BIN2 ENCRYPTED WITH (
COLUMN_ENCRYPTION_KEY = YourEncryptionKey,
ENCRYPTION_TYPE = Randomized
)
);
```

### 4. Auditing and Monitoring

```sql
-- Create a server audit to track failed logins
CREATE SERVER AUDIT LoginFailuresAudit TO FILE (FILEPATH = 'C:\AuditLogs\);
CREATE SERVER AUDIT SPECIFICATION FailedLoginSpec FOR SERVER AUDIT LoginFailuresAudit ADD (FAILED_LOGIN_GROUP);
ALTER SERVER AUDIT LoginFailuresAudit WITH (STATE = ON);
```

**C2 auditing:**

```sql
-- Enable C2 auditing
EXEC sp_configure 'c2 audit mode', 1;
RECONFIGURE;
```

Review SQL Server Error Log, Agent logs, and Windows Event Logs regularly.

### 5. Security Configurations

- Apply security patches promptly.
- **Force encryption:**

```sql
-- Enable Force Encryption
EXEC sp_configure 'force encryption', 1;
RECONFIGURE;
```

- **Disable unused features** (e.g., `xp_cmdshell`):

```sql
-- Disable xp_cmdshell
EXEC sp_configure 'xp_cmdshell', 0;
RECONFIGURE;
```

### 6. Strong Password Policies

```sql
-- Create login with password policy enabled
CREATE LOGIN YourLogin WITH PASSWORD = 'YourStrongPassword' MUST_CHANGE, CHECK_POLICY = ON;
```

Enable account lockout after failed attempts.

### 7. Backup Security

```sql
-- Backup with encryption
BACKUP DATABASE YourDatabase TO DISK = 'C:\Backups\YourDatabase.bak'
WITH ENCRYPTION (ALGORITHM = AES_256, SERVER CERTIFICATE = YourBackupCertificate);
```

Store backups securely with restricted access.

### 8. Additional Practices

- Restrict physical server access.
- Use least-privileged dedicated service accounts.
- Network-segment sensitive instances.
- Run vulnerability assessments:

```sql
-- Run SQL Vulnerability Assessment (in SSMS)
EXEC sp_execute_external_script @script = 'SELECT * FROM SqlAssessment();
```

**Summary:** Windows auth + least privilege + RBAC; firewalls and SSL/TLS; TDE and Always Encrypted; auditing; patching; strong passwords; encrypted backups; physical security and vulnerability scans.

## How do you configure SQL Server for secure remote access?

### 1. Enable Remote Connections

**Enable TCP/IP:** SQL Server Configuration Manager → Network Configuration → Protocols → enable **TCP/IP** → restart instance.

**Configure port:** TCP/IP Properties → IP Addresses → **IPAll** → set **TCP Port** (e.g., 1434) → restart.

### 2. Firewall

Create inbound TCP rule for the SQL Server port. Optionally restrict **Remote IP Address** to trusted sources in rule Scope.

### 3. Authentication

Enable **Mixed Mode** if SQL logins needed (Server Properties → Security). Create strong logins:

```sql
-- Create a login with a strong password
CREATE LOGIN RemoteUser WITH PASSWORD = 'StrongPassword123!';
```

```sql
-- Grant access to a database
USE YourDatabase;
CREATE USER RemoteUser FOR LOGIN RemoteUser;
ALTER ROLE db_datareader ADD MEMBER RemoteUser;
```

### 4. SSL/TLS Encryption

1. Install CA-trusted certificate on server.
2. Configuration Manager → TCP/IP → **Force Encryption = Yes** → restart.
3. Client connection string:

```sql
To enforce SSL/TLS encryption for client connections, update the connection string to include Encrypt=True and TrustServerCertificate=False.
Data Source=YourServer,1434;Initial Catalog=YourDatabase;User ID=RemoteUser;Password=YourPassword;Encrypt=True;TrustServerCertificate=False;
```

### 5. Additional Security

- **Disable SQL Server Browser** if not needed.
- **Strong password policies:**

```sql
-- Create a login with password policy enabled
CREATE LOGIN SecureRemoteUser WITH PASSWORD = 'YourStrongPassword123!', CHECK_POLICY = ON;
```

- **Least privilege:**

```sql
-- Grant minimum permissions
GRANT SELECT ON dbo.YourTable TO RemoteUser;
```

- **Audit remote access:**

```sql
-- Create an audit to log all remote login attempts
CREATE SERVER AUDIT RemoteAccessAudit TO FILE (FILEPATH = 'C:\AuditLogs\);
CREATE SERVER AUDIT SPECIFICATION RemoteLoginSpec FOR SERVER AUDIT RemoteAccessAudit ADD (SUCCESSFUL_LOGIN_GROUP, FAILED_LOGIN_GROUP);
ALTER SERVER AUDIT RemoteAccessAudit WITH (STATE = ON);
```

- IP filtering at network/firewall layer.
- Regular patching and log monitoring.

### 6. Testing

Connect via SSMS with `ServerName,Port` (e.g., `YourServerIPAddress,1434`); verify encrypted connection works.

## What is SQL Server Audit and how do you use it for security monitoring?

**SQL Server Audit** logs server- and database-level activities (logins, schema changes, permission changes) for compliance (SOX, HIPAA, GDPR) and security monitoring.

### Key Concepts

1. **Audit** — defines log destination (file, application log, security log).
2. **Server Audit Specification** — server-level events (logins, config changes).
3. **Database Audit Specification** — database-level events (DDL, DML, permissions).
4. **Action Groups** — predefined event collections (e.g., `FAILED_LOGIN_GROUP`, `DATABASE_OBJECT_CHANGE_GROUP`).

### Setup

**Step 1: Create audit**

```sql
-- Create an audit that logs to a file
CREATE SERVER AUDIT [Audit_DatabaseActions]
TO FILE (FILEPATH = 'C:\AuditLogs\\, MAXSIZE = 10 MB, MAX_ROLLOVER_FILES = 5);
GO
-- Enable the audit
ALTER SERVER AUDIT [Audit_DatabaseActions] WITH (STATE = ON);
```

**Step 2: Server audit specification**

```sql
-- Create a server audit specification for tracking login attempts
CREATE SERVER AUDIT SPECIFICATION [Audit_LoginAttempts]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (FAILED_LOGIN_GROUP), -- Logs failed logins
ADD (SUCCESSFUL_LOGIN_GROUP); -- Logs successful logins
GO
-- Enable the server audit specification
ALTER SERVER AUDIT SPECIFICATION [Audit_LoginAttempts] WITH (STATE = ON);
```

**Step 3: Database audit specification**

```sql
-- Use the appropriate database
USE YourDatabase;
GO
-- Create a database audit specification for tracking changes to database objects
CREATE DATABASE AUDIT SPECIFICATION [Audit_ObjectChanges]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (DATABASE_OBJECT_CHANGE_GROUP); -- Logs changes to database objects like tables, views, etc.
GO
-- Enable the database audit specification
ALTER DATABASE AUDIT SPECIFICATION [Audit_ObjectChanges] WITH (STATE = ON);
```

**Step 4: View logs**

```sql
-- Query audit logs from the audit files
SELECT *
FROM sys.fn_get_audit_file('C:\AuditLogs\.sqlaudit', DEFAULT, DEFAULT);
```

In SSMS: Security → Audits → right-click → **View Audit Logs**.

### Common Scenarios

**Failed logins:**

```sql
-- Example: Auditing failed login attempts
CREATE SERVER AUDIT SPECIFICATION [LoginFailuresAudit]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (FAILED_LOGIN_GROUP);
ALTER SERVER AUDIT SPECIFICATION [LoginFailuresAudit] WITH (STATE = ON);
```

**Sensitive data access:**

```sql
-- Example: Auditing select statements on sensitive table
CREATE DATABASE AUDIT SPECIFICATION [Audit_SelectSensitiveTable]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (SELECT ON dbo.SensitiveTable BY PUBLIC);
ALTER DATABASE AUDIT SPECIFICATION [Audit_SelectSensitiveTable] WITH (STATE = ON);
```

**Schema changes:**

```sql
-- Example: Auditing changes to database schema
CREATE DATABASE AUDIT SPECIFICATION [Audit_SchemaChanges]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (DATABASE_OBJECT_CHANGE_GROUP);
ALTER DATABASE AUDIT SPECIFICATION [Audit_SchemaChanges] WITH (STATE = ON);
```

**Permission changes:**

```sql
-- Example: Auditing role changes in the database
CREATE DATABASE AUDIT SPECIFICATION [Audit_PermissionChanges]
FOR SERVER AUDIT [Audit_DatabaseActions]
ADD (SCHEMA_OBJECT_PERMISSION_CHANGE_GROUP);
ALTER DATABASE AUDIT SPECIFICATION [Audit_PermissionChanges] WITH (STATE = ON);
```

### Best Practices

1. Centralize audit logs across instances.
2. Configure max size and retention policies.
3. Audit critical events: logins, schema/permission changes.
4. Review logs on a regular schedule.
5. Protect audit files from tampering.
