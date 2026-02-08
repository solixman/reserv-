import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/event-client';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
pool.on('error', (err) => console.error('PostgreSQL Pool Error:', err));

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };