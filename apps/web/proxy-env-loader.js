const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env and .env.local files
 * Used by proxy.conf.js to configure API target dynamically
 */
function loadEnvConfig() {
  const env = {};

  // Get project root (2 levels up from apps/web)
  const projectRoot = path.resolve(__dirname, '../..');
  console.log(`📁 Project root: ${projectRoot}`);

  // Load .env first (base configuration)
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    parseEnvFile(envContent, env);
    console.log(`📄 Loaded base config from: ${envPath}`);
  }

  // Load .env.local (instance-specific overrides)
  const envLocalPath = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    parseEnvFile(envContent, env);
    console.log(`📄 Loaded instance config from: ${envLocalPath}`);
  } else {
    console.log(
      `⚠️  No .env.local found. Run './scripts/setup-env.sh' to generate instance config.`,
    );
  }

  return env;
}

/**
 * Parse environment file content and extract key=value pairs
 */
function parseEnvFile(content, env) {
  const lines = content.split('\n');

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      continue;
    }

    // Extract key=value pairs
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  }
}

module.exports = { loadEnvConfig };

// Test when run directly
if (require.main === module) {
  console.log('🧪 Testing proxy environment loader...');
  const env = loadEnvConfig();
  console.log('Loaded environment variables:');
  console.log(JSON.stringify(env, null, 2));
}
