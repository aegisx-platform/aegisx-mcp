/**
 * AegisX CLI License Validator
 * Validates license keys for premium features
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// License key format: AEGISX-[TIER]-[SERIAL]-[CHECKSUM]
// Example: AEGISX-PRO-A7X9K2M4-5C

const TIERS = {
  PRO: {
    name: 'Professional',
    developers: 1,
    features: ['generate', 'shell', 'templates', 'config'],
  },
  TEAM: {
    name: 'Team',
    developers: 10,
    features: ['generate', 'shell', 'templates', 'config', 'priority-support'],
  },
  ENT: {
    name: 'Enterprise',
    developers: -1, // unlimited
    features: [
      'generate',
      'shell',
      'templates',
      'config',
      'priority-support',
      'custom-templates',
    ],
  },
  TRIAL: {
    name: 'Trial',
    developers: 1,
    features: ['generate', 'shell'], // limited features
    expiresInDays: 14,
  },
};

// License file location
const LICENSE_FILE = path.join(os.homedir(), '.aegisx-license');
const LICENSE_ENV = 'AEGISX_LICENSE_KEY';

/**
 * Calculate checksum for license key validation
 */
function calculateChecksum(serial) {
  const hash = crypto.createHash('md5').update(serial).digest('hex');
  return hash.substring(0, 2).toUpperCase();
}

/**
 * Parse license key into components
 */
function parseLicenseKey(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  const parts = key.trim().toUpperCase().split('-');

  if (parts.length !== 4 || parts[0] !== 'AEGISX') {
    return null;
  }

  const [prefix, tier, serial, checksum] = parts;

  if (!TIERS[tier]) {
    return null;
  }

  return { prefix, tier, serial, checksum };
}

/**
 * Validate license key format and checksum
 */
function validateKeyFormat(key) {
  const parsed = parseLicenseKey(key);

  if (!parsed) {
    return { valid: false, error: 'Invalid license key format' };
  }

  const expectedChecksum = calculateChecksum(parsed.serial);

  if (parsed.checksum !== expectedChecksum) {
    return { valid: false, error: 'Invalid license key checksum' };
  }

  return { valid: true, parsed };
}

/**
 * Read stored license key
 */
function readStoredLicense() {
  // 1. Check environment variable first
  if (process.env[LICENSE_ENV]) {
    return process.env[LICENSE_ENV];
  }

  // 2. Check license file
  try {
    if (fs.existsSync(LICENSE_FILE)) {
      const content = fs.readFileSync(LICENSE_FILE, 'utf8');
      return content.trim();
    }
  } catch (error) {
    // Ignore read errors
  }

  return null;
}

/**
 * Store license key
 */
function storeLicense(key) {
  try {
    fs.writeFileSync(LICENSE_FILE, key.trim(), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove stored license
 */
function removeLicense() {
  try {
    if (fs.existsSync(LICENSE_FILE)) {
      fs.unlinkSync(LICENSE_FILE);
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get license info
 */
function getLicenseInfo(key) {
  const validation = validateKeyFormat(key);

  if (!validation.valid) {
    return { valid: false, error: validation.error };
  }

  const { tier, serial } = validation.parsed;
  const tierInfo = TIERS[tier];

  const info = {
    valid: true,
    tier: tier,
    tierName: tierInfo.name,
    developers: tierInfo.developers,
    features: tierInfo.features,
    serial: serial,
    activatedAt: new Date().toISOString(),
  };

  // Handle trial expiration
  if (tier === 'TRIAL' && tierInfo.expiresInDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + tierInfo.expiresInDays);
    info.expiresAt = expiresAt.toISOString();
    info.daysRemaining = tierInfo.expiresInDays;
  }

  return info;
}

/**
 * Validate current license
 */
async function validateLicense() {
  const key = readStoredLicense();

  if (!key) {
    return {
      valid: false,
      error: 'No license key found',
      message: 'Please activate your license with: aegisx activate <key>',
    };
  }

  const info = getLicenseInfo(key);

  if (!info.valid) {
    return info;
  }

  // Check trial expiration
  if (info.tier === 'TRIAL' && info.expiresAt) {
    if (new Date(info.expiresAt) < new Date()) {
      return {
        valid: false,
        error: 'Trial license expired',
        message: 'Please purchase a license at https://aegisx.dev',
      };
    }
  }

  return info;
}

/**
 * Check if feature is available for current license
 */
async function checkFeature(featureName) {
  const license = await validateLicense();

  if (!license.valid) {
    return { allowed: false, ...license };
  }

  if (license.features.includes(featureName)) {
    return { allowed: true, license };
  }

  return {
    allowed: false,
    error: `Feature '${featureName}' not available in ${license.tierName} license`,
    message: 'Upgrade to Team or Enterprise for this feature',
  };
}

/**
 * Generate a trial license key (for development/demo)
 */
function generateTrialKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let serial = '';
  for (let i = 0; i < 8; i++) {
    serial += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const checksum = calculateChecksum(serial);
  return `AEGISX-TRIAL-${serial}-${checksum}`;
}

/**
 * Display license status
 */
async function displayLicenseStatus() {
  const license = await validateLicense();

  if (!license.valid) {
    console.log('\n🔐 License Status: Not Activated');
    console.log(`   Error: ${license.error}`);
    console.log(`   ${license.message || ''}`);
    console.log('\n   Purchase at: https://aegisx.dev\n');
    return false;
  }

  console.log('\n🔐 License Status: Active');
  console.log(`   Tier: ${license.tierName}`);
  console.log(
    `   Developers: ${license.developers === -1 ? 'Unlimited' : license.developers}`,
  );
  console.log(`   Features: ${license.features.join(', ')}`);

  if (license.expiresAt) {
    console.log(`   Expires: ${license.expiresAt}`);
    console.log(`   Days Remaining: ${license.daysRemaining}`);
  }

  console.log('');
  return true;
}

module.exports = {
  validateLicense,
  validateKeyFormat,
  getLicenseInfo,
  readStoredLicense,
  storeLicense,
  removeLicense,
  checkFeature,
  generateTrialKey,
  displayLicenseStatus,
  TIERS,
  LICENSE_FILE,
  LICENSE_ENV,
};
