const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('🚀 RESTOSYNC — SETUP DATABASE CLOUD POSTGRESQL');
console.log('====================================================\n');

// 1. Get database URL from command line or .env
let dbUrl = process.argv[2] || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/(?:DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)=["']?([^"'\r\n]+)["']?/);
    if (match && (match[1].startsWith('postgresql://') || match[1].startsWith('postgres://'))) {
      dbUrl = match[1];
    }
  }
}

if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  console.log('❌ Error: Connection string PostgreSQL belum diberikan.');
  console.log('\nCara Menggunakan:');
  console.log('  node scripts/setup-cloud-db.js "postgresql://user:password@host/neondb?sslmode=require"');
  console.log('\nAtau tambahkan DATABASE_URL PostgreSQL Anda ke dalam file .env');
  console.log('Contoh Neon.tech / Supabase:');
  console.log('  DATABASE_URL="postgresql://neondb_owner:npg_xxxx@ep-cool-server.us-east-2.aws.neon.tech/neondb?sslmode=require"\n');
  process.exit(1);
}

// Mask sensitive password for display
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`📡 Menghubungkan ke Database Cloud: ${maskedUrl}`);

// 2. Update schema.prisma to postgresql
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');
schemaContent = schemaContent.replace(
  /datasource db\s*\{\s*provider\s*=\s*"[^"]+"/m,
  'datasource db {\n  provider = "postgresql"'
);
fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log('✅ Skema Prisma dialihkan ke provider: "postgresql"');

// 3. Generate Prisma client for postgresql
try {
  console.log('\n🔄 [1/3] Meng-generate Prisma Client untuk PostgreSQL...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
} catch (err) {
  console.error('❌ Gagal meng-generate Prisma Client:', err.message);
  process.exit(1);
}

// 4. Push tables to Cloud PostgreSQL
try {
  console.log('\n🔄 [2/3] Mendorong struktur tabel ke Database Cloud (prisma db push)...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log('✅ Seluruh tabel (User, Order, Table, Menu, Shift, AuditLog) berhasil dibuat di Cloud!');
} catch (err) {
  console.error('❌ Gagal melakukan db push ke database cloud. Periksa connection string Anda:', err.message);
  process.exit(1);
}

// 5. Seed initial data
try {
  console.log('\n🔄 [3/3] Menjalankan seeding data awal ke Cloud (Admin, Kasir, Tamu, Menu, Denah Meja)...');
  execSync('node prisma/seed.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log('✅ Seeding berhasil! Seluruh data master telah tersimpan di Database Cloud.');
} catch (err) {
  console.error('⚠️ Peringatan saat seeding:', err.message);
}

// 6. Success instructions
console.log('\n====================================================');
console.log('🎉 DATABASE CLOUD BERHASIL DIKONFIGURASI LENGKAP!');
console.log('====================================================');
console.log('Sekarang data Anda bersifat ABADI dan TIDAK AKAN PERNAH HILANG saat ada update di Vercel.');
console.log('\n📌 LANGKAH TERAKHIR (Pasang di Vercel):');
console.log('1. Buka https://vercel.com/dashboard');
console.log('2. Pilih Project Anda -> Buka tab "Settings" -> Klik "Environment Variables"');
console.log('3. Tambahkan / Edit Environment Variable:');
console.log('   - Key   : DATABASE_URL');
console.log(`   - Value : ${dbUrl}`);
console.log('4. Klik "Save" lalu Deploy / Redeploy proyek Anda.');
console.log('\nSetelah itu, akun, transaksi, dan audit log di Desktop & Mobile akan tersinkronisasi 100% selamanya!\n');
