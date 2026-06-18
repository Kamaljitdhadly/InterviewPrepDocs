# Certificate Signing Request on IIS and Azure Application Gateway

Here's a detailed workflow of the SSL process, starting from creating a Certificate Signing Request (CSR), purchasing an SSL certificate from a provider like GoDaddy, obtaining approval from the Certificate Authority (CA), and finally installing the SSL certificate on an IIS (Internet Information Services) server.

### Step 1: Generate a Certificate Signing Request (CSR) on IIS

1.  **Open IIS Manager**:

    - On the server where you want to install the certificate, open the IIS Manager.

2.  **Navigate to Server Certificates**:

    - In the IIS Manager, click on the server name in the "Connections" panel, then double-click on "Server Certificates" in the middle panel.

3.  **Create a CSR**:

    - Click on "Create Certificate Request…" in the "Actions" panel on the right.

4.  **Enter Distinguished Name Properties**:

    - You will be prompted to enter the following information:

      - **Common Name**: The fully qualified domain name (FQDN) you want to secure (e.g., www.mydomain.com).

      - **Organization**: The legal name of your organization.

      - **Organizational Unit**: The department within the organization (optional).

      - **City/Locality**: The city where your organization is located.

      - **State/Province**: The state or province where your organization is located.

      - **Country/Region**: The two-letter country code (e.g., US).

5.  **Select Cryptographic Service Provider Properties**:

    - Choose the following options:

      - **Cryptographic Service Provider**: Microsoft RSA SChannel Cryptographic Provider

      - **Bit Length**: 2048 (this is a standard key length for SSL certificates).

6.  **Save the CSR File**:

    - Specify a file name and location to save the CSR file (e.g., mydomain.csr). This file contains the CSR that you will submit to the CA.

### Step 2: Purchase SSL Certificate from GoDaddy

1.  **Go to GoDaddy's SSL Certificate Page**:

    - Visit the GoDaddy website and navigate to the SSL Certificates section.

2.  **Choose an SSL Certificate**:

    - Select the type of SSL certificate that meets your needs (e.g., Standard SSL, Wildcard SSL, EV SSL).

3.  **Start the Purchase Process**:

    - Add the SSL certificate to your cart and proceed to checkout.

4.  **Submit the CSR**:

    - During the purchase process, GoDaddy will prompt you to provide the CSR file you created. Upload the CSR (mydomain.csr) as requested.

5.  **Select the Server Type**:

    - You will be asked to select the server type. Choose "Microsoft IIS."

6.  **Complete the Purchase**:

    - Provide payment information and complete the purchase. Once done, GoDaddy will send the CSR to their CA for validation.

### Step 3: Certificate Authority (CA) Validation and Approval

1.  **Domain Validation**:

    - **Email Validation**: The CA will send a validation email to the domain's registered email address. You need to follow the instructions in the email to prove domain ownership.

    - **Other Validation Methods** (if applicable):

      - **DNS Validation**: You may need to add a specific DNS record to your domain’s DNS settings.

      - **File-Based Validation**: You might be asked to upload a specific file to your website.

2.  **Organization Validation** (for OV/EV SSL certificates):

    - The CA may request additional documents to verify your organization's identity.

3.  **Approval and Issuance**:

    - Once the CA verifies your information, they will issue the SSL certificate. You will receive the certificate files via email or download them from your GoDaddy account.

### Step 4: Download and Install the SSL Certificate on IIS

1.  **Download the Certificate**:

    - Log in to your GoDaddy account, navigate to your SSL certificates, and download the certificate files. Typically, you will receive:

      - **Primary Certificate** (your_domain_name.crt or your_domain_name.cer)

      - **Intermediate Certificates** (gd_bundle.crt or similar)

2.  **Install the SSL Certificate**:

    - **Return to IIS Manager**:

      - Open the IIS Manager and go to "Server Certificates" under your server in the "Connections" panel.

    - **Complete Certificate Request**:

      - Click on "Complete Certificate Request…" in the "Actions" panel.

    - **Specify the Certificate File**:

      - Browse and select the primary certificate file (your_domain_name.cer or .crt) you downloaded from GoDaddy.

    - **Enter a Friendly Name**:

      - Provide a friendly name for the certificate in IIS (e.g., MyDomain SSL).

    - **Select the Certificate Store**:

      - Choose "Personal" as the certificate store.

3.  **Bind the SSL Certificate to Your Site**:

    - **Go to the Site**:

      - In IIS Manager, expand "Sites" and select the site you want to secure with SSL.

    - **Edit Site Bindings**:

      - In the "Actions" panel, click "Bindings…" and then "Add" or "Edit" an existing binding.

    - **Configure HTTPS Binding**:

      - Set "Type" to https.

      - Select the appropriate IP address or use All Unassigned.

      - Specify port 443 (the standard port for HTTPS).

      - **SSL Certificate**: Select the SSL certificate you installed from the drop-down menu.

    - **Click OK** and close the bindings window.

4.  **Restart IIS**:

    - Restart IIS to apply the changes:

      - In the IIS Manager, click on the server name, and in the "Actions" panel, click "Restart."

### Step 5: Verify SSL Installation

1.  **Check the Certificate**:

    - Visit your website using https://yourdomain.com and verify that the SSL certificate is working correctly.

    - Look for a padlock icon in the browser's address bar, which indicates a secure connection.

2.  **Use SSL Checker Tools**:

    - You can use online SSL checker tools like SSL Labs' SSL Test to ensure the certificate is correctly installed and configured.

### Summary

1.  **Generate CSR**: Start by generating a CSR using IIS.

2.  **Purchase SSL**: Buy the SSL certificate from GoDaddy and submit the CSR during the purchase.

3.  **CA Validation**: The CA validates your domain and, if necessary, your organization.

4.  **Install SSL on IIS**: Download the certificate, install it on your IIS server, and bind it to your website.

5.  **Verify Installation**: Test and verify that your SSL certificate is correctly installed and the site is secure.

Here's a detailed workflow for purchasing an SSL certificate from Azure, installing it on an Azure Application Gateway, and securing a website hosted on an IIS server in an Azure Virtual Machine (VM).

### Step 1: Purchase an SSL Certificate from Azure

1.  **Access Azure Portal**:

    - Log in to the [<u>Azure Portal</u>](https://portal.azure.com).

2.  **Navigate to the Azure Key Vault**:

    - If you haven't already, create an Azure Key Vault or navigate to an existing one. The Key Vault will store your SSL certificate securely.

    - **Create Key Vault**:

      - Go to "Create a resource" > "Security + Identity" > "Key Vault."

      - Provide the necessary information, such as the Key Vault name, resource group, and region, then click "Create."

3.  **Generate a Certificate Signing Request (CSR)**:

    - Within the Key Vault, go to "Certificates" and click on "Generate/Import."

    - Choose the "Generate" option and fill out the certificate properties, including the subject name (e.g., CN=www.mydomain.com), and key type.

    - **Download the CSR**: After the CSR is generated, download it. You will need this CSR to purchase the SSL certificate.

4.  **Purchase the SSL Certificate**:

    - In the Azure Marketplace, search for "SSL Certificate" and select a certificate provider (e.g., DigiCert, GlobalSign, etc.).

    - **Follow the Purchase Flow**: During the purchase process, you will be prompted to upload the CSR generated from the Azure Key Vault.

    - Complete the purchase, and the CA will validate your request.

5.  **Certificate Authority (CA) Validation**:

    - The CA will validate your domain ownership and issue the SSL certificate.

    - Once validated, the certificate will be sent back to the Azure Key Vault.

### Step 2: Install the SSL Certificate on Azure Application Gateway

1.  **Access the Application Gateway**:

    - In the Azure Portal, navigate to "Application Gateway" under the "Networking" category.

2.  **Configure the Listener**:

    - Go to the "Listeners" tab within your Application Gateway.

    - Click on "Add listener" and choose the following settings:

      - **Listener Name**: Give a name to your listener.

      - **Frontend IP**: Choose the frontend IP configuration (Public/Private).

      - **Protocol**: Set the protocol to HTTPS.

      - **Port**: Typically, set to 443.

      - **SSL Certificate**:

        - Select "Choose a Key Vault certificate."

        - Browse and select the SSL certificate stored in your Azure Key Vault.

3.  **Create a New HTTP Setting**:

    - Under "HTTP settings," create a new setting that will be associated with the listener.

    - **Backend Port**: Set the backend port to 443 (if your IIS site is configured for HTTPS).

    - **Protocol**: Select HTTPS.

    - **Use Well-Known CA Certificate**: Enable this if the certificate is from a trusted CA.

    - **Override with New Host Name**: If necessary, override the hostname for backend requests.

4.  **Associate Listener with Backend Pool**:

    - Link the listener to the appropriate backend pool (which contains your IIS server).

    - Ensure the routing rules correctly forward traffic from the listener to your IIS server.

### Step 3: Secure the IIS Website on an Azure VM

1.  **Access the IIS Server in the Azure VM**:

    - Connect to your Azure VM using Remote Desktop Protocol (RDP).

2.  **Import the SSL Certificate**:

    - Open the Azure Key Vault and export the SSL certificate in .pfx format.

    - Transfer the .pfx file to the Azure VM.

    - **Import Certificate in IIS**:

      - Open IIS Manager on the VM.

      - Go to "Server Certificates" and click on "Import."

      - Select the .pfx file and enter the password (if any) used during the export.

3.  **Bind the SSL Certificate to the Website**:

    - In IIS Manager, go to "Sites" and select the site you want to secure.

    - Click on "Bindings…" in the "Actions" panel.

    - Add or edit the https binding:

      - **Type**: Set to https.

      - **IP Address**: Set to the appropriate IP address or All Unassigned.

      - **Port**: Set to 443.

      - **SSL Certificate**: Select the imported SSL certificate from the dropdown list.

    - Click "OK" and close the bindings window.

4.  **Configure Backend HTTPS in Application Gateway**:

    - Ensure that your Application Gateway is configured to communicate with the backend IIS server over HTTPS.

5.  **Test the Configuration**:

    - Access your website using https://yourdomain.com and verify that it’s secured with the SSL certificate.

    - Check for the padlock icon in the browser's address bar to confirm the secure connection.

### Step 4: Verify the SSL Installation

1.  **Use SSL Checker Tools**:

    - Use tools like SSL Labs' SSL Test to test the SSL installation.

    - Ensure that the SSL certificate is correctly installed and that the chain of trust is complete.

2.  **Monitor Application Gateway**:

    - Monitor the Application Gateway to ensure that SSL offloading is working correctly and that there are no issues with traffic routing or certificate validation.

### Summary

1.  **Purchase SSL from Azure**: Generate a CSR in Azure Key Vault and purchase an SSL certificate.

2.  **Install on Application Gateway**: Configure the Application Gateway with the SSL certificate from Azure Key Vault.

3.  **Secure IIS in Azure VM**: Import the SSL certificate into IIS, bind it to the website, and ensure HTTPS communication.

4.  **Verify and Monitor**: Test the SSL installation and monitor the Application Gateway for correct operation.

This process ensures that your website hosted on IIS in an Azure VM is securely accessed through HTTPS, with SSL offloading managed by the Azure Application Gateway.
