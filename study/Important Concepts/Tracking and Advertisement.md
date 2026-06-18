# Tracking and Advertisement

Trackers collect cross-site user behavior data, sold or shared with advertisers. Typical flow:

## 1. Data Collection by Trackers

- **Trackers Embedded on Websites** — ad networks, analytics, social platforms embed cookies, pixels, or JavaScript across many sites.
- **Behavior Tracking** collects:

| Data Type | Examples |
|-----------|----------|
| **Visited Websites** | Pages and sites browsed |
| **Content Interaction** | Clicks, videos, articles |
| **Purchasing Behavior** | Views, cart adds, purchases |
| **Demographic/Location** | Inferred age, gender, location, interests |
| **Device Information** | Device and browser details |

## 2. Data Aggregation

- **User Profiling** — aggregated data builds profiles: interests, behaviors, preferences, purchase intent.
- **Cross-Site and Cross-Device Tracking** — links behavior across sites/devices for comprehensive profiles.

## 3. Data Monetization

- **Selling Data to Advertisers** — detailed profiles enable precise ad targeting.

  - **Audience Segments** — sold as segments ("sports enthusiasts," "frequent travelers," "tech gadget buyers").
  - **Programmatic Advertising** — RTB systems auto-bid on impressions matching desired audiences.

- **Data Sharing with Ad Networks** — enables personalized ads across the web.

  - **Retargeting Campaigns** — product viewed on Site A → ads on Site B via shared tracker data.

## 4. Use of Data by Advertisers

- **Personalized Advertising** — travel-site visitor sees flight/hotel/insurance ads.
- **Behavioral Targeting** — ads for previously viewed products.
- **Conversion Optimization** — precise targeting improves click-through and purchase rates.

## 5. Privacy Concerns and Regulations

- **Lack of Transparency** — users often unaware of collection scope → growing privacy concerns.
- **Regulatory Response** — **GDPR** (EU) and **CCPA** (U.S.) require explicit consent, opt-out rights, and disclosure of collection/sharing.

### Summary

Trackers centralize behavioral data collection for the ad ecosystem. Aggregated profiles are sold to advertisers for effective targeting — but privacy concerns drive regulation and privacy-preserving ad tech.

---

Prominent tracking companies in the online advertising ecosystem:

## 1. Google (Alphabet Inc.)

- **Products**: Google Analytics, Google Ads, DoubleClick, AdSense, Firebase, Tag Manager
- **How They Track**: Embedded across millions of sites/apps; behavior data powers Google Ads targeting.
- **Market Share**: Dominant online advertising; trackers on millions of websites.

## 2. Facebook (Meta Platforms, Inc.)

- **Products**: Facebook Pixel, Facebook Login, Facebook SDK
- **How They Track**: Pixel tracks web actions linked to FB accounts; Login tracks cross-site auth usage.
- **Market Share**: Tracking extends beyond Facebook/Instagram to millions of external sites/apps.

## 3. Amazon

- **Products**: Amazon Advertising, AWS, Alexa Internet (defunct)
- **How They Track**: E-commerce data + cross-web ad tracking for product-related personalized ads.
- **Market Share**: Major ad player; unique e-commerce customer data advantage.

## 4. Adobe

- **Products**: Adobe Analytics, Adobe Audience Manager, Adobe Experience Cloud
- **How They Track**: Web/app analytics + Audience Manager profile building for targeted advertising.
- **Market Share**: Enterprise-level digital marketing and analytics leader.

## 5. Oracle

- **Products**: Oracle Data Cloud (BlueKai), Eloqua, Moat
- **How They Track**: Aggregates third-party online behavior into detailed profiles for targeting/marketing automation.
- **Market Share**: Leader in DMPs and data-driven marketing.

---

Cross-site example: Google Analytics on `abcde.com` + Google Ads on `qwerty.com`:

## 1. Google Analytics on abcde.com

- **Setup** — tracking code collects pages visited, time on site, clicks, interactions.
- **Data Collection** — geographic location, device type, referral sources stored in reports.
- **User Profiles** — anonymized profiles with interests inferred from `abcde.com` behavior.

## 2. Google Ads on qwerty.com

- **Setup** — conversion/remarketing tags placed on site.
- **Targeted Advertising** — Google Ads uses Analytics + cross-site data for personalized ads on `qwerty.com`.

## 3. Cross-Site Data Usage

- **Linking User Data** — same user on both sites → ads on `qwerty.com` based on `abcde.com` interests.
- **Remarketing** — product interest on `abcde.com` → related ads on `qwerty.com`.

## 4. Data Sharing Between Sites

- **Google's Ecosystem** — any Google-service interaction feeds the shared network for cross-site targeting.
- **User Behavior Tracking** — cross-site/device linking delivers personalized ads from prior behavior.

## 5. Privacy and User Consent

- **User Consent** — GDPR requires disclosure; cookie consent banners standard.
- **Transparency** — disclose collection/storage/use; offer opt-out of personalized advertising.

### Example Scenario

1. **User visits abcde.com** — browses "running shoes."
2. **Google Analytics tracks behavior** — interest stored in Google's ecosystem.
3. **User visits qwerty.com** — Google Ads integrated.
4. **Targeted Ad Display** — running shoe ads shown based on `abcde.com` visit.
