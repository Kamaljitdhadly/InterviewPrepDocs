Let's assume Kamaljit Singh at momentum.com wants to send an email to a colleague, Raj at example.com.

1.  **Kamaljit sends an email** from Outlook to raj@example.com.

2.  **Outlook connects** to the Microsoft 365 SMTP server at smtp.office365.com using SMTP on port 587 (commonly used for submission).

3.  **SMTP Authentication:**

    - Kamaljit's Outlook client authenticates using his Microsoft 365 credentials.

4.  **Email Transmission:**

    - Outlook sends the email details to the SMTP server, including headers and content.

5.  **Domain Lookup:**

    - The Microsoft 365 SMTP server looks up the MX records for example.com.

6.  **Connecting to Raj's SMTP Server:**

    - The server connects to the SMTP server specified in example.com's MX records.

7.  **Delivering the Email:**

    - The email is transferred from the Microsoft 365 SMTP server to example.com's SMTP server.

    - Raj's SMTP server accepts the email and places it in Raj's inbox.

8.  **Raj retrieves the email** using an email client by connecting to his mail server via IMAP or POP3.

**Security and Protocols**

- **Encryption:** SMTP connections are often secured using TLS (Transport Layer Security) to encrypt data during transmission.

- **Authentication:** SMTP servers typically require authentication to prevent unauthorized users from sending emails.

**Conclusion**

SMTP is crucial for sending emails from a client to a server and transferring them between servers. Using Microsoft 365, the process involves connecting to an SMTP server, authenticating the user, and routing the email to the recipient's server for delivery. The system ensures that emails are securely transmitted and efficiently delivered to the intended recipients.
