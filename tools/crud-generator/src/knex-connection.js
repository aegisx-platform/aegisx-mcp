const knexLib = require('knex');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  // Try multiple paths for .env.local
  const fs = require('fs');
  const envPaths = [
    '../../../.env.local', // from tools/crud-generator/src/
    '../../.env.local', // from tools/crud-generator/
    './.env.local', // from root
    '.env.local', // current directory
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      break;
    }
  }
}

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(
      process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
    ),
    database:
      process.env.POSTGRES_DATABASE || process.env.DATABASE_NAME || 'aegisx_db',
    user: process.env.POSTGRES_USER || process.env.DATABASE_USER || 'postgres',
    password:
      process.env.POSTGRES_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      'postgres',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

let knexInstance = null;

function getKnexConnection() {
  if (!knexInstance) {
    knexInstance = knexLib(config);
  }
  return knexInstance;
}

const knex = getKnexConnection();

module.exports = { knex, getKnexConnection };
