# DNS Record

DNS records map human-readable domain names (e.g. `example.com`) to IP addresses or other resources.

## 1. A Record (Address Record)

- **Purpose:** Maps domain → **IPv4** address.
- Points `example.com` to `192.0.2.1`.

```text
example.com. IN A 192.0.2.1
```

## 2. AAAA Record

- **Purpose:** Maps domain → **IPv6** address.
- Points `example.com` to IPv6 `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.

```text
example.com. IN AAAA 2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

## 3. CNAME Record (Canonical Name Record)

- **Purpose:** **Aliases** one domain to another.

```text
www.example.com. IN CNAME example.com.
This record points www.example.com to example.com.
```

## 4. MX Record (Mail Exchange Record)

- **Purpose:** Routes email to domain's **mail servers** (lower priority number = preferred).
- `mail.example.com` handles mail for `example.com` at priority 10.

```text
example.com. IN MX 10 mail.example.com.
```

## 5. TXT Record (Text Record)

- **Purpose:** Stores text — used for **verification/security** (SPF, DKIM).
- SPF record: which IPs may send email on behalf of the domain.

```text
example.com. IN TXT "v=spf1 ip4:192.0.2.0/24 -all"
```

## 6. NS Record (Name Server Record)

- **Purpose:** **Delegates** domain/subdomain to authoritative name servers.
- `ns1.example.net` and `ns2.example.net` are authoritative for `example.com`.

```text
example.com. IN NS ns1.example.net.
example.com. IN NS ns2.example.net.
```

## 7. PTR Record (Pointer Record)

- **Purpose:** **Reverse DNS** — maps IP address → domain name.
- `192.0.2.1` resolves back to `example.com`.

```text
1.2.0.192.in-addr.arpa. IN PTR example.com.
```

## 8. SRV Record (Service Record)

- **Purpose:** Defines **server location** for specific services (priority, weight, port).
- SIP service on `sipserver.example.com:5060` — priority 10, weight 60.

```text

```

## 9. SOA Record (Start of Authority Record)

- **Purpose:** Zone metadata — primary name server, admin email, timing settings.

```text
example.com. IN SOA ns1.example.com. admin.example.com. (
2024081401 ; serial number
7200 ; refresh
3600 ; retry
1209600 ; expire
3600 ) ; minimum TTL
```

### NS Redundancy Example

| Server | Role |
|--------|------|
| **ns1.example.net** | Primary — holds all DNS records |
| **ns2.example.net** | Secondary — backup if primary fails |

### DNS Resolution Workflow

1. **User Request** — Browser needs IP for `example.com`.
2. **Local Cache** — Browser → OS DNS cache → configured resolver (ISP/Google/Cloudflare).
3. **Resolver Query** — Checks cache; initiates lookup if miss.
4. **Root Server** — Referral to `.com` TLD name servers.
5. **TLD Server** — Returns **NS records** (e.g. `ns1.example.net`, `ns2.example.net`).
6. **Authoritative Server** — Returns **A record** with web server IP.
7. **IP Returned** — Resolver caches and returns IP to browser.
8. **Connection** — Browser establishes TCP/IP, sends HTTP request.
9. **Rendering** — Web page displayed.

### Caching & Key Points

- **Caching** at browser/OS/resolver reduces DNS load and latency.
- **TTL** controls cache duration; expired entries trigger fresh queries.
- **Redundancy:** Multiple NS records ensure availability if one server fails.
- **Scalability:** Distributed DNS infrastructure handles global resolution.
- Subdomains and parent domains may share or differ in IP addresses.
