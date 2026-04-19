const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || '';
const pool = new Pool({
  connectionString: rawUrl.split('?')[0], // Use base URL to avoid parameter issues
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin-ECR-2026!', 10);
  
  console.log('Inserting Admin User...');
  const admin = await prisma.user.upsert({
    where: { username: 'admin01' },
    update: { passwordHash: adminPassword },
    create: {
      displayName: 'System Administrator',
      username: 'admin01',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created/updated:', admin.username);

  console.log('Inserting Initial Logs...');
  await prisma.systemLog.createMany({
    data: [
      { category: 'system', level: 'info', message: 'Database seeded with administrator and trial users.' },
      { category: 'moodle', level: 'success', message: 'Moodle connection verified for lms25.e-lsei.com' },
      { category: 'gemini', level: 'warn', message: 'Gemini API reached 80% quota during initial sync' }
    ]
  });
  console.log('Initial logs inserted.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
