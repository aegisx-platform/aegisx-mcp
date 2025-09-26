# API Key Caching System - User Guide

## Overview

The API Key Caching System enhances your API experience by providing lightning-fast response times and improved reliability. This guide helps you understand how the caching system affects your daily API usage and how to troubleshoot cache-related issues.

## What You'll Experience

### Performance Improvements

**Faster API Responses**

- First API call: ~50-100ms (database lookup)
- Subsequent calls: <1ms (cache lookup)
- Up to 100x faster response times for repeated operations

**Improved Reliability**

- Reduced database connection errors
- Better performance during high traffic
- Consistent response times

**Enhanced User Experience**

- Instant API key validation
- Faster dashboard loading
- Smoother application performance

## How Caching Affects Your API Usage

### API Key Validation

**First Request (Cache Miss)**

```
Your App → API Gateway → Database → Response (50ms)
                     ↓
               Cache Storage
```

**Subsequent Requests (Cache Hit)**

```
Your App → API Gateway → Cache → Response (<1ms)
```

### Permission Checks

When you use scoped API keys, the system caches permission decisions:

1. **First permission check**: Validates against database and caches result
2. **Repeated checks**: Uses cached permission for same resource/action
3. **Cache duration**: 10 minutes (automatically refreshed)

### API Key Listings

When viewing your API keys in the dashboard:

1. **First load**: Fetches from database and caches list
2. **Subsequent loads**: Uses cached list for instant display
3. **Auto-refresh**: Cache updates when you create/delete keys

## Cache Behavior You Should Know

### Cache Expiration Times

| Data Type              | Cache Duration | Reason                        |
| ---------------------- | -------------- | ----------------------------- |
| **API Key Validation** | 5 minutes      | Security balance              |
| **Permission Checks**  | 10 minutes     | Permissions change less often |
| **Key Listings**       | 30 minutes     | Lists are relatively stable   |
| **Usage Counters**     | 1 minute       | For batching updates          |

### Automatic Cache Updates

The cache automatically refreshes when you:

- Create a new API key
- Delete an existing API key
- Update key permissions or status
- Rotate an API key
- Change your account permissions

### Manual Cache Refresh

In rare cases, you might need to refresh cached data:

1. **Log out and log back in**: Clears all your cached data
2. **Wait for automatic expiration**: Caches refresh every 5-30 minutes
3. **Contact support**: For immediate cache clearing if needed

## Understanding Cache Status

### Dashboard Indicators

**Green indicators**: Data served from cache (fast)

- Response times under 5ms
- Instant page loads
- Smooth interactions

**Yellow indicators**: Cache warming up

- First few requests after login
- New API key first usage
- After permission changes

**Red indicators**: Cache issues (rare)

- Consistently slow responses
- Error messages mentioning cache
- Need to contact support

## Common User Scenarios

### Scenario 1: New API Key Creation

**What Happens:**

1. You create a new API key
2. System stores in database
3. Cache is updated immediately
4. New key is available instantly

**Timeline:**

- Key creation: ~100ms
- First validation: <1ms (pre-cached)
- Subsequent validations: <1ms

### Scenario 2: Permission Changes

**What Happens:**

1. Administrator changes your permissions
2. System invalidates all your cached data
3. Next API call refreshes cache with new permissions
4. All subsequent calls use updated cache

**Timeline:**

- Permission change: Immediate
- Cache invalidation: <1 second
- Next API call: ~50ms (cache refresh)
- Subsequent calls: <1ms

### Scenario 3: High Traffic Usage

**What Happens:**

1. Multiple applications use your API key
2. Cache serves all validation requests
3. Database load remains minimal
4. Consistent performance maintained

**Benefits:**

- No rate limiting due to database load
- Consistent sub-millisecond response times
- Reliable service during traffic spikes

## Troubleshooting Cache Issues

### Slow API Responses

**Symptoms:**

- API calls taking longer than usual
- Dashboard loading slowly
- Inconsistent response times

**Solutions:**

1. **Check cache status**: Look for cache health indicators
2. **Wait for cache warming**: First requests after changes are slower
3. **Clear browser cache**: Sometimes helps with dashboard issues
4. **Contact support**: If issues persist beyond 5 minutes

### Stale Data Issues

**Symptoms:**

- Old API keys still appearing as valid
- Permission changes not reflected
- Usage statistics not updating

**Solutions:**

1. **Wait for automatic refresh**: Caches expire within 5-30 minutes
2. **Log out and back in**: Forces cache refresh
3. **Check recent changes**: Verify changes were saved properly
4. **Contact support**: For immediate cache clearing

### Error Messages

**Common Cache-Related Errors:**

```
"Cache service unavailable"
```

- **Meaning**: Redis cache is temporarily down
- **Impact**: Slower responses (database fallback)
- **Action**: No action needed, system auto-recovers

```
"Cache validation failed"
```

- **Meaning**: Cached data integrity issue
- **Impact**: Single slow request for cache refresh
- **Action**: Retry request, should resolve automatically

```
"Cache memory full"
```

- **Meaning**: Cache storage limit reached
- **Impact**: Temporary slower responses
- **Action**: Contact support for cache management

## Best Practices for Cache-Aware Usage

### Optimize Your API Usage

1. **Reuse API keys**: Don't create new keys unnecessarily
2. **Batch operations**: Group related API calls together
3. **Understand cache timing**: First call after changes is slower
4. **Monitor your usage**: Use dashboard for usage tracking

### Work with Cache Behavior

1. **Expect first-call delays**: After permission changes or new keys
2. **Plan for cache warmup**: High-traffic periods may need warming
3. **Test with real usage patterns**: Cache performs best with realistic load
4. **Monitor response times**: Use cache-aware performance monitoring

### Security Considerations

1. **Cache doesn't reduce security**: Full validation still occurs
2. **Sensitive data not cached**: API key secrets never stored in cache
3. **Automatic expiration**: Security data refreshes every 5 minutes
4. **Immediate invalidation**: Security events clear cache instantly

## Monitoring Your Cache Performance

### Dashboard Metrics

**Response Time Graphs:**

- Green bars: Cache hits (<1ms)
- Yellow bars: Cache misses (50-100ms)
- Red bars: Errors or issues

**Cache Hit Ratio:**

- Target: >90% for optimal performance
- 80-89%: Good performance
- <80%: May indicate configuration issues

**Usage Patterns:**

- Regular patterns: Cache is working well
- Erratic patterns: May indicate cache issues

### API Headers

When making API calls, check response headers:

```
X-Cache-Status: HIT    // Served from cache
X-Cache-Status: MISS   // Served from database
X-Cache-Status: BYPASS // Cache was bypassed
```

### Performance Benchmarking

**Measure your API performance:**

```bash
# Test cache performance
curl -w "@curl-format.txt" -H "Authorization: Bearer your-api-key" \
     https://api.example.com/your-endpoint

# Expected results:
# First call: 50-100ms
# Subsequent calls: <5ms
```

## FAQ

### General Questions

**Q: Will caching affect my API's security?**
A: No. The cache never stores sensitive data like API key secrets. Full security validation still occurs on every request.

**Q: How do I know if my request used the cache?**
A: Check the response headers for `X-Cache-Status` or monitor response times. Cache hits are typically under 1ms.

**Q: What happens if the cache goes down?**
A: The system automatically falls back to database validation. You'll experience slower responses but no service interruption.

### Performance Questions

**Q: Why is my first API call slow after making changes?**
A: The cache needs to refresh after changes. The first call loads fresh data from the database and caches it for subsequent requests.

**Q: Can I pre-warm the cache for better performance?**
A: The system automatically warms the cache for frequently used keys. For special cases, contact support for manual cache warming.

**Q: How long do cached permissions last?**
A: Permission checks are cached for 10 minutes. If permissions change, the cache is invalidated immediately.

### Troubleshooting Questions

**Q: My API key was deleted but still works. Why?**
A: This can happen briefly due to caching. Wait 5 minutes for automatic expiration or contact support for immediate cache clearing.

**Q: I'm seeing inconsistent response times. What's wrong?**
A: This often indicates cache warming or cache miss scenarios. Monitor the pattern - it should stabilize after a few requests.

**Q: Can I disable caching for my API key?**
A: Caching is system-wide for performance. However, you can contact support if you have specific requirements that need special handling.

## Getting Help

### Self-Service Troubleshooting

1. **Check this guide**: Review relevant sections above
2. **Wait and retry**: Many cache issues resolve automatically
3. **Monitor patterns**: Look for consistent issues vs one-time events
4. **Check status page**: Verify no system-wide cache issues

### When to Contact Support

Contact support if you experience:

- Persistent slow responses (>5 minutes)
- Error messages related to caching
- Stale data that doesn't refresh after 30 minutes
- Consistent cache miss rates below 80%

### Information to Provide

When contacting support about cache issues:

- Your API key prefix (first 8 characters)
- Timestamp of the issue
- Error messages (if any)
- Response time measurements
- Whether the issue affects all requests or specific operations

## Related Resources

- **[API Key Management Guide](../api-key-management/USER_GUIDE.md)**: Managing your API keys
- **[Performance Monitoring](../monitoring/USER_GUIDE.md)**: Monitoring API performance
- **[Security Best Practices](../security/USER_GUIDE.md)**: API security guidelines
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)**: Detailed troubleshooting steps
