# SQL Server SQL Server Agent and Jobs

## Questions Covered

1. What is SQL Server Agent, and how do you use it to schedule jobs?
2. How do you monitor SQL Server jobs and handle job failures?
3. How would you configure alerts and notifications for job monitoring?

## What is SQL Server Agent, and how do you use it to schedule jobs?

SQL Server Agent is the background service that automates DBA tasks—scheduled runs of T-SQL scripts, backups, SSIS packages, PowerShell scripts, and notification handling.

### Core components (what you configure)

| Object | What it does |
|---|---|
| **Jobs** | A set of **steps** (the actual work). Each job can contain multiple steps. |
| **Steps** | Units of work (T-SQL / PowerShell / SSIS, etc.). |
| **Schedules** | When the job runs (one-time or recurring). |
| **Alerts** | Trigger notifications/actions based on errors or performance conditions. |
| **Operators** | Recipients for alerts (email/pager/net send style delivery). |
| **Proxies** | Lets job steps run under different security contexts. |

### Schedule a job (SSMS flow)

1. Open **SQL Server Management Studio (SSMS)** and expand **SQL Server Agent**.
2. If needed, start **SQL Server Agent**.
3. Right-click **Jobs** → **New Job** → set **General** (name, owner).
4. **Steps** tab → **New** step:
   - Pick **Type** (T-SQL / PowerShell / SSIS).
   - Write the **Command** (and configure step success/failure actions).

```sql
BACKUP DATABASE [YourDatabase] TO DISK = 'C:\Backups\YourDatabase.bak';
```

5. **Schedules** tab → **New** schedule (One time / Recurring, start time, frequency).
6. **Notifications** tab (optional) → notify an **Operator** for success/failure/completion; e.g., email via Database Mail.
7. Save with **OK**; job appears under **SQL Server Agent > Jobs**.
8. Test it with **Start Job at Step** and watch status in **Job Activity Monitor**.

### Example: scheduling a database backup job (nightly)

1. Create job: **Nightly Backup**
2. Add a backup step (run nightly at 2 AM)

```sql
BACKUP DATABASE [YourDatabase] TO DISK = 'C:\Backups\YourDatabase.bak';
```

3. Create schedule: **Recurring** → **Daily at 2 AM**
4. Optional: email an operator if the backup fails
5. Run now (or wait for the schedule)

### Best practices

- Use clear job names/descriptions so the intent is obvious.
- Test manually before scheduling repeatedly.
- Use least privilege; use **proxies** when a different security context is required.
- Enable notifications for critical jobs (backups, imports, maintenance).
- Review job history regularly and keep failure remediation tight.

## How do you monitor SQL Server jobs and handle job failures?

Monitoring is about answering two questions quickly: **(1) what’s running/failed now?** and **(2) what exactly failed, and why?**

### What to use

- **Job Activity Monitor**: real-time status (Running/Succeeded/Failed/etc.).
- **Job History**: detailed per-step execution info (timestamps and error messages).

### Notifications (operator alerting)

In job properties, configure **Notifications** to notify an Operator when the job completes/succeeds/fails (email requires Database Mail).

```sql
EXEC msdb.dbo.sp_notify_operator
@name=N'DBA_Operator',
@subject=N'Job Failed: Nightly Backup',
@message=N'The nightly backup job has failed. Please investigate.';
```

### Job step logging (debugging)

On the job step **Properties/Steps**, configure advanced logging so the step output is captured (file or table), making failures easier to diagnose.

### Handling failures (operational response)

- **Retry logic**: for transient issues, configure **Retry Attempts** and **Retry Interval** on the failing step.
- **TRY...CATCH in T-SQL steps**: handle errors and log them from within the step.

```sql
BEGIN TRY
-- Attempt a backup
BACKUP DATABASE [YourDatabase] TO DISK = 'C:\Backups\YourDatabase.bak';
END TRY
BEGIN CATCH
-- Handle error and log failure
DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
RAISERROR('Backup failed: %s', 16, 1, @ErrorMessage);
END CATCH
```

- **Alerts/escalation**: configure SQL Server Agent **Alerts** to respond to specific errors/performance conditions.

```sql
USE msdb;
GO
EXEC sp_add_alert
@name = N'Database Full Alert',
@message_id = 1105, -- Error for insufficient space in database file
@severity = 17;
GO
```

- **Step failure actions**: set what happens after each step (retry, move to next, or stop the job).
- **Windows Event Logs**: when failures aren’t purely SQL-side (disk, service, networking), check **Event Viewer** (Application/System).

### Automating error handling + notifications

- **Enable Database Mail** (for email-based job failure alerts):

```sql
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'Database Mail XPs', 1;
RECONFIGURE;
```

- **Custom error logging table** (for richer error capture; log from the CATCH block):

```sql
CREATE TABLE JobErrorLog (
JobName NVARCHAR(100),
ErrorTime DATETIME,
ErrorMessage NVARCHAR(MAX)
);
INSERT INTO JobErrorLog (JobName, ErrorTime, ErrorMessage)
VALUES ('Nightly Backup', GETDATE(), 'Backup failed due to insufficient disk space');
```

### Best practices (quick checklist)

1. Use notifications for business-critical jobs (backups, index maintenance, data loads).
2. Review job history regularly for failure patterns.
3. Monitor long-running jobs (timeouts/perf issues).
4. Retry transient errors instead of spamming failures.
5. Use TRY...CATCH to handle and record errors consistently.

## How would you configure alerts and notifications for job monitoring?

To configure alerting properly, you need **Database Mail + Operators + Alerts**, then wire those into the right **job notification settings**.

### 1) Configure Database Mail (prerequisite for email)

In SSMS: **Management → Database Mail → Configure Database Mail** and create a **Mail Profile**. Test by sending a mail.

```sql
EXEC msdb.dbo.sp_send_dbmail
@profile_name = 'YourMailProfile',
@recipients = 'your_email@domain.com',
@subject = 'Test Email',
@body = 'This is a test email from SQL Server Database Mail.';
```

### 2) Configure Operators

Create an Operator (SSMS: **SQL Server Agent → Operators → New Operator**) and set the email address (and other delivery methods if applicable).

### 3) Configure Alerts

Alerts are driven by **SQL Server Event Alerts** (error/severity) or **Performance Condition Alerts**.

Example: alert on job-disk related event **823**:

```sql
USE msdb;
GO
EXEC sp_add_alert
@name = N'Job Failure Alert',
@message_id = 823,
@severity = 16,
@notification_message = N'Disk I/O error on database server',
@enabled = 1;
GO
```

Set the response to **Notify operators** (and optionally execute a job).

### 4) Configure per-job notifications

For each job: **Job Properties → Notifications**:

- Choose the operator
- Choose notify level (fail/succeed/complete)

```sql
EXEC msdb.dbo.sp_update_job
@job_name = N'Nightly Backup',
@notify_level_email = 2, -- 2 = notify on failure
@notify_email_operator_name = N'DBA_Operator';
```

### Monitoring + response loop

- Check **Job Activity Monitor** for current runs.
- Use **View History** to drill into failures.
- For transient errors, configure **retries**; for recovery automation, trigger a separate recovery job from critical alerts.

### Worked example: job failure email + critical error alert

1. Create operator:

```sql
EXEC msdb.dbo.sp_add_operator
@name = N'DBA_Operator',
@enabled = 1,
@email_address = N'dba@company.com';
```

2. Configure the backup job to notify on failure:

```sql
EXEC msdb.dbo.sp_update_job
@job_name = N'Nightly Backup',
@notify_level_email = 2, -- 2 = notify on failure
@notify_email_operator_name = N'DBA_Operator';
```

3. Create an alert for critical disk I/O errors (823):

```sql
EXEC msdb.dbo.sp_add_alert
@name = N'Disk I/O Alert',
@message_id = 823,
@severity = 17,
@notification_message = N'Disk error detected',
@enabled = 1;
```

4. Set alert response to notify the **DBA Operator**.

### Summary

Configure **Database Mail** first, then create **Operators** and **Alerts**, and finally connect them to jobs via the job **Notifications** settings so you get timely, actionable failure alerts.
