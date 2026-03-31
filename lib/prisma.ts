import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Set up the PostgreSQL connection pool with explicit SSL for Neon
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // This ensures Neon accepts the connection
  }
});

// 2. Wrap it in the Prisma adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Pass the adapter into the PrismaClient constructor
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;