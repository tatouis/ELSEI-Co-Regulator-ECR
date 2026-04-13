const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });

async function main() {
    const libsql = createClient({
        url: process.env.DATABASE_URL || 'file:./backend/dev.db',
    });
    const adapter = new PrismaLibSql(libsql);
    const prisma = new PrismaClient({ adapter });

    const user = await prisma.user.findUnique({
        where: { username: 'learner01' }
    });

    console.log("User:", user);

    if (user) {
        const passwordMatch = await bcrypt.compare('gED-$b4Y4N$3nE', user.passwordHash);
        console.log("Password match:", passwordMatch);
    }
}

main().catch(console.error);
