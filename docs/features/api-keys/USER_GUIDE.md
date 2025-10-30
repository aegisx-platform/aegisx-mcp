# API Keys User Guide

> **Complete guide for generating, managing, and using API keys for programmatic access to your application.**

## 📋 Table of Contents

- [Introduction](#introduction)
- [Generating API Keys](#generating-api-keys)
- [Using API Keys](#using-api-keys)
- [Managing Your Keys](#managing-your-keys)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

API Keys provide secure programmatic access to your application's APIs without requiring interactive login. They are perfect for:

- **Server-to-Server Communication** - Backend services calling your APIs
- **Scheduled Jobs** - Cron jobs, data synchronization tasks
- **Mobile Apps** - Mobile applications needing API access
- **Third-Party Integrations** - External systems accessing your data
- **Automation Scripts** - Scripts for data import/export, monitoring

### Key Concepts

- **API Key**: A unique identifier that authenticates API requests
- **Permissions**: What actions the API key can perform (read, write, etc.)
- **Expiration**: Optional time limit for key validity
- **Prefix**: The visible part of the key (e.g., `ak_8a9590a2`)

## Generating API Keys

### Step-by-Step Guide

#### 1. Navigate to API Keys Management

1. Log in to your account
2. Click your profile icon → **Settings**
3. Navigate to **API Keys** section

#### 2. Click "Generate New Key"

![Generate Key Button](images/generate-button.png)

#### 3. Fill in Key Details

**Required Fields:**

- **Name** (required)
  - Example: "Production Server", "Mobile App", "Data Import Script"
  - Should be descriptive for easy identification
  - Maximum 100 characters

**Optional Fields:**

- **Description** (optional)
  - Detailed notes about key usage
  - Example: "Used by production server for user data synchronization"
  - Maximum 500 characters

- **Expires In** (optional)
  - Number of days until key expires
  - Range: 1 - 3650 days (10 years)
  - Leave empty for permanent key
  - **Recommendation**: Use expiring keys for temporary integrations

#### 4. Generate the Key

Click **"Generate API Key"** button.

#### 5. ⚠️ CRITICAL: Save Your Key

![Generated Key Display](images/key-generated.png)

**YOU WILL ONLY SEE THE FULL KEY ONCE!**

```
ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
```

**What to do:**

1. **Copy the key immediately** using the copy button
2. **Store it in a secure location**:
   - Password manager (1Password, LastPass, Bitwarden)
   - Environment variable in your application
   - Secure secrets management system (AWS Secrets Manager, HashiCorp Vault)
3. **NEVER** commit the key to Git
4. **NEVER** share the key via email or chat

**After closing this dialog, you will only see the key preview:**

```
ak_8a9590a2_87e4...12f5e1e
```

#### 6. Verify Key Information

The dialog shows:

- **Name**: Your chosen name
- **Preview**: Masked key for identification
- **Status**: Active
- **Expires**: Expiration date (or "Never")

Click **"Done - I've Saved My Key"** once you've securely stored the key.

## Using API Keys

### Authentication Methods

You have 3 ways to send your API key with requests:

#### Method 1: Custom Header (Recommended) ⭐

**Best for**: Server-to-server communication, backend integrations

```bash
# cURL example
curl -X GET http://api.example.com/api/users \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json"
```

```javascript
// JavaScript (Node.js)
const http = require('http');

const options = {
  hostname: 'api.example.com',
  path: '/api/users',
  method: 'GET',
  headers: {
    'x-api-key': process.env.API_KEY,
    'Content-Type': 'application/json',
  },
};

http.request(options, callback).end();
```

```python
# Python
import requests

headers = {
    'x-api-key': os.environ['API_KEY'],
    'Content-Type': 'application/json'
}

response = requests.get('http://api.example.com/api/users', headers=headers)
```

**Advantages**:

- Clear and explicit API key authentication
- Doesn't interfere with OAuth/JWT headers
- Easy to filter in logs

#### Method 2: Bearer Token

**Best for**: Tools expecting OAuth-style authentication

```bash
# cURL example
curl -X GET http://api.example.com/api/users \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type": application/json"
```

```javascript
// JavaScript (fetch)
fetch('http://api.example.com/api/users', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```python
# Python
import requests

headers = {
    'Authorization': f'Bearer {os.environ["API_KEY"]}',
    'Content-Type': 'application/json'
}

response = requests.get('http://api.example.com/api/users', headers=headers)
```

**Advantages**:

- Standard authorization header
- Works with OAuth-aware HTTP clients
- Compatible with most API testing tools

#### Method 3: Query Parameter

**Best for**: Webhooks, URLs with limited header support

```bash
# cURL example
curl -X GET "http://api.example.com/api/users?api_key=YOUR_API_KEY_HERE"
```

```javascript
// JavaScript
const API_KEY = process.env.API_KEY;
const url = `http://api.example.com/api/users?api_key=${API_KEY}`;

fetch(url)
  .then((response) => response.json())
  .then((data) => console.log(data));
```

**⚠️ Security Warning**:

- Keys may appear in server logs
- Keys visible in browser history/URL bar
- Only use when headers are not possible
- Must be explicitly enabled on specific routes

### Testing Your API Key

#### Simple Test Script (Node.js)

Create `test-api-key.js`:

```javascript
const http = require('http');

// ⚠️ Replace with your actual API key
const API_KEY = 'ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e';

console.log('🔐 Testing API Key Authentication\n');

const options = {
  hostname: '127.0.0.1',
  port: 3383,
  path: '/api/users?limit=5',
  method: 'GET',
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
};

const request = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);

    if (res.statusCode === 200) {
      const data = JSON.parse(body);
      console.log('✅ Success!');
      console.log(`Found ${data.data?.length || 0} users`);
      console.log('\nResponse:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed:', body);
    }
  });
});

request.on('error', (e) => {
  console.error('❌ Request Error:', e.message);
});

request.end();
```

Run the test:

```bash
node test-api-key.js
```

#### Expected Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "cd79fbcf-1eba-4d0a-a90d-e06646e55b4a",
      "email": "admin@aegisx.local",
      "username": "admin",
      "role": "admin",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1
  }
}
```

## Managing Your Keys

### Viewing Your API Keys

1. Navigate to **Settings → API Keys**
2. You will see a list of your API keys with:
   - **Name**: Key identifier
   - **Preview**: Masked key (`ak_8a9590a2_87e4...12f5e1e`)
   - **Status**: Active/Inactive
   - **Last Used**: When the key was last accessed
   - **Expires**: Expiration date
   - **Actions**: Rotate, Revoke, Delete

### Key Lifecycle Operations

#### 1. Rotate Key

**When to rotate:**

- Key may have been compromised
- Regular security practice (every 90 days)
- Employee departure who had access
- Security audit requirements

**How to rotate:**

1. Click **Actions → Rotate** for the key
2. Confirm rotation
3. **Save the new key immediately** - old key will be disabled
4. Update your application with the new key

**What happens:**

- New key generated with same permissions and settings
- Old key immediately disabled
- All configurations remain the same (name, permissions, expiry)

#### 2. Revoke Key

**When to revoke:**

- Key confirmed compromised
- Integration no longer needed
- Immediately disable without generating replacement

**How to revoke:**

1. Click **Actions → Revoke** for the key
2. Optionally enter revocation reason
3. Confirm revocation

**What happens:**

- Key immediately disabled
- Status changed to "Inactive"
- Can no longer be used for API requests
- Revocation is permanent (cannot be undone)

#### 3. Delete Key

**When to delete:**

- Key no longer needed
- Clean up old/test keys
- Remove expired keys

**How to delete:**

1. Click **Actions → Delete** for the key
2. Confirm deletion

**What happens:**

- Key permanently removed from database
- Cannot be recovered
- All usage history retained for audit

### Monitoring Key Usage

Check your API keys list regularly for:

- **Last Used At**: Detect unused or abandoned keys
- **Last Used IP**: Identify suspicious access patterns
- **Status Changes**: Ensure all keys are in expected state

**Red Flags**:

- Key never used after creation → May be compromised/leaked
- Key used from unexpected IP addresses → Potential security breach
- Recently created key with no usage → Investigate why

## Security Best Practices

### ✅ DO

1. **Store Keys Securely**

   ```bash
   # ✅ Environment variable
   export API_KEY="ak_8a9590a2_..."

   # ✅ .env file (add to .gitignore!)
   API_KEY=ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
   ```

2. **Use Environment Variables**

   ```javascript
   // ✅ Read from environment
   const apiKey = process.env.API_KEY;
   ```

3. **Set Expiration Dates**
   - Temporary integrations: 7-90 days
   - Regular services: 365 days
   - Review before expiration

4. **Rotate Keys Regularly**
   - Production keys: Every 90 days
   - Development keys: Every 180 days
   - Immediately if compromised

5. **Use Separate Keys per Service**
   - Backend API: One key
   - Mobile app: Another key
   - Data import: Separate key

6. **Monitor Usage**
   - Check last_used_at weekly
   - Review last_used_ip for anomalies
   - Delete unused keys

### ❌ DON'T

1. **Never Commit to Git**

   ```javascript
   // ❌ WRONG - Don't hardcode
   const API_KEY = 'ak_8a9590a2_87e400a2...';

   // ✅ CORRECT - Use environment
   const API_KEY = process.env.API_KEY;
   ```

2. **Never Share via Email/Chat**
   - Use secure sharing tools (1Password, LastPass)
   - Rotate key after sharing if unsure

3. **Never Use Query Parameters** (unless necessary)
   - Keys visible in logs
   - Keys visible in browser history
   - Use headers instead

4. **Never Use Same Key Everywhere**
   - Compromise of one service affects all
   - Create service-specific keys

5. **Never Ignore Expiration**
   - Plan key rotation before expiry
   - Avoid service interruption

## Troubleshooting

### Error: 401 Unauthorized

**Possible Causes:**

1. **Invalid API Key**

   ```json
   {
     "success": false,
     "error": {
       "code": "UNAUTHORIZED",
       "message": "Invalid API key"
     }
   }
   ```

   **Solution**: Verify you copied the full key correctly

2. **Expired API Key**

   ```json
   {
     "success": false,
     "error": {
       "code": "UNAUTHORIZED",
       "message": "API key has expired"
     }
   }
   ```

   **Solution**: Generate a new key or rotate the existing key

3. **Revoked API Key**

   ```json
   {
     "success": false,
     "error": {
       "code": "UNAUTHORIZED",
       "message": "API key is disabled"
     }
   }
   ```

   **Solution**: Key was revoked - generate a new key

### Error: 403 Forbidden

**Possible Causes:**

1. **Insufficient Permissions**

   ```json
   {
     "success": false,
     "error": {
       "code": "FORBIDDEN",
       "message": "Permission denied"
     }
   }
   ```

   **Solution**:
   - Check which permissions your key has
   - Generate new key with required permissions
   - Contact administrator for permission upgrade

2. **Wrong Resource Access**
   - API key for "products" used on "users" endpoint
   - Solution: Use correct key or add permissions

### Request Timeout

**Possible Causes:**

1. **Network Issues**
   - Check internet connection
   - Verify API server is reachable

2. **Server Overload**
   - Wait and retry with exponential backoff
   - Contact support if persistent

### Key Not Working After Generation

**Checklist:**

1. ✅ Copied full key (not just preview)?
2. ✅ No extra spaces at start/end?
3. ✅ Using correct authentication method (header/bearer)?
4. ✅ Correct header name (`x-api-key` not `api-key`)?
5. ✅ Key is Active status?
6. ✅ Key not expired?

### Getting Help

If you still have issues:

1. Check API key status in web interface
2. Try generating a new test key
3. Contact support with:
   - Key preview (first 12 characters: `ak_8a9590a2`)
   - Error message
   - Request method and endpoint
   - Timestamp of failed attempt

---

**Related Documentation**:

- [API Reference](./API_REFERENCE.md) - API endpoint details
- [Developer Guide](./DEVELOPER_GUIDE.md) - Integration guide
- [Security Guide](./SECURITY.md) - Advanced security

**Last Updated**: 2025-10-30
