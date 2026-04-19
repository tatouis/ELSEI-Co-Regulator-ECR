const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    let databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.error("Error: DATABASE_URL not found in .env.local");
        process.exit(1);
    }

    // Replace sslmode=require while preserving other URL parameters
    databaseUrl = databaseUrl.replace('?sslmode=require&', '?').replace('?sslmode=require', '').replace('&sslmode=require', '');

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log("Updating tutor_ecr...");

    try {
        const user = await prisma.user.update({
            where: { username: 'tutor_ecr' },
            data: {
                moodleUrl: 'https://lms25.e-lsei.com',
                moodleToken: '435af4165f459ef07232a8608ddd9647'
            }
        });

        console.log("Successfully updated:", user.username);
        console.log("Moodle URL:", user.moodleUrl);
        console.log("Moodle Token:", user.moodleToken ? '****' + user.moodleToken.slice(-4) : 'null');
    } catch (error) {
        console.error("Error updating user:", error.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
