#!/usr/bin/env node

/**
 * Enhanced Health check script for AegisX API Docker container
 * Performs comprehensive health validation with retry logic
 */

const http = require('http');
const fs = require('fs');

const config = {
  port: process.env.PORT || 3333,
  host: 'localhost',
  timeout: 5000,
  retries: 3,
  healthPath: '/health/live',
};

/**
 * Performs HTTP health check on the application
 */
async function performHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: config.host,
        port: config.port,
        path: config.healthPath,
        method: 'GET',
        timeout: config.timeout,
        headers: {
          'User-Agent': 'Docker-Health-Check/1.0',
        },
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              if (response.status === 'healthy' || response.success === true) {
                resolve({
                  success: true,
                  statusCode: res.statusCode,
                  response: response,
                });
              } else {
                reject(
                  new Error(`Health check failed: ${JSON.stringify(response)}`),
                );
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          } catch (parseError) {
            reject(
              new Error(`Failed to parse response: ${parseError.message}`),
            );
          }
        });
      },
    );

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Health check timed out after ${config.timeout}ms`));
    });

    req.end();
  });
}

/**
 * Checks if required files exist
 */
function checkRequiredFiles() {
  const requiredFiles = ['main.js'];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
}

/**
 * Main health check function with retry logic
 */
async function healthCheck() {
  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      // Perform basic system checks
      checkRequiredFiles();

      // Perform HTTP health check
      const healthResult = await performHealthCheck();

      // Log success in production format
      if (process.env.NODE_ENV === 'production') {
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            status: 'healthy',
            attempt: attempt,
            pid: process.pid,
          }),
        );
      } else {
        console.log('✅ Health check passed');
      }

      process.exit(0);
    } catch (error) {
      lastError = error;

      if (process.env.NODE_ENV === 'production') {
        console.error(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            status: 'unhealthy',
            attempt: attempt,
            error: error.message,
            pid: process.pid,
          }),
        );
      } else {
        console.error(
          `❌ Health check failed (attempt ${attempt}): ${error.message}`,
        );
      }

      // Wait before retry (except on last attempt)
      if (attempt < config.retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // All attempts failed
  if (process.env.NODE_ENV === 'production') {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'failed',
        attempts: config.retries,
        finalError: lastError?.message || 'Unknown error',
        pid: process.pid,
      }),
    );
  } else {
    console.error(
      `💀 Health check failed after ${config.retries} attempts: ${lastError?.message}`,
    );
  }

  process.exit(1);
}

// Handle process signals gracefully
process.on('SIGTERM', () => process.exit(143));
process.on('SIGINT', () => process.exit(130));

// Ensure we don't run indefinitely
setTimeout(() => {
  console.error('Health check timed out completely');
  process.exit(1);
}, config.timeout * 2);

// Execute health check
if (require.main === module) {
  healthCheck().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
