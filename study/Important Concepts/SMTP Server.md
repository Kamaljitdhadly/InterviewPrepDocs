# SMTP Server

**Scenario:** Kamaljit Singh (`momentum.com`) sends email to Raj (`raj@example.com`) via Outlook.

### Email Flow

1. **Send** — Kamaljit composes email in Outlook → `raj@example.com`.
2. **Connect** — Outlook connects to **Microsoft 365 SMTP** (`smtp.office365.com`, port **587** — submission).
3. **Authenticate** — Outlook authenticates with Kamaljit's **Microsoft 365 credentials**.
4. **Transmit** — Outlook sends email headers + content to SMTP server.
5. **MX Lookup** — Microsoft 365 server queries **MX records** for `example.com`.
6. **Relay** — Connects to SMTP server specified in `example.com` MX records.
7. **Deliver** — Email transferred to `example.com` SMTP server → placed in Raj's inbox.
8. **Retrieve** — Raj fetches email via **IMAP** or **POP3**.

### Security and Protocols

| Aspect | Detail |
|--------|--------|
| **Encryption** | **TLS** secures SMTP connections in transit |
| **Authentication** | Required to prevent unauthorized sending |

**Summary:** SMTP handles client-to-server sending and **server-to-server relay**. Microsoft 365 flow: connect → authenticate → MX lookup → route to recipient's mail server for delivery.
