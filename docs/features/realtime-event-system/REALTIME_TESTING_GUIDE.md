# 🧪 Real-time Event System Testing Guide

## 🚀 Multi-Instance Development Setup

### Instance Configuration

- **Instance Name**: aegisx-starter-1
- **API Port**: 3383 (http://localhost:3383)
- **Web Port**: 4249 (http://localhost:4249)
- **Database Port**: 5482
- **Redis Port**: 6430

## 📋 Complete Testing Workflow

### 1. Start Development Servers

```bash
# Start API and Web servers in your Multi-Instance Development setup
pnpm run dev:api   # API will run on port 3383
pnpm run dev:web   # Web will run on port 4249
```

### 2. API Endpoint Testing

Once servers are running, test the real-time API endpoints:

```bash
# Test WebSocket Health
curl -s http://localhost:3383/api/websocket/health | jq '.'

# Test Event Bus Statistics
curl -s http://localhost:3383/api/websocket/stats | jq '.'

# Test Queue Status
curl -s http://localhost:3383/api/websocket/queue-status | jq '.'

# Test Detailed Health Metrics
curl -s http://localhost:3383/api/websocket/health-detailed | jq '.'

# Test Event System Statistics
curl -s http://localhost:3383/api/events/stats | jq '.'
```

### 3. Browser Testing

#### 3.1 Access the Application

1. Open browser and navigate to: **http://localhost:4249**
2. Login to the system with your credentials

#### 3.2 Navigate to Real-time Demo

1. Go to: **http://localhost:4249/realtime-demo**
2. You should see the Real-time Event System Demo page

#### 3.3 Test WebSocket Connection

1. Click **"Connect WebSocket"** button
2. Verify connection status shows "🟢 Connected"
3. Check that Event Bus shows "🟢 Active"

#### 3.4 Test Real-time User Management

1. Switch to the **"User Management"** tab
2. Click **"Add Test User"** to create test users
3. Watch the user list update in real-time
4. Try the following actions:
   - **Toggle user status** (Activate/Deactivate)
   - **Edit user** (coming soon dialog)
   - **Delete user** with confirmation
   - **Search users** using the search box

#### 3.5 Test Event Monitoring

1. Switch to the **"Event Monitor"** tab
2. Perform actions in the User Management tab
3. Watch events appear in real-time:
   - `users.user.created` - When you add test users
   - `users.user.updated` - When you toggle status
   - `users.user.deleted` - When you delete users
4. Test event log features:
   - **Clear Log** button
   - **Export Log** button (downloads JSON file)

#### 3.6 Test Performance Metrics

1. Switch to the **"Performance"** tab
2. Monitor real-time metrics:
   - **Events/sec** - Current event throughput
   - **Avg Latency** - Average event processing time
   - **Total Events** - Cumulative event count
3. Click **"Reset Metrics"** to clear counters

#### 3.7 Test Event Bus Features

1. Click **"Test Event Bus"** to send test events
2. Click **"Simulate Server Event"** to generate mock events
3. Watch events appear in the Event Monitor with different priorities:
   - 🔴 Critical
   - 🟠 High
   - 🔵 Normal
   - ⚪ Low

## 🔧 Advanced Testing Scenarios

### Optimistic Updates Testing

1. **Disconnect from internet** (to simulate network issues)
2. **Add test users** - they should appear immediately in local state
3. **Reconnect to internet** - pending operations should sync automatically
4. **Check Event Monitor** for sync events

### Conflict Resolution Testing

1. **Open the app in two browser tabs**
2. **Connect WebSocket in both tabs**
3. **Edit the same user in both tabs simultaneously**
4. **Watch conflict detection and resolution**

### Connection Recovery Testing

1. **Disconnect WebSocket** using the disconnect button
2. **Perform some user actions** (they should queue up)
3. **Reconnect WebSocket**
4. **Watch queued operations sync**

## ✅ Testing Checklist

### API Health Checks

- [ ] WebSocket health endpoint responds
- [ ] Event Bus statistics available
- [ ] Queue status monitoring works
- [ ] Detailed health metrics accessible
- [ ] Event system statistics tracking

### Frontend Real-time Features

- [ ] WebSocket connection establishes successfully
- [ ] Real-time user list updates automatically
- [ ] Optimistic updates work (immediate UI response)
- [ ] Event monitoring displays live events
- [ ] Performance metrics update in real-time
- [ ] Search functionality works with live data
- [ ] Connection status indicators accurate

### Event System Features

- [ ] Event Bus auto-forwards to WebSocket clients
- [ ] Priority queue management functional
- [ ] Wildcard event subscriptions work
- [ ] Event categorization (feature.entity.action)
- [ ] Bulk operation progress tracking
- [ ] Conflict detection triggers warnings

### Error Handling & Recovery

- [ ] Connection loss handling graceful
- [ ] Retry mechanism for failed operations
- [ ] Conflict resolution options available
- [ ] Queue overflow protection
- [ ] Graceful degradation when offline

## 🛠️ Troubleshooting

### Common Issues

#### WebSocket Won't Connect

- Check if API server is running on port 3383
- Verify authentication token is valid
- Check browser console for connection errors

#### Events Not Appearing

- Ensure WebSocket is connected (green status)
- Check that you're subscribed to the right features
- Verify API endpoints are responding

#### Performance Issues

- Monitor event queue sizes in statistics
- Check Redis connection for multi-instance setup
- Verify memory usage in Performance tab

### Debug Commands

```bash
# Check running processes
ps aux | grep -E "(nx serve|pnpm)" | grep -v grep

# Check port usage
lsof -i :3383  # API port
lsof -i :4249  # Web port

# Check database connection
curl -s http://localhost:3383/health

# Check WebSocket status
curl -s http://localhost:3383/api/websocket/health
```

## 🎯 Expected Results

### Successful Testing Indicators

1. **Green connection status** in UI
2. **Real-time data synchronization** across tabs
3. **Event log populating** with user actions
4. **Performance metrics** updating live
5. **Conflict detection** working when simulated
6. **Optimistic updates** providing immediate feedback

### Performance Benchmarks

- **Event processing**: < 50ms average latency
- **WebSocket connection**: < 2s connection time
- **UI updates**: < 100ms for optimistic updates
- **Sync operations**: < 1s for server sync

---

**🎉 If all tests pass, your real-time event system is working correctly!**
