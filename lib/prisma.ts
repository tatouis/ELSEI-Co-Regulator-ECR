import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '';
// Remove strict SSL mode from the URL so our manual rejectUnauthorized takes precedence
rawUrl = rawUrl.replace('?sslmode=require', '').replace('&sslmode=require', '');

const pool = new Pool({
    connectionString: rawUrl,
    ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
