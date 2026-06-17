# OWASP

**Cross-Site Scripting (XSS)** — attackers inject malicious scripts into pages other users view, enabling unauthorized actions, data theft, or account compromise.

### How XSS Works

Untrusted data sent to the browser without validation/escaping executes in the user's context:

- **Stealing session cookies**
- **Defacing webpages**
- **Redirecting users to malicious sites**
- **Capturing user input** (passwords, credit cards)

### Types of XSS

1. **Stored XSS** — malicious script persisted on the server (DB, message board); executes whenever the infected page is viewed.

### Example

- A user posts a comment on a blog with the following content:

```html
<script>alert('Your session has been hacked!');</script>
```

- If the blog application does not properly sanitize the input, this script will be stored in the database and executed every time someone views the comment, leading to a popup alert.

2. **Reflected XSS** — script reflected from the server (typically via URL); delivered through phishing links.

### Example

- An attacker sends a user a link like:

```html
http://example.com/search?q=<script>alert('You have been hacked!');</script>
```

- If the web application reflects the q parameter directly back onto the page without escaping it, the script will execute, showing the alert message in the user's browser.

3. **DOM-Based XSS** — vulnerability in client-side code; script injected by manipulating the DOM.

### Example

- Consider a web application that takes a URL fragment and writes it directly into the page without sanitizing:

```javascript
document.write(location.hash);
```

- If a user visits http://example.com/#<script>alert('Hacked!');</script>, the script in the URL fragment will be executed when the page loads.

### Mitigation Techniques

| Technique | Action |
|-----------|--------|
| **Input Validation** | Reject input that doesn't match expected format |
| **Output Encoding** | HTML-encode `<`, `>`, `&` before rendering |
| **Content Security Policy (CSP)** | Restrict loadable/executable content types |
| **Sanitize Inputs** | Use framework sanitization libraries |
| **Avoid Dangerous APIs** | Avoid `document.write`, `innerHTML`, `eval` unless necessary |

### Example of Secure Code

Suppose you have a search function on a webpage. Instead of directly embedding user input into the HTML like this:

```html
<div>Search Results for: <span id="search-term"><script>document.write(queryString)</script></span></div>
```

You should encode the input to prevent XSS attacks:

```html
<div>Search Results for: <span id="search-term"></span></div>
<script>
var searchTerm = encodeURIComponent(queryString);
document.getElementById('search-term').textContent = searchTerm;
</script>
```

Using `textContent` or proper encoding prevents script injection.

**SQL Injection** — attackers manipulate application SQL queries via malicious input, gaining unauthorized data access, DB manipulation, or admin operations.

### How SQL Injection Works

User input incorporated directly into SQL without sanitization lets attackers inject additional SQL commands.

### Example Scenario

Login form query:

```sql
SELECT * FROM users WHERE username = 'user_input' AND password = 'password_input';
```

#### Vulnerable Code Example

Suppose the code that builds the SQL query looks like this:

```csharp
string query = "SELECT * FROM users WHERE username = '" + userInput + "' AND password = '" + passwordInput + "';";
If the attacker enters the following as the username:
sql
Copy code
```

' OR '1'='1

And leaves the password field blank, the resulting SQL query would be:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '';
```

`'1'='1'` is always true — bypasses password check; attacker may log in as the first DB user.

### Types of SQL Injection

1. **Classic SQL Injection** — direct code insertion into input fields (example above).

2. **Blind SQL Injection** — no visible errors/data; attacker infers vulnerability from application behavior.

    - Example: The attacker might input something like:

If the query executes successfully, they know the application is vulnerable. They can then refine the input to extract specific information.

```sql
' AND 1=1 --
```

3. **Union-based SQL Injection** — `UNION` combines multiple `SELECT` results.

    - Example:

This could trick the application into returning additional data, such as usernames and passwords, alongside the expected results.

```sql
' UNION SELECT username, password FROM users --
```

4. **Error-based SQL Injection** — crafted input triggers errors revealing DB structure.

    - Example:

If the application reveals an error message, the attacker may gain insights into the database schema or other internal details.

```sql
' OR 1=1; DROP TABLE users; --
```

### Real-World Example

**Heartland Payment Systems (2008)** — SQL injection exposed 100+ million credit card accounts, demonstrating severe organizational impact.

### Mitigation Techniques

| Technique | Details |
|-----------|---------|
| **Prepared Statements** | Placeholders; input treated as data, not code |
| **Stored Procedures** | Separate code from data in the DB |
| **Input Validation** | Restrict to expected characters (e.g., alphanumeric usernames) |
| **ORM Frameworks** | Entity Framework, Hibernate abstract raw SQL |
| **Least Privilege** | DB account has minimum required permissions |

- Example in C#:

```csharp
string query = "SELECT * FROM users WHERE username = @username AND password = @password";
using (SqlCommand cmd = new SqlCommand(query, connection))
{
cmd.Parameters.AddWithValue("@username", userInput);
cmd.Parameters.AddWithValue("@password", passwordInput);
// Execute query...
}
```

- Example stored procedure:

```sql
CREATE PROCEDURE GetUserByUsernameAndPassword
@username NVARCHAR(50),
@password NVARCHAR(50)
AS
BEGIN
SELECT * FROM users WHERE username = @username AND password = @password;
END
```

**Cross-Site Request Forgery (CSRF)** — attacker tricks an authenticated user into performing unintended actions by exploiting the browser's session trust.

### How CSRF Works

Logged-in users have session cookies. Attacker crafts a request; the browser sends it with the cookie — server treats it as legitimate.

### Example Scenario

Bank transfer form:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="submit" value="Transfer">
</form>
```

#### Attack Scenario

1. **User Authentication** — session cookie set after login.
2. **Crafting the Malicious Request** — attacker page contains:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="attacker_account">
<input type="hidden" name="amount" value="1000">
</form>
<script>
document.forms[0].submit();
</script>
```

3. **Tricking the User** — phishing email or iframe visit.
4. **Unintentional Action** — auto-submitted POST with victim's session cookie.
5. **Server Response** — valid cookie → $1000 transferred to attacker.

### CSRF Mitigation Techniques

1. **CSRF Tokens** — unique per-request token validated server-side; attacker can't guess it.

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="hidden" name="csrf_token" value="randomly_generated_token">
<input type="submit" value="Transfer">
</form>
```

- Server verifies `csrf_token` matches session; rejects mismatches.

2. **SameSite Cookies** — prevent cross-site cookie transmission:

```http
Set-Cookie: session_id=abcd1234; SameSite=Strict;
```

- `SameSite=Strict` blocks cookies on cross-domain requests.

3. **Double Submit Cookies** — token in both cookie and request parameter; server verifies match:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="hidden" name="csrf_token" value="randomly_generated_token_from_cookie">
<input type="submit" value="Transfer">
</form>
```

4. **Requiring Re-authentication** — password/MFA for sensitive actions.
5. **User Interaction Verification** — require explicit button clicks, not silent POSTs.

### Real-World Example

**MySpace (2005)** — CSRF worm added 1M+ friends and displayed profile messages, spreading rapidly across the platform.

**File Upload Vulnerability** — improper file upload handling lets attackers upload malicious files → RCE, unauthorized access, data breaches.

### How File Upload Vulnerability Works

Without validation/sanitization/restriction, attackers upload scripts or executables the server may execute.

### Example Scenario

Profile picture upload without proper checks.

#### Vulnerable Code Example

Here's an example of how a vulnerable file upload process might work in a PHP-based application:

php

```text
Copy code
if (isset($_FILES['profile_picture'])) {
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["profile_picture"]["name"]);
move_uploaded_file($_FILES["profile_picture"]["tmp_name"], $target_file);
}
```

- File saved to `uploads/` with **no type, extension, or content checks** — attacker uploads `shell.php`.

### Attack Scenario

1. **Upload the Malicious File** — `shell.php`:

```php
<?php system($_GET['cmd']); ?>
```

2. **Access the Uploaded File** — `http://example.com/uploads/shell.php`
3. **Execute Commands** — `?cmd=ls` lists files; `rm -rf /` attempts deletion.
4. **Compromise the Server** — full control via web shell.

### Mitigation Techniques

| Technique | Purpose |
|-----------|---------|
| **File Type Validation** | Check MIME type (not extension alone) |
| **File Name Sanitization** | Prevent directory traversal |
| **Restrict File Permissions** | Non-executable uploads (`chmod 0644`) |
| **Store Outside Web Root** | No direct URL access |
| **CSP** | Block untrusted script execution |
| **Rename Files** | Unique names without original extension |
| **Virus/Malware Scanning** | Scan before storage |
| **Limit File Size** | Prevent upload-based DoS |

```php
$allowed_types = ['image/jpeg', 'image/png'];
if (!in_array(mime_content_type($_FILES['profile_picture']['tmp_name']), $allowed_types)) {
die("Invalid file type.");
}
```

```php
$filename = basename($_FILES['profile_picture']['name']);
$target_file = $target_dir . preg_replace("/[^a-zA-Z0-9.]/", "", $filename);
```

```bash
chmod 0644 uploads/*
```

```php
$target_dir = "/var/www/uploads/"; // Outside the public_html directory
```

```php
$new_name = uniqid() . '.jpg';
```

### Real-World Example

**WordPress (2019)** — plugin file upload flaw allowed executable files disguised as images → web shells on compromised sites.

**Brute Force Attack** — systematically trying password/key combinations until access is gained. Effective against weak credentials and poor security.

### How Brute Force Attacks Work

Automated scripts/tools try character/number/word combinations until the correct credential is found.

### Mitigation Techniques

| Defense | Example |
|---------|---------|
| **Strong Password Policies** | `G!xP9@2Z` vs `password123` |
| **Account Lockout** | Lock 15 min after 5 failed attempts |
| **Rate Limiting** | 5 attempts/min per IP |
| **Two-Factor Authentication (2FA)** | SMS/authenticator code required |
| **CAPTCHAs** | Block automated scripts post-failure |
| **Password Hashing** | Salted hashes (not plaintext or weak MD5) |

### Real-World Example

**Adobe (2013)** — breach exposed poorly encrypted passwords; brute force cracked weak encryption, enabling credential reuse attacks elsewhere.

**Denial of Service (DoS)** and **Distributed Denial of Service (DDoS)** — flood a service with illegitimate traffic to make it unavailable.

### Key Differences Between DoS and DDoS

| | **DoS** | **DDoS** |
|---|---------|----------|
| **Sources** | Single/few machines | Thousands-millions (botnet) |
| **Traceability** | Easier to trace | Hard — distributed globally |
| **Mitigation** | Simpler filtering | Requires scale (CDN, scrubbing) |

### How DoS/DDoS Attacks Work

Overwhelm target bandwidth, CPU, or memory until legitimate users can't connect.

### Real-World Example

**Dyn DNS (Oct 2016)** — **Mirai botnet** (compromised IoT devices) disrupted Twitter, Netflix, Reddit, CNN — highlighted IoT vulnerability scale.

### Mitigation Techniques

1. **Traffic Filtering** — firewalls, IDS/IPS block malicious IPs/regions.
2. **Rate Limiting** — e.g., 10 requests/sec per IP.
3. **Load Balancing** — CDN distributes traffic across servers.

**Ransomware** — malware encrypts victim data; attacker demands cryptocurrency ransom for a decryption key. Targets individuals, businesses, and organizations.

### How Ransomware Works

| Stage | Description |
|-------|-------------|
| **Infection Vector** | Phishing, malicious attachments, compromised sites, vulnerabilities |
| **Encryption** | Files (docs, images, DBs) rendered inaccessible |
| **Ransom Demand** | On-screen note with Bitcoin payment instructions |
| **Payment and Decryption** | Key may or may not work after payment |
| **Consequences** | Payment encourages further attacks; no guarantee of recovery |

### Example Scenario

#### Scenario: WannaCry Ransomware Attack

**WannaCry (May 2017)** — infected 100K+ computers in 150+ countries within days.

1. **Initial Infection** — exploited **EternalBlue** Windows vulnerability (NSA-discovered, Shadow Brokers leak); spread without user interaction.
2. **Encryption Process** — encrypted `.docx`, `.jpg`, `.xls` → `.WNCRY` extension.
3. **Ransom Note** — $300–$600 Bitcoin demand with countdown timer.
4. **Spread and Impact** — NHS cancelled appointments; FedEx, Telefónica affected; billions in global damage.
5. **Resolution** — researcher registered kill-switch domain, halting spread; many victims left with encrypted files.

**Phishing attacks** — social engineering to steal credentials, card details, or personal data via email, SMS, phone, or social media.

Goal: trick victims into believing they interact with a legitimate entity (bank, social platform, company).

### Example Scenario

#### Scenario: Phishing Email Pretending to be from a Bank

1. **The Phishing Email** — branded email from `support@yourbank.com`; subject: "URGENT: Verify Your Account Information to Avoid Suspension."
2. **The Message Content** — claims unusual activity; account suspended; click link within 24 hours or permanent suspension.
3. **The Fake Website** — `www.yourbank-secure.com` mimics real login page.
4. **The Theft** — credentials captured and sent to attacker → fund transfers, settings changes.
5. **The Aftermath** — victim discovers fraud via unauthorized transactions or locked-out account.

### Real-World Example

**Gmail (2016)** — phishing emails from trusted contacts with fake Google Docs link → convincing fake login page harvested credentials. Google disabled malicious accounts and added security measures.
