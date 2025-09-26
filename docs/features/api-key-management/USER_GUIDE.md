# API Key Management - User Guide

> **🔑 Complete guide for end users managing API keys in AegisX Platform**

This guide helps end users understand how to generate, manage, and use API keys for programmatic access to the AegisX platform.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating API Keys](#creating-api-keys)
3. [Using API Keys](#using-api-keys)
4. [Managing Your Keys](#managing-your-keys)
5. [Security Best Practices](#security-best-practices)
6. [Common Use Cases](#common-use-cases)
7. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### What are API Keys?

API keys are secure tokens that allow your applications, scripts, or third-party services to access AegisX platform resources programmatically without requiring interactive login.

### Why Use API Keys?

- **Automation**: Automate tasks and integrate with other systems
- **Security**: Dedicated credentials separate from your user account
- **Control**: Fine-grained permissions and easy revocation
- **Monitoring**: Track usage and identify potential issues

### Prerequisites

- Active AegisX user account
- JWT authentication token (login to the platform first)

## 🔑 Creating API Keys

### Step 1: Generate Your First API Key

1. **Login to AegisX Platform** and obtain your JWT token
2. **Choose a descriptive name** for your API key (e.g., "Mobile App Integration")
3. **Define permissions** (scopes) for what the key can access
4. **Set expiry** (optional, defaults to 365 days)

### Step 2: API Key Generation Example

```bash
curl -X POST http://localhost:3333/api/apiKeys/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Integration Key",
    "scopes": [
      {
        "resource": "users",
        "actions": ["read"]
      }
    ],
    "expiryDays": 90
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Integration Key",
    "key": "ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...",
    "prefix": "ak_a1b2c3d4",
    "preview": "***...d479",
    "expires_at": "2024-01-26T10:00:00Z",
    "is_active": true
  },
  "message": "API key generated successfully. Store it securely - it will not be shown again!"
}
```

⚠️ **Important**: Save the full API key immediately! It will never be displayed again for security reasons.

### Understanding Scopes

Scopes define what your API key can access:

| Scope Example                                         | Description                    |
| ----------------------------------------------------- | ------------------------------ |
| `{"resource": "users", "actions": ["read"]}`          | Read user information only     |
| `{"resource": "files", "actions": ["read", "write"]}` | Read and modify files          |
| `{"resource": "*", "actions": ["read"]}`              | Read-only access to everything |
| `{"resource": "users", "actions": ["*"]}`             | Full access to users           |

**Recommendation**: Use the minimum permissions needed for your use case.

## 🛠️ Using API Keys

### Method 1: Header Authentication (Recommended)

```bash
curl -X GET http://localhost:3333/api/users \
  -H "x-api-key: ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479..."
```

### Method 2: Bearer Token Authentication

```bash
curl -X GET http://localhost:3333/api/users \
  -H "Authorization: Bearer ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479..."
```

### Programming Examples

#### JavaScript/Node.js

```javascript
const apiKey = 'ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...';

// Using fetch
const response = await fetch('http://localhost:3333/api/users', {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  },
});

const users = await response.json();
```

#### Python

```python
import requests

api_key = 'ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...'

response = requests.get(
    'http://localhost:3333/api/users',
    headers={'x-api-key': api_key}
)

users = response.json()
```

#### PHP

```php
<?php
$apiKey = 'ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3333/api/users');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-api-key: ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$users = json_decode($response, true);
curl_close($ch);
?>
```

## 📊 Managing Your Keys

### View All Your API Keys

```bash
curl -X GET http://localhost:3333/api/apiKeys/my-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Integration Key",
      "prefix": "ak_a1b2c3d4",
      "preview": "***...d479",
      "scopes": [{ "resource": "users", "actions": ["read"] }],
      "last_used_at": "2023-09-26T08:30:00Z",
      "last_used_ip": "192.168.1.100",
      "expires_at": "2024-01-26T10:00:00Z",
      "is_active": true,
      "created_at": "2023-09-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Filter and Search Keys

```bash
# Search by name
curl -X GET "http://localhost:3333/api/apiKeys/my-keys?search=integration" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter active keys only
curl -X GET "http://localhost:3333/api/apiKeys/my-keys?isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Include expired keys
curl -X GET "http://localhost:3333/api/apiKeys/my-keys?includeExpired=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Revoke (Disable) an API Key

```bash
curl -X POST http://localhost:3333/api/apiKeys/550e8400-e29b-41d4-a716-446655440000/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyId": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "No longer needed"
  }'
```

**When to revoke:**

- Key is no longer needed
- Suspected security compromise
- Employee leaving team
- Project discontinued

### Rotate an API Key

Rotation generates a new key with the same permissions and deactivates the old one:

```bash
curl -X POST http://localhost:3333/api/apiKeys/550e8400-e29b-41d4-a716-446655440000/rotate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyId": "550e8400-e29b-41d4-a716-446655440000",
    "newName": "My Integration Key (Rotated)"
  }'
```

**When to rotate:**

- Regular security maintenance (recommended: every 90 days)
- After potential exposure
- Before key expiry
- Team member changes

### Validate API Key

Check if a key is valid and has specific permissions:

```bash
curl -X POST http://localhost:3333/api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...",
    "resource": "users",
    "action": "read"
  }'
```

## 🔐 Security Best Practices

### 🛡️ Storage Security

**✅ Do:**

- Store API keys in environment variables
- Use secure credential management systems
- Keep keys in encrypted configuration files
- Use different keys for different environments

**❌ Don't:**

- Hardcode keys in source code
- Store keys in version control
- Share keys via email or chat
- Use the same key across multiple applications

### 🔄 Key Rotation Schedule

| Key Usage           | Rotation Frequency |
| ------------------- | ------------------ |
| Production systems  | Every 90 days      |
| Development/testing | Every 180 days     |
| One-time scripts    | After use          |
| High-privilege keys | Every 30 days      |

### 📊 Monitoring and Auditing

**Regular Security Checks:**

1. **Review API key usage monthly**

   ```bash
   curl -X GET "http://localhost:3333/api/apiKeys/my-keys" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. **Check for unused keys**
   - Look for keys with old `last_used_at` dates
   - Revoke keys not used in 90+ days

3. **Monitor for suspicious activity**
   - Unusual IP addresses in `last_used_ip`
   - Unexpected usage patterns
   - Failed authentication attempts

### 🚨 Security Incident Response

**If you suspect a key is compromised:**

1. **Immediately revoke the key**

   ```bash
   curl -X POST http://localhost:3333/api/apiKeys/{KEY_ID}/revoke \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"reason": "Security incident"}'
   ```

2. **Generate a replacement key**
3. **Update all systems using the old key**
4. **Review access logs for unauthorized usage**
5. **Report the incident if required**

## 💼 Common Use Cases

### 1. CI/CD Pipeline Integration

**Scenario**: Automated deployment scripts need to access user data.

```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        env:
          AEGISX_API_KEY: ${{ secrets.AEGISX_API_KEY }}
        run: |
          curl -X GET http://api.aegisx.com/users \
            -H "x-api-key: $AEGISX_API_KEY"
```

**Recommended Scopes:**

```json
{
  "scopes": [
    { "resource": "users", "actions": ["read"] },
    { "resource": "deployments", "actions": ["write"] }
  ]
}
```

### 2. Mobile Application

**Scenario**: Mobile app needs read-only access to user profiles.

```javascript
// React Native example
const ApiService = {
  apiKey: 'ak_mobile_app_key...',
  baseUrl: 'https://api.aegisx.com',

  async getProfile(userId) {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
```

**Recommended Scopes:**

```json
{
  "scopes": [
    { "resource": "user-profile", "actions": ["read"] },
    { "resource": "settings", "actions": ["read"] }
  ]
}
```

### 3. Data Analytics Script

**Scenario**: Weekly report generation script.

```python
#!/usr/bin/env python3
import os
import requests
from datetime import datetime, timedelta

# Load API key from environment
api_key = os.getenv('AEGISX_API_KEY')
if not api_key:
    raise Exception('AEGISX_API_KEY environment variable required')

def generate_weekly_report():
    # Get users created in the last week
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    response = requests.get(
        'https://api.aegisx.com/users',
        headers={'x-api-key': api_key},
        params={'created_after': week_ago}
    )

    users = response.json()
    print(f"New users this week: {len(users['data'])}")

if __name__ == '__main__':
    generate_weekly_report()
```

**Recommended Scopes:**

```json
{
  "scopes": [
    { "resource": "users", "actions": ["read"] },
    { "resource": "analytics", "actions": ["read"] }
  ]
}
```

### 4. Third-Party Integration

**Scenario**: CRM system sync with user data.

```javascript
class CRMSync {
  constructor(aegisxApiKey, crmApiKey) {
    this.aegisxKey = aegisxApiKey;
    this.crmKey = crmApiKey;
  }

  async syncUsers() {
    // Get users from AegisX
    const response = await fetch('https://api.aegisx.com/users', {
      headers: {
        'x-api-key': this.aegisxKey,
        'Content-Type': 'application/json',
      },
    });

    const users = await response.json();

    // Sync to CRM
    for (const user of users.data) {
      await this.updateCRM(user);
    }
  }

  async updateCRM(user) {
    // CRM update logic
  }
}
```

**Recommended Scopes:**

```json
{
  "scopes": [
    { "resource": "users", "actions": ["read"] },
    { "resource": "contacts", "actions": ["read"] }
  ]
}
```

## 🐛 Troubleshooting

### Common Error Messages

#### "Invalid API key format"

**Cause**: API key doesn't follow the required format.  
**Solution**: Ensure your key follows `ak_{prefix}_{secret}` format.

#### "API key has expired"

**Cause**: Your API key has passed its expiration date.  
**Solution**: Rotate your key or generate a new one.

#### "Insufficient permissions for read on users"

**Cause**: Your API key lacks the required scope.  
**Solution**: Generate a new key with appropriate scopes.

#### "API key is disabled"

**Cause**: Key has been revoked or deactivated.  
**Solution**: Generate a new API key.

### Testing Your API Key

```bash
# Test basic validity
curl -X POST http://localhost:3333/api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{"key": "YOUR_API_KEY"}'

# Test specific permission
curl -X POST http://localhost:3333/api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{
    "key": "YOUR_API_KEY",
    "resource": "users",
    "action": "read"
  }'

# Test actual endpoint
curl -X GET http://localhost:3333/api/protected-data \
  -H "x-api-key: YOUR_API_KEY"
```

### Debug Checklist

1. **✓ Check API key format**: Should start with `ak_` and be long
2. **✓ Verify expiration**: Check `expires_at` in your key list
3. **✓ Confirm scope**: Ensure key has required permissions
4. **✓ Test connectivity**: Verify you can reach the API server
5. **✓ Check headers**: Ensure you're using correct header name (`x-api-key`)

### Getting Help

1. **Check server logs** for detailed error messages
2. **Use debug endpoints** to validate your key
3. **Contact system administrator** for permission issues
4. **Review this guide** for usage examples

---

## 📞 Support

For additional help:

- **Technical Documentation**: [API Reference](./API_REFERENCE.md)
- **Developer Guide**: [Developer Guide](./DEVELOPER_GUIDE.md)
- **Security Issues**: Report privately to security team
- **Bug Reports**: Submit via GitHub issues

Remember: Never share your API keys or include them in support requests!
