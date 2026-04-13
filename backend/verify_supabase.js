const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
// Since we run this from 'backend/' folder
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function checkUsers() {
    console.log("Connecting to:", process.env.DATABASE_URL);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                role: true,
                displayName: true
            }
        });
        
        console.log("Users in Database:");
        console.table(users);
        
        const tutor = await prisma.user.findUnique({ where: { username: 'tutor_ecr' } });
        if (tutor) {
            const match = await bcrypt.compare('ECRtest2026!', tutor.passwordHash);
            console.log(`\nPassword check for 'tutor_ecr': ${match ? '✅ MATCH' : '❌ FAIL'}`);
        } else {
            console.log("\n❌ User 'tutor_ecr' NOT FOUND");
        }
    } catch (e) {
        console.error("Connection Error:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

checkUsers();
