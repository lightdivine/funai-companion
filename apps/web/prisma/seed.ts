import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

// 1. Set up the native PostgreSQL connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true 
});

// 2. Bind it to the Prisma 7 Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Satisfy the constructor requirement by passing the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedStudentPassword = await bcrypt.hash("student123", 10);

  console.log("🌱 Seeding database directly via Prisma 7 Driver Adapter...");

  const admin = await prisma.user.upsert({
    where: { matricNumber: "FUNAI/ADMIN/001" },
    update: {},
    create: {
      matricNumber: "FUNAI/ADMIN/001",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });

  const student = await prisma.user.upsert({
    where: { matricNumber: "FUNAI/STU/2026/0001" },
    update: {},
    create: {
      matricNumber: "FUNAI/STU/2026/0001",
      password: hashedStudentPassword,
      role: "STUDENT",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Clean up the pool connection
  });