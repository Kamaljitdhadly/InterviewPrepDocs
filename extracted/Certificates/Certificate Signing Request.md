A Certificate Signing Request (CSR) is a message sent from an applicant to a Certificate Authority (CA) to apply for a digital certificate. The CSR contains the public key and identifying information that the CA will include in the certificate.

Here’s a step-by-step workflow for creating and submitting a CSR, with an example:

**Workflow for Certificate Signing Request (CSR)**

**1. Generate a Private Key**

- **Step**: Generate a private key on your server or local machine. This key will remain private and should be kept secure.

- **Command Example (OpenSSL)**:

> openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048

- **Explanation**: This command generates a 2048-bit RSA private key and saves it to a file named private.key.

**2. Create the CSR**

- **Step**: Use the private key to create a CSR. The CSR will include the public key derived from the private key and the information that will be associated with the certificate.

- **Command Example (OpenSSL)**:

> openssl req -new -key private.key -out mydomain.csr

- **Explanation**: This command generates a CSR named mydomain.csr using the private key private.key.

- **Interactive Example (OpenSSL)**:

> <img src="extracted\Certificates\media/media/image1.png" style="width:5.63611in;height:4.47708in" />

- **Explanation**: This interactive prompt asks for information to include in the CSR, such as the domain name (Common Name), organization, locality, etc.

**Fields Explained**:

- **Country Name**: The two-letter ISO code for the country where your organization is located (e.g., US for the United States).

- **State or Province Name**: The full name of the state or province where your organization is located.

- **Locality Name**: The city where your organization is located.

- **Organization Name**: The legal name of your organization.

- **Organizational Unit Name**: The department within the organization (optional).

- **Common Name**: The fully qualified domain name (FQDN) for which you are requesting the certificate (e.g., www.mydomain.com).

- **Email Address**: The email address of the certificate administrator.

**3. Submit the CSR to a Certificate Authority (CA)**

- **Step**: Submit the CSR file (mydomain.csr) to the CA. The CA will verify your identity and, if everything is correct, issue the digital certificate.

- **Example**:

  - If using a web-based CA, you typically upload the mydomain.csr file through their web interface.

  - Some CAs may allow you to email the CSR or use an API for submission.

**4. Receive and Install the Digital Certificate**

- **Step**: After the CA verifies your request, you will receive a digital certificate, typically via email or through their website.

- **Example**:

  - The CA provides a .crt or .cer file, which contains your signed certificate.

  - You may also receive intermediate certificates that need to be installed along with your primary certificate.

- **Install the Certificate**:

  - For web servers like Apache or Nginx, you would install the certificate and configure the server to use it.

  - **Apache Example**:

> SSLCertificateFile /path/to/certificate.crt
>
> SSLCertificateKeyFile /path/to/private.key
>
> SSLCertificateChainFile /path/to/intermediate.crt

- **Nginx Example**:

> ssl_certificate /path/to/certificate.crt;
>
> ssl_certificate_key /path/to/private.key;

**5. Configure and Test the Server**

- **Step**: After installing the certificate, configure your server to use it, and restart the server to apply the changes.

- **Test the Configuration**:

  - Use online tools like SSL Labs' SSL Test to verify the installation.

  - Ensure that the certificate chain is complete and that no warnings or errors are present.

**Example CSR Content**

Here’s an example of what the CSR (mydomain.csr) might look like:

-----BEGIN CERTIFICATE REQUEST-----

MIICsTCCAZkCAQAwgZMxCzAJBgNVBAYTAlVTMRUwEwYDVQQIDAxDYWxpZm9ybmlh

MRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhNeSBDb21wYW55MRow

GAYDVQQLDBFJVCBEZXBhcnRtZW50MRowGAYDVQQDDBF3d3cubXlkb21haW4uY29t

MSIwIAYJKoZIhvcNAQkBFhNhZG1pbkBteWRvbWFpbi5jb20wggEiMA0GCSqGSIb3

DQEBAQUAA4IBDwAwggEKAoIBAQCy0yg3LfH+VZLF9pZ5bPK8E97QQf17GZX9PpFv

...

-----END CERTIFICATE REQUEST-----

**Summary**

1.  **Generate a Private Key**: This is done securely on your server or local machine.

2.  **Create the CSR**: The CSR is created using the private key and contains the public key and identity information.

3.  **Submit the CSR**: The CSR is submitted to a CA for verification and certificate issuance.

4.  **Receive and Install the Certificate**: The CA issues the certificate, which is installed on your server.

5.  **Configure and Test**: The server is configured to use the certificate, and its setup is tested to ensure everything is secure.

This workflow ensures that your server can establish trusted, secure communications with clients.

The Certificate Authority (CA) often sends intermediate certificates along with the primary digital certificate to ensure that a complete trust chain is established between the server and the client. Here’s why intermediate certificates are important:

**1. Understanding the Certificate Chain**

- **Root Certificate**: At the top of the chain is the root certificate, which is issued by a trusted root CA. This certificate is self-signed and is usually pre-installed in the trust stores of operating systems and browsers.

- **Intermediate Certificates**: These are issued by the root CA or by another intermediate CA. They act as "middlemen" between the root certificate and the end-user (server) certificate.

- **End-User Certificate**: This is the certificate issued to your domain (e.g., www.mydomain.com). It is the certificate you install on your server.

**2. Purpose of Intermediate Certificates**

- **Security and Trust Delegation**:

  - The root certificate is highly sensitive because it's trusted by all systems. CAs minimize the risk by not using the root certificate to sign end-user certificates directly. Instead, they issue intermediate certificates that can sign end-user certificates. This delegation of trust helps protect the root certificate from compromise.

- **Scalability and Management**:

  - CAs can create multiple intermediate certificates for different purposes or regions. This allows them to issue certificates more efficiently and manage the issuance process more effectively without exposing the root certificate.

- **Revocation Management**:

  - If an intermediate certificate is compromised, it can be revoked without affecting the root certificate or other intermediate certificates. This limits the scope of security incidents.

- **Building the Trust Chain**:

  - When a client (e.g., a web browser) connects to your server, it needs to verify that your server’s certificate is trusted. Since the client might not have the intermediate certificates pre-installed, the server sends these certificates along with the end-user certificate.

  - The client uses these intermediate certificates to build a chain of trust from the end-user certificate back to a trusted root certificate. If the chain is complete and valid, the client trusts the connection.

**3. How the Chain of Trust Works**

- **Example**:

  - Your server sends:

    - **End-User Certificate**: www.mydomain.com

    - **Intermediate Certificate**: Issued by an intermediate CA

  - The client receives these certificates and checks:

    - Does the intermediate certificate link to a trusted root certificate in the client's trust store?

    - Is the end-user certificate properly signed by the intermediate certificate?

    - Is the chain unbroken and valid?

  - If all checks pass, the connection is trusted.

**4. What Happens If Intermediate Certificates Are Missing?**

- **Incomplete Trust Chain**: If your server doesn’t send the intermediate certificates, the client might not be able to complete the trust chain back to the root certificate. This can result in errors such as “certificate not trusted” or “unknown issuer.”

- **Browser Warnings**: Users may see warnings in their browser that the connection is not secure, which can deter them from proceeding and damage trust in your site.

**5. Best Practices**

- **Always Include Intermediate Certificates**: When configuring your server, make sure to include all intermediate certificates provided by the CA in your certificate chain.

- **Use the Correct Order**: The certificates should be presented in the correct order, starting with the end-user certificate, followed by intermediate certificates, and ending with the root certificate (though the root certificate is typically not sent by the server).

**Summary**

Intermediate certificates are a crucial part of the PKI system, ensuring secure and scalable management of certificates. By using intermediate certificates, CAs can protect the root certificate, delegate trust, and ensure that clients can validate the trustworthiness of end-user certificates. This practice helps maintain a robust and secure digital infrastructure.
