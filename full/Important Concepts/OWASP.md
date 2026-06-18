# OWASP

**Cross-Site Scripting (XSS)** is a type of security vulnerability commonly found in web applications. It allows attackers to inject malicious scripts into webpages viewed by other users. This can lead to unauthorized actions, data theft, or the compromise of user accounts.

### How XSS Works

XSS occurs when an application takes untrusted data and sends it to a web browser without proper validation or escaping. The injected script is then executed in the context of the user's browser, which can lead to various types of attacks, such as:

- **Stealing session cookies**

- **Defacing webpages**

- **Redirecting users to malicious sites**

- **Capturing user input (like passwords or credit card numbers)**

### Types of XSS

1.  **Stored XSS:**

    - The malicious script is permanently stored on the target server, such as in a database or a message board post. When a user views the infected page, the script executes.

### Example

- A user posts a comment on a blog with the following content:

```html
<script>alert('Your session has been hacked!');</script>
```

- If the blog application does not properly sanitize the input, this script will be stored in the database and executed every time someone views the comment, leading to a popup alert.

2.  **Reflected XSS:**

    - The malicious script is reflected off a web server, typically via a URL. This type of XSS is often delivered through phishing emails or links that trick users into clicking.

### Example

- An attacker sends a user a link like:

```html
http://example.com/search?q=<script>alert('You have been hacked!');</script>
```

- If the web application reflects the q parameter directly back onto the page without escaping it, the script will execute, showing the alert message in the user's browser.

3.  **DOM-Based XSS:**

    - This type occurs when the vulnerability exists in the client-side code rather than on the server. The script is injected into the page by manipulating the Document Object Model (DOM).

### Example

- Consider a web application that takes a URL fragment and writes it directly into the page without sanitizing:

```javascript
document.write(location.hash);
```

- If a user visits http://example.com/#<script>alert('Hacked!');</script>, the script in the URL fragment will be executed when the page loads.

### Mitigation Techniques

1.  **Input Validation:**

    - Validate all user inputs to ensure they conform to the expected format, and reject any input that deviates from this format.

2.  **Output Encoding:**

    - Encode data before rendering it in the browser. For example, HTML encode special characters like <, >, and &.

3.  **Content Security Policy (CSP):**

    - Implement a Content Security Policy to restrict the types of content that can be loaded and executed by the browser.

4.  **Sanitize Inputs:**

    - Use libraries or frameworks that automatically sanitize inputs or provide functions to sanitize user inputs.

5.  **Avoid Dangerous API Functions:**

    - Avoid using functions like document.write, innerHTML, or eval unless necessary, as they can easily lead to XSS vulnerabilities if not handled correctly.

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

By using textContent or proper encoding, you prevent any script injection, making the application safer from XSS attacks.

**SQL Injection** is a type of security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. By injecting malicious SQL code into an input field, an attacker can gain unauthorized access to data, manipulate the database, or even execute administrative operations.

### How SQL Injection Works

SQL Injection occurs when an application accepts user input and incorporates it directly into a SQL query without properly sanitizing or validating the input. This allows the attacker to manipulate the query by injecting additional SQL commands, potentially compromising the database.

### Example Scenario

Imagine a web application with a login form that asks for a username and password. The application might use the following SQL query to check if the credentials match:

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

This query always returns true ('1'='1' is always true), effectively bypassing the password check and potentially logging the attacker in as the first user in the database.

### Types of SQL Injection

1.  **Classic SQL Injection:**

    - The example above demonstrates a classic SQL injection where the attacker manipulates the SQL query by directly inserting code into user input fields.

2.  **Blind SQL Injection:**

    - In some cases, the application doesn’t return visible errors or data, but the attacker can still infer information by observing how the application behaves.

    - Example: The attacker might input something like:

If the query executes successfully, they know the application is vulnerable. They can then refine the input to extract specific information.

```sql
' AND 1=1 --
```

3.  **Union-based SQL Injection:**

    - The attacker uses the UNION SQL operator to combine the results of multiple SELECT queries into a single result.

    - Example:

This could trick the application into returning additional data, such as usernames and passwords, alongside the expected results.

```sql
' UNION SELECT username, password FROM users --
```

4.  **Error-based SQL Injection:**

    - The attacker manipulates input to trigger an error, which may reveal useful information about the database structure or contents.

    - Example:

If the application reveals an error message, the attacker may gain insights into the database schema or other internal details.

```sql
' OR 1=1; DROP TABLE users; --
```

### Real-World Example

In 2008, a major data breach occurred at the retailer **Heartland Payment Systems**, where attackers used SQL injection to gain access to a massive amount of credit card data. The breach compromised over 100 million credit card accounts, demonstrating the severe impact SQL injection can have on organizations.

### Mitigation Techniques

1.  **Prepared Statements (Parameterized Queries):**

    - Use prepared statements, where the SQL query is defined with placeholders, and user input is supplied separately. This ensures that user input is treated strictly as data, not executable code.

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

2.  **Stored Procedures:**

    - Use stored procedures in the database, which also help separate code from data.

    - Example:

```sql
CREATE PROCEDURE GetUserByUsernameAndPassword
@username NVARCHAR(50),
@password NVARCHAR(50)
AS
BEGIN
SELECT * FROM users WHERE username = @username AND password = @password;
END
```

3.  **Input Validation and Sanitization:**

    - Validate and sanitize all user inputs. For example, restrict input to only expected characters (e.g., alphanumeric characters for usernames).

4.  **Use ORM (Object-Relational Mapping) Frameworks:**

    - ORMs like Entity Framework or Hibernate help abstract away raw SQL queries and reduce the likelihood of SQL injection vulnerabilities.

5.  **Least Privilege:**

    - Ensure that the database account used by the application has the least privilege necessary, limiting the potential damage if an injection does occur.

**Cross-Site Request Forgery (CSRF)** is a type of security vulnerability where an attacker tricks a user into performing an unintended action on a web application in which the user is authenticated. The attack exploits the trust that a web application has in the user's browser, rather than targeting vulnerabilities in the application itself.

### How CSRF Works

When a user is logged into a web application, their browser typically stores a session cookie that authenticates their identity to the server. CSRF occurs when an attacker crafts a malicious request and tricks the user's browser into sending this request to the target application. Since the request is sent with the user's session cookie, the server believes it is a legitimate request from the user.

### Example Scenario

Let's assume a banking web application that allows users to transfer money to another account using a simple form:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="submit" value="Transfer">
</form>
```

#### Attack Scenario

1.  **User Authentication:**

    - The user logs into their bank account, and the application sets a session cookie in their browser to track their authenticated session.

2.  **Crafting the Malicious Request:**

    - An attacker creates a malicious webpage that includes the following form:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="attacker_account">
<input type="hidden" name="amount" value="1000">
</form>
<script>
document.forms[0].submit();
</script>
```

3.  **Tricking the User:**

    - The attacker tricks the user into visiting the malicious webpage, perhaps by sending a phishing email or embedding the page in an iframe.

4.  **Unintentional Action:**

    - When the user visits the malicious webpage, the hidden form is automatically submitted by the script, sending a POST request to https://bank.com/transfer with the user's session cookie.

5.  **Server Response:**

    - The bank's server receives the request, sees the valid session cookie, and assumes the request is legitimate. It then transfers $1000 from the user's account to the attacker's account.

### CSRF Mitigation Techniques

1.  **CSRF Tokens:**

    - Include a unique, unpredictable token in each form or request that is validated on the server side. Since the attacker cannot know the token, they cannot create a valid request.

    - Example in a form:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="hidden" name="csrf_token" value="randomly_generated_token">
<input type="submit" value="Transfer">
</form>
```

- On the server side, the application checks that the csrf_token matches the one stored in the user's session. If it doesn’t match, the request is rejected.

2.  **SameSite Cookies:**

    - Set the SameSite attribute on cookies to prevent them from being sent with cross-site requests.

    - Example:

```http
Set-Cookie: session_id=abcd1234; SameSite=Strict;
```

- With SameSite=Strict, the browser will not send the session cookie with requests initiated from different domains, preventing CSRF attacks.

3.  **Double Submit Cookies:**

    - Send the CSRF token in both a cookie and a request parameter, and verify that both match on the server.

    - Example:

```html
<form action="https://bank.com/transfer" method="POST">
<input type="hidden" name="account" value="recipient_account">
<input type="hidden" name="amount" value="1000">
<input type="hidden" name="csrf_token" value="randomly_generated_token_from_cookie">
<input type="submit" value="Transfer">
</form>
```

- The server compares the CSRF token in the form with the one in the cookie. If they match, the request is considered valid.

4.  **Requiring Re-authentication:**

    - For sensitive actions (like transferring money), require the user to re-authenticate by entering their password or using multi-factor authentication (MFA) before completing the action.

5.  **User Interaction Verification:**

    - Ensure that certain actions require explicit user interaction, such as clicking a button, rather than being executable via a simple POST request.

### Real-World Example

One famous CSRF attack occurred on **MySpace** in 2005. An attacker exploited CSRF to create a worm that added over a million users as friends and displayed a message on their profiles. The worm spread rapidly, highlighting the danger of CSRF vulnerabilities in social media platforms.

**File Upload Vulnerability** occurs when a web application improperly handles user-uploaded files, allowing attackers to upload malicious files that can compromise the server or the application. These vulnerabilities can lead to various attacks, including remote code execution, unauthorized access, and data breaches.

### How File Upload Vulnerability Works

When a web application allows users to upload files, it may not adequately validate, sanitize, or restrict the types of files that can be uploaded. An attacker can exploit this by uploading a malicious file, such as a script or executable, which the server might inadvertently execute.

### Example Scenario

Imagine a web application that allows users to upload profile pictures. The application may allow image file uploads, but without proper validation or security measures.

#### Vulnerable Code Example

Here’s an example of how a vulnerable file upload process might work in a PHP-based application:

php

```text
Copy code
if (isset($_FILES['profile_picture'])) {
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["profile_picture"]["name"]);
move_uploaded_file($_FILES["profile_picture"]["tmp_name"], $target_file);
}
```

In this scenario:

- The uploaded file is saved directly to the uploads/ directory without any checks on the file type, extension, or content.

- An attacker could upload a PHP file (e.g., shell.php) with malicious code.

### Attack Scenario

1.  **Upload the Malicious File:**

    - The attacker uploads a file named shell.php containing the following PHP code:

```php
<?php system($_GET['cmd']); ?>
```

2.  **Access the Uploaded File:**

    - The attacker then accesses the uploaded file via the URL: http://example.com/uploads/shell.php.

3.  **Execute Commands:**

    - By appending a command to the URL, such as http://example.com/uploads/shell.php?cmd=ls, the attacker can execute system commands on the server. For example, ls would list the files in the directory, and rm -rf / could attempt to delete files.

4.  **Compromise the Server:**

    - The attacker can now execute any command or upload additional scripts to gain further control over the server, potentially leading to a complete compromise.

### Mitigation Techniques

1.  **File Type Validation:**

    - Validate the file type based on the MIME type and file extension. However, don’t rely solely on the file extension, as it can be spoofed.

    - Example:

```php
$allowed_types = ['image/jpeg', 'image/png'];
if (!in_array(mime_content_type($_FILES['profile_picture']['tmp_name']), $allowed_types)) {
die("Invalid file type.");
}
```

2.  **File Name Sanitization:**

    - Sanitize the file name to prevent directory traversal or command injection attacks.

    - Example:

```php
$filename = basename($_FILES['profile_picture']['name']);
$target_file = $target_dir . preg_replace("/[^a-zA-Z0-9.]/", "", $filename);
```

3.  **Restrict File Permissions:**

    - Set proper file permissions on the uploaded files so that they cannot be executed. On Unix-based systems, you can set permissions to 0644, making the file readable and writable by the owner, but not executable.

    - Example:

```bash
chmod 0644 uploads/*
```

4.  **Store Files Outside the Web Root:**

    - Store uploaded files in a directory outside the web root, so they cannot be accessed or executed directly via a URL.

    - Example:

```php
$target_dir = "/var/www/uploads/"; // Outside the public_html directory
```

5.  **Use Content Security Policy (CSP):**

    - Implement a Content Security Policy that prevents the execution of untrusted scripts, even if they are uploaded to the server.

6.  **Rename Files:**

    - Rename the uploaded files to something unique and without the original extension. This helps prevent direct access to the file and makes it harder for an attacker to know the file’s location or name.

    - Example:

```php
$new_name = uniqid() . '.jpg';
```

7.  **Virus/Malware Scanning:**

    - Use antivirus or malware scanning tools to check uploaded files for malicious content before storing them on the server.

8.  **Limit File Size:**

    - Restrict the maximum file size to prevent denial of service (DoS) attacks through large file uploads.

### Real-World Example

In 2019, a vulnerability was discovered in **WordPress** that allowed attackers to upload malicious files. The flaw was in the way WordPress handled file uploads for certain plugins, allowing attackers to upload executable files disguised as images. This vulnerability led to numerous WordPress sites being compromised, with attackers uploading web shells and other malicious scripts.

**Brute Force Attack** is a method used by attackers to gain unauthorized access to a system, account, or encrypted data by systematically trying every possible combination of passwords, keys, or other credentials until the correct one is found. This type of attack relies on the sheer computational power available to the attacker and is one of the simplest forms of attack, but it can be effective against weak or poorly secured systems.

### How Brute Force Attacks Work

The attacker writes a script or uses a tool that automatically and repeatedly tries different combinations of characters, numbers, or words as the password or key. The process continues until the script finds the correct combination that grants access.

### Mitigation Techniques

1.  **Strong Password Policies:**

    - Encourage or enforce the use of complex passwords with a combination of uppercase, lowercase, numbers, and symbols.

    - Example: Enforcing passwords like G!xP9@2Z instead of password123.

2.  **Account Lockout Mechanisms:**

    - Temporarily lock accounts after a certain number of failed login attempts to slow down brute force attacks.

    - Example: Locking an account for 15 minutes after 5 failed login attempts.

3.  **Rate Limiting:**

    - Limit the number of login attempts from a single IP address within a certain time frame.

    - Example: Allowing only 5 login attempts per minute per IP address.

4.  **Two-Factor Authentication (2FA):**

    - Require a second form of verification (e.g., SMS code, authenticator app) in addition to the password.

    - Example: Even if the attacker guesses the password, they still need a one-time code from the user’s phone.

5.  **CAPTCHAs:**

    - Use CAPTCHAs on login pages to prevent automated scripts from attempting brute force attacks.

    - Example: Requiring users to solve a CAPTCHA after a failed login attempt.

6.  **Password Hashing:**

    - Store passwords using strong, salted hashes to prevent attackers from easily comparing hashed values.

    - Example: Storing 5f4dcc3b5aa765d61d8327deb882cf99 (the MD5 hash of "password") instead of the plaintext password.

### Real-World Example

One famous brute force attack occurred in 2013 when **Adobe** suffered a breach that exposed the usernames and poorly encrypted passwords of millions of users. Attackers used brute force techniques to crack the weak encryption, exposing many users’ passwords and leading to subsequent attacks on other services using the same credentials.

Brute force attacks are basic but can be effective if passwords are weak or if the system doesn’t implement strong security measures. Properly securing accounts with strong passwords, rate limiting, and two-factor authentication can significantly reduce the risk.

**Denial of Service (DoS)** and **Distributed Denial of Service (DDoS)** attacks are malicious attempts to make a network service, website, or other online resources unavailable to users by overwhelming it with a flood of illegitimate requests or traffic. These attacks can severely disrupt services, causing them to slow down or crash, preventing legitimate users from accessing them.

### Key Differences Between DoS and DDoS

- **DoS (Denial of Service):**

  - Involves a single machine or a small number of machines sending overwhelming traffic or requests to a target.

  - Easier to trace back to the attacker since it involves fewer sources.

- **DDoS (Distributed Denial of Service):**

  - Involves multiple machines (often thousands or even millions) attacking the target simultaneously. These machines are often part of a botnet—a network of compromised computers under the control of the attacker.

  - Much harder to mitigate and trace, as the attack comes from numerous sources, often located in different geographic locations.

### How DoS/DDoS Attacks Work

The main objective of a DoS/DDoS attack is to overwhelm the target with an excessive amount of traffic or requests, consuming its resources (such as bandwidth, CPU, or memory) to the point where it can no longer respond to legitimate users.

### Real-World Example

One of the most notorious DDoS attacks occurred in **October 2016**, when the DNS provider **Dyn** was hit by a massive DDoS attack, disrupting major websites and online services like Twitter, Netflix, Reddit, and CNN. The attack was launched using the **Mirai botnet**, which consisted of hundreds of thousands of compromised IoT devices (like cameras and routers). This attack brought significant attention to the vulnerabilities of IoT devices and the scale of damage that DDoS attacks can cause.

### Mitigation Techniques

1.  **Traffic Filtering:**

    - Use firewalls, Intrusion Detection Systems (IDS), and Intrusion Prevention Systems (IPS) to filter out malicious traffic before it reaches the server.

    - **Example:** Blocking traffic from known malicious IP addresses or regions where the attack traffic is originating.

2.  **Rate Limiting:**

    - Limit the number of requests that a single IP address can make to a server within a certain time frame.

    - **Example:** Allow only 10 requests per second per IP address.

3.  **Load Balancing:**

    - Distribute incoming traffic across multiple servers to prevent any single server from being overwhelmed.

    - **Example:** Using a Content Delivery Network (CDN) to spread traffic across geographically distributed servers.

**Ransomware** is a type of malicious software (malware) that encrypts a victim's data, rendering it inaccessible until a ransom is paid to the attacker. The attacker typically demands payment in cryptocurrency, which is difficult to trace, and promises to provide a decryption key that will restore access to the locked files. Ransomware attacks can target individuals, businesses, or even entire organizations, and can result in significant financial and operational damage.

### How Ransomware Works

1.  **Infection Vector:**

    - Ransomware often spreads through phishing emails, malicious attachments, compromised websites, or software vulnerabilities. Once the victim interacts with the malicious element (e.g., clicking a link, opening an attachment), the ransomware is downloaded onto their device.

2.  **Encryption:**

    - Once installed, the ransomware begins encrypting the files on the victim's computer, rendering them inaccessible. The files may include documents, images, databases, and other critical data.

3.  **Ransom Demand:**

    - After the encryption process is complete, the ransomware displays a ransom note on the victim’s screen. This note informs the victim of the attack and provides instructions on how to pay the ransom, typically in Bitcoin or another cryptocurrency.

4.  **Payment and Decryption:**

    - If the victim decides to pay the ransom, they follow the attacker’s instructions. After the payment is made, the attacker may (but not always) provide a decryption key that the victim can use to regain access to their files.

5.  **Potential Consequences:**

    - Even if the ransom is paid, there is no guarantee that the attacker will provide the decryption key or that it will work properly. Paying the ransom also encourages further attacks.

### Example Scenario

#### Scenario: WannaCry Ransomware Attack

One of the most infamous ransomware attacks in history was the **WannaCry** attack that occurred in May 2017. WannaCry spread rapidly, infecting hundreds of thousands of computers in over 150 countries within a matter of days.

1.  **Initial Infection:**

    - WannaCry exploited a vulnerability in the Windows operating system called **EternalBlue**, which was discovered by the U.S. National Security Agency (NSA) and leaked by the Shadow Brokers hacking group. The vulnerability allowed the ransomware to spread across networks without user interaction.

2.  **Encryption Process:**

    - Once installed on a system, WannaCry encrypted files with extensions like .docx, .jpg, .xls, and others. It then changed the file extensions to .WNCRY, making them inaccessible.

3.  **Ransom Note:**

    - After the encryption was complete, WannaCry displayed a ransom note demanding payment of $300 to $600 in Bitcoin for the decryption key. The note included a countdown timer, threatening to delete the files if the ransom wasn’t paid within a certain timeframe.

4.  **Spread and Impact:**

    - WannaCry’s use of the EternalBlue exploit allowed it to spread rapidly across networks, affecting organizations like the UK’s National Health Service (NHS), which had to cancel thousands of medical appointments, and major companies like FedEx and Telefónica. The attack caused billions of dollars in damages globally.

5.  **Resolution:**

    - A security researcher discovered a “kill switch” domain in the WannaCry code, which he registered, effectively stopping the spread of the ransomware. However, the damage had already been done, and many victims were left with encrypted files, some of whom paid the ransom

**Phishing attacks** are a type of social engineering attack where attackers attempt to deceive individuals into providing sensitive information such as usernames, passwords, credit card details, or other personal data. Phishing typically occurs via email, but it can also happen through text messages (SMS), phone calls, or even social media.

The primary goal of a phishing attack is to trick the victim into thinking they are interacting with a legitimate entity, such as a bank, social media platform, or company, so that they voluntarily hand over their sensitive information.

### Example Scenario

#### Scenario: Phishing Email Pretending to be from a Bank

1.  **The Phishing Email:**

    - The victim receives an email that appears to be from their bank. The email has the bank’s logo, branding, and even a legitimate-looking email address like support@yourbank.com.

    - The subject line reads: “URGENT: Verify Your Account Information to Avoid Suspension.”

2.  **The Message Content:**

    - The email states that there has been unusual activity on the victim’s bank account, and as a security measure, the account has been temporarily suspended.

    - The victim is instructed to click on a link to verify their account information. The email warns that failure to do so within 24 hours will result in permanent suspension of the account.

3.  **The Fake Website:**

    - The link in the email takes the victim to a fake website that looks identical to the bank’s login page. The URL might be slightly altered, such as www.yourbank-secure.com instead of www.yourbank.com.

    - The victim, believing this to be legitimate, enters their username and password into the fake login form.

4.  **The Theft:**

    - As soon as the victim submits their credentials, the fake website records them and sends them to the attacker.

    - The attacker now has access to the victim’s real bank account, where they can transfer funds, change account settings, or commit other forms of fraud.

5.  **The Aftermath:**

    - The victim may not realize they have been phished until they notice unauthorized transactions in their bank account or are unable to log in because the attacker has changed the password.

### Real-World Example

In 2016, a massive phishing attack targeted Gmail users. The attackers sent emails that appeared to come from trusted contacts, containing a Google Docs link. When users clicked the link, they were taken to a fake Google login page that harvested their credentials. This attack was particularly effective because the emails appeared to be from known contacts, and the fake login page was convincingly designed. Google responded quickly by disabling the malicious accounts and rolling out additional security measures.
