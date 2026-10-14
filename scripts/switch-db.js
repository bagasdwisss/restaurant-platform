const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env if not already loaded in environment
let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/(?:DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)=["']?([^"'\r\n]+)["']?/);
    if (match) dbUrl = match[1];
  }
}
if (dbUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

let targetProvider = process.argv[2]?.toLowerCase();

if (!targetProvider || targetProvider === 'auto') {
  if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
    targetProvider = 'postgresql';
    console.log('🔍 Detected PostgreSQL database URL.');
  } else {
    targetProvider = 'sqlite';
    console.log('🔍 Detected SQLite / Local file database URL.');
  }
}

if (!['sqlite', 'postgresql', 'postgres'].includes(targetProvider)) {
  console.log('Usage: node scripts/switch-db.js <sqlite|postgresql|auto>');
  process.exit(1);
}

const providerName = targetProvider === 'postgres' ? 'postgresql' : targetProvider;
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

let content = fs.readFileSync(schemaPath, 'utf8');
const matchProvider = content.match(/datasource db\s*\{\s*provider\s*=\s*"([^"]+)"/m);
const currentProvider = matchProvider ? matchProvider[1] : null;

if (currentProvider !== providerName) {
  content = content.replace(
    /datasource db\s*\{\s*provider\s*=\s*"[^"]+"/m,
    `datasource db {\n  provider = "${providerName}"`
  );
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log(`✅ prisma/schema.prisma updated to provider: "${providerName}"`);

  try {
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log(`✨ Successfully generated Prisma Client for ${providerName}!`);
  } catch (err) {
    console.error('Failed to generate Prisma client:', err.message);
    process.exit(1);
  }
} else {
  console.log(`ℹ️ prisma/schema.prisma is already configured for provider: "${providerName}". Skipping re-generation.`);
}
