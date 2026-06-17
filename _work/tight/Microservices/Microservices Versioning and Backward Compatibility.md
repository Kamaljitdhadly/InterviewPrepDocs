# Microservices Versioning and Backward Compatibility

## Questions Covered

1. How do you version your microservices APIs?
2. How do you maintain backward compatibility in microservices?
3. How do you handle breaking changes in microservices?

## How do you version your microservices APIs?

| Strategy | Example | Advantages |
|----------|---------|------------|
| **URI versioning** | `https://api.example.com/v1/users` | Simple, explicit client choice |
| **Query parameter** | `https://api.example.com/users?version=1` | Flexible, optional versioning |
| **Header versioning** | `Accept: application/vnd.example.v1+json` | Clean URLs; version negotiation |
| **Content negotiation** | `Accept: application/vnd.example.v1+json` | Preferred format + version |
| **Semantic versioning** | `v1.0.0` (major/minor/patch) | Signals breaking vs additive changes |
| **Decommissioning policy** | Sunset old versions on schedule | Encourages migration |

Header example:

GET /users HTTP/1.1
Accept: application/vnd.example.v1+json

## How do you maintain backward compatibility in microservices?

Existing clients must keep working when APIs change.

| Strategy | Description |
|----------|-------------|
| **Non-breaking changes** | Add fields; never remove/rename endpoints or fields |
| **Versioning** | New versions let consumers migrate on their schedule |
| **Deprecation policy** | Advance notice, docs, and alternatives for deprecated features |
| **Graceful failures** | Deprecated features return meaningful errors, not crashes |
| **Schema evolution** | Optional fields in JSON Schema; optional fields in Protobuf |
| **Feature flags** | Toggle new features without affecting existing behavior |
| **Comprehensive testing** | Unit, integration, and contract tests guard against regressions |

## How do you handle breaking changes in microservices?

Breaking changes require planning and clear consumer communication.

| Strategy | Description |
|----------|-------------|
| **New API version** | e.g., create v2 when removing/altering endpoints |
| **Migration path** | Guides, docs, timelines for deprecation |
| **Deprecation notices** | API responses warn consumers; grace period with both versions live |
| **Backward-compatible steps** | Deprecate field first, remove in later version |
| **Feature flags** | Controlled rollout to select users before full release |
| **Monitoring & logging** | Track usage and errors after changes |
| **Comprehensive testing** | Unit, integration, regression tests |
| **User feedback** | Engage consumers to identify pain points |
