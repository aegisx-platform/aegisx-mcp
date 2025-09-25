#!/usr/bin/env node

/**
 * Batch CRUD Generator for Domain Modules
 * 
 * Updated to use new domain-first structure.
 * 
 * Usage: 
 *   node batch-generate.js [domain]   # Generate specific domain
 *   node batch-generate.js all        # Generate all domains
 *   node batch-generate.js --list     # Show available domains
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Domain configurations for new domain-first structure
const domains = {
  users: {
    domainName: 'users',
    description: 'User management and related functionality',
    routes: ['core', 'profiles', 'preferences', 'activities', 'sessions'],
    withEvents: true
  },
  
  rbac: {
    domainName: 'rbac',
    description: 'Role-based access control system',
    routes: ['roles', 'permissions', 'assignments', 'user-roles'],
    withEvents: true
  },

  files: {
    domainName: 'files',
    description: 'File management and storage',
    routes: ['uploads', 'avatars', 'access-logs'],
    withEvents: true
  },

  settings: {
    domainName: 'settings',
    description: 'Application and system settings',
    routes: ['app', 'system', 'history', 'templates'],
    withEvents: true
  },

  communication: {
    domainName: 'communication',
    description: 'Notifications and messaging system',
    routes: ['notifications', 'preferences', 'email-tokens', 'password-tokens'],
    withEvents: true
  },

  security: {
    domainName: 'security',
    description: 'Security monitoring and audit system',
    routes: ['audit', 'session-events', 'session-activity', 'api-keys'],
    withEvents: false
  }
};

/**
 * Generate domain with new domain-first structure
 */
async function generateDomain(domainName) {
  const domain = domains[domainName];
  if (!domain) {
    console.error(`❌ Unknown domain: ${domainName}`);
    console.log(`Available domains: ${Object.keys(domains).join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Generating ${domainName} domain...`);
  console.log(`📝 Description: ${domain.description}`);
  console.log(`🛣️  Routes: ${domain.routes.join(', ')}`);
  console.log(`📦 With events: ${domain.withEvents ? 'Yes' : 'No'}`);
  console.log();

  try {
    // Build domain generation command
    let cmd = `node index.js domain ${domain.domainName} --routes="${domain.routes.join(',')}" --force`;
    if (domain.withEvents) {
      cmd += ' --with-events';
    }

    console.log(`⚙️  Executing: ${cmd}`);
    console.log();

    // Execute domain generation
    const result = execSync(cmd, { 
      stdio: 'inherit', // Show output in real-time
      cwd: path.resolve(__dirname)
    });

    console.log();
    console.log(`🎉 Domain '${domainName}' generated successfully!`);
    console.log(`📁 Location: ./apps/api/src/modules/${domain.domainName}/`);
    console.log(`🛣️  Generated ${domain.routes.length} routes`);
    
  } catch (error) {
    console.error(`❌ Failed to generate domain '${domainName}':`, error.message);
    process.exit(1);
  }

  console.log();
  console.log(`📝 Next steps:`);
  console.log(`1. Review generated domain in: ./apps/api/src/modules/${domain.domainName}/`);
  console.log(`2. Register domain plugin in main.ts:`);
  console.log(`   import ${domain.domainName}Plugin from './modules/${domain.domainName}';`);
  console.log(`   await app.register(${domain.domainName}Plugin, { prefix: '/api' });`);
  console.log(`3. Update schemas and types based on your database`);
  console.log(`4. Add business logic to services`);
  console.log(`5. Write tests for the domain functionality`);
}

/**
 * Generate all domains
 */
async function generateAll() {
  console.log(`🌟 Generating ALL domains...`);
  console.log(`📊 Total domains: ${Object.keys(domains).length}`);
  console.log();

  for (const domainName of Object.keys(domains)) {
    await generateDomain(domainName);
    console.log(`\n${'='.repeat(50)}\n`);
  }

  console.log(`🎊 All domains generated!`);
}

/**
 * Show available domains
 */
function showDomains() {
  console.log(`📋 Available domains:\n`);
  
  Object.entries(domains).forEach(([name, config]) => {
    console.log(`🏷️  ${name}:`);
    console.log(`   📝 Description: ${config.description}`);
    console.log(`   🛣️  Routes: ${config.routes.join(', ')}`);
    console.log(`   📦 With events: ${config.withEvents ? 'Yes' : 'No'}`);
    console.log(`   📊 Routes count: ${config.routes.length}`);
    console.log();
  });
}

// Main execution
const domain = process.argv[2];

if (!domain || domain === '--help' || domain === '-h') {
  console.log(`🛠️  Batch CRUD Generator for Domain Modules\n`);
  console.log(`Usage:`);
  console.log(`  node batch-generate.js [domain]     # Generate specific domain`);
  console.log(`  node batch-generate.js all          # Generate all domains`);
  console.log(`  node batch-generate.js --list       # Show available domains`);
  console.log(`  node batch-generate.js --help       # Show this help\n`);
  console.log(`Examples:`);
  console.log(`  node batch-generate.js users        # Generate users domain with all routes`);
  console.log(`  node batch-generate.js rbac         # Generate RBAC domain`);
  console.log(`  node batch-generate.js all          # Generate all 6 domains\n`);
  showDomains();
} else if (domain === '--list') {
  showDomains();
} else if (domain === 'all') {
  generateAll().catch(console.error);
} else {
  generateDomain(domain).catch(console.error);
}