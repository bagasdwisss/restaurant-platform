const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetProvider = process.argv[2]?.toLowerCase();

if (!targetProvider || !['sqlite', 'postgresql', 'postgres'].includes(targetProvider)) {
  console.log('Usage: node scripts/switch-db.js <sqlite|postgresql>');
  process.exit(1);
}

const providerName = targetProvider === 'postgres' ? 'postgresql' : targetProvider;
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider in datasource db block
content = content.replace(
  /datasource db\s*\{\s*provider\s*=\s*"[^"]+"/m,
  `datasource db {\n  provider = "${providerName}"`
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log(`✅ prisma/schema.prisma updated to provider: "${providerName}"`);

try {
  console.log('Generating Prisma Client...');
  const output = execSync('npx prisma generate', { stdio: 'inherit' });
  console.log(`✨ Successfully generated Prisma Client for ${providerName}!`);
} catch (err) {
  console.error('Failed to generate Prisma client:', err.message);
  process.exit(1);
}
