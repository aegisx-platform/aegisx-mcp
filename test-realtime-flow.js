#!/usr/bin/env node

/**
 * Real-time CRUD Flow Test Script
 * Tests the complete real-time event system from API to frontend
 */

const https = require('https');
const WebSocket = require('ws');

// Configuration
const API_BASE_URL = 'http://localhost:3333';
const WS_URL = 'ws://localhost:3333';

class RealTimeFlowTester {
  constructor() {
    this.authToken = null;
    this.ws = null;
    this.receivedEvents = [];
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting Real-time CRUD Flow Tests\n');
    
    try {
      // Step 1: Authentication
      await this.authenticateUser();
      
      // Step 2: Connect WebSocket
      await this.connectWebSocket();
      
      // Step 3: Subscribe to events
      await this.subscribeToEvents();
      
      // Step 4: Test CRUD operations with real-time verification
      await this.testCreateUser();
      await this.testUpdateUser();
      await this.testDeleteUser();
      
      // Step 5: Generate test results
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    } finally {
      this.cleanup();
    }
  }

  async authenticateUser() {
    console.log('🔐 Authenticating user...');
    
    try {
      const response = await this.makeRequest('POST', '/api/auth/register', {
        email: `testuser_${Date.now()}@example.com`,
        username: `testuser_${Date.now()}`,
        password: 'password123',
        firstName: 'RealTime',
        lastName: 'Test'
      });
      
      if (response.success && response.data.accessToken) {
        this.authToken = response.data.accessToken;
        console.log('✅ Authentication successful');
        this.testResults.push({ test: 'Authentication', status: 'PASS', details: 'JWT token obtained' });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      this.testResults.push({ test: 'Authentication', status: 'FAIL', details: error.message });
      throw error;
    }
  }

  async connectWebSocket() {
    console.log('🔌 Connecting to WebSocket...');
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${WS_URL}/socket.io/?EIO=4&transport=websocket`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      this.ws.on('open', () => {
        console.log('✅ WebSocket connected');
        this.testResults.push({ test: 'WebSocket Connection', status: 'PASS', details: 'Successfully connected' });
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket connection failed:', error.message);
        this.testResults.push({ test: 'WebSocket Connection', status: 'FAIL', details: error.message });
        reject(error);
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.receivedEvents.push({
            timestamp: new Date(),
            event: message
          });
          console.log('📨 Received WebSocket event:', message);
        } catch (e) {
          // Ignore non-JSON messages (like ping/pong)
        }
      });

      setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);
    });
  }

  async subscribeToEvents() {
    console.log('📡 Subscribing to user events...');
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe:features',
        data: { features: ['users'] }
      }));
      
      console.log('✅ Subscribed to events');
      this.testResults.push({ test: 'Event Subscription', status: 'PASS', details: 'Subscribed to users feature' });
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  async testCreateUser() {
    console.log('\n👤 Testing User Creation...');
    
    const userData = {
      email: `created_user_${Date.now()}@example.com`,
      username: `created_user_${Date.now()}`,
      password: 'password123',
      firstName: 'Created',
      lastName: 'User'
    };

    try {
      const startTime = Date.now();
      
      // Clear previous events
      this.receivedEvents = [];
      
      // Create user via API
      const response = await this.makeRequest('POST', '/api/users', userData);
      
      if (response.success) {
        const userId = response.data.id;
        console.log(`✅ User created with ID: ${userId}`);
        
        // Wait for WebSocket event
        const event = await this.waitForEvent('users.user.created', 5000);
        
        if (event) {
          const latency = Date.now() - startTime;
          console.log(`✅ Real-time event received (${latency}ms latency)`);
          this.testResults.push({ 
            test: 'User Creation + Real-time Event', 
            status: 'PASS', 
            details: `User created and event received in ${latency}ms` 
          });
        } else {
          console.log('❌ Real-time event not received');
          this.testResults.push({ 
            test: 'User Creation + Real-time Event', 
            status: 'FAIL', 
            details: 'Event not received within timeout' 
          });
        }
        
        return userId;
      } else {
        throw new Error('User creation failed');
      }
    } catch (error) {
      console.error('❌ User creation test failed:', error.message);
      this.testResults.push({ 
        test: 'User Creation + Real-time Event', 
        status: 'FAIL', 
        details: error.message 
      });
      throw error;
    }
  }

  async testUpdateUser() {
    console.log('\n✏️ Testing User Update...');
    
    try {
      // First create a user to update
      const createResponse = await this.makeRequest('POST', '/api/users', {
        email: `update_test_${Date.now()}@example.com`,
        username: `update_test_${Date.now()}`,
        password: 'password123',
        firstName: 'Update',
        lastName: 'Test'
      });
      
      if (!createResponse.success) {
        throw new Error('Failed to create user for update test');
      }
      
      const userId = createResponse.data.id;
      const startTime = Date.now();
      
      // Clear previous events
      this.receivedEvents = [];
      
      // Update user
      const updateResponse = await this.makeRequest('PUT', `/api/users/${userId}`, {
        firstName: 'Updated',
        lastName: 'User'
      });
      
      if (updateResponse.success) {
        console.log(`✅ User updated: ${userId}`);
        
        // Wait for WebSocket event
        const event = await this.waitForEvent('users.user.updated', 5000);
        
        if (event) {
          const latency = Date.now() - startTime;
          console.log(`✅ Real-time update event received (${latency}ms latency)`);
          this.testResults.push({ 
            test: 'User Update + Real-time Event', 
            status: 'PASS', 
            details: `User updated and event received in ${latency}ms` 
          });
        } else {
          console.log('❌ Real-time update event not received');
          this.testResults.push({ 
            test: 'User Update + Real-time Event', 
            status: 'FAIL', 
            details: 'Update event not received within timeout' 
          });
        }
      } else {
        throw new Error('User update failed');
      }
    } catch (error) {
      console.error('❌ User update test failed:', error.message);
      this.testResults.push({ 
        test: 'User Update + Real-time Event', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testDeleteUser() {
    console.log('\n🗑️ Testing User Deletion...');
    
    try {
      // First create a user to delete
      const createResponse = await this.makeRequest('POST', '/api/users', {
        email: `delete_test_${Date.now()}@example.com`,
        username: `delete_test_${Date.now()}`,
        password: 'password123',
        firstName: 'Delete',
        lastName: 'Test'
      });
      
      if (!createResponse.success) {
        throw new Error('Failed to create user for delete test');
      }
      
      const userId = createResponse.data.id;
      const startTime = Date.now();
      
      // Clear previous events
      this.receivedEvents = [];
      
      // Delete user
      const deleteResponse = await this.makeRequest('DELETE', `/api/users/${userId}`);
      
      if (deleteResponse.success) {
        console.log(`✅ User deleted: ${userId}`);
        
        // Wait for WebSocket event
        const event = await this.waitForEvent('users.user.deleted', 5000);
        
        if (event) {
          const latency = Date.now() - startTime;
          console.log(`✅ Real-time delete event received (${latency}ms latency)`);
          this.testResults.push({ 
            test: 'User Deletion + Real-time Event', 
            status: 'PASS', 
            details: `User deleted and event received in ${latency}ms` 
          });
        } else {
          console.log('❌ Real-time delete event not received');
          this.testResults.push({ 
            test: 'User Deletion + Real-time Event', 
            status: 'FAIL', 
            details: 'Delete event not received within timeout' 
          });
        }
      } else {
        throw new Error('User deletion failed');
      }
    } catch (error) {
      console.error('❌ User deletion test failed:', error.message);
      this.testResults.push({ 
        test: 'User Deletion + Real-time Event', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async waitForEvent(eventPattern, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkForEvent = () => {
        const event = this.receivedEvents.find(e => {
          const eventName = `${e.event?.feature}.${e.event?.entity}.${e.event?.action}`;
          return eventName === eventPattern;
        });
        
        if (event) {
          resolve(event);
        } else if (Date.now() - startTime > timeout) {
          resolve(null);
        } else {
          setTimeout(checkForEvent, 100);
        }
      };
      
      checkForEvent();
    });
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, API_BASE_URL);
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        }
      };

      const req = require(url.protocol === 'https:' ? 'https' : 'http').request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=' * 50);
    
    let passCount = 0;
    let failCount = 0;
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.details}`);
      
      if (result.status === 'PASS') passCount++;
      else failCount++;
    });
    
    console.log('\n📈 OVERALL RESULTS:');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Success Rate: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
    
    console.log('\n📨 EVENTS RECEIVED:');
    this.receivedEvents.forEach((event, index) => {
      console.log(`${index + 1}. [${event.timestamp.toISOString()}] ${JSON.stringify(event.event)}`);
    });
    
    if (passCount === this.testResults.length) {
      console.log('\n🎉 ALL TESTS PASSED! Real-time system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the system configuration.');
    }
  }

  cleanup() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new RealTimeFlowTester();
  tester.runTests().catch(console.error);
}

module.exports = RealTimeFlowTester;