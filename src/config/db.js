// src/config/db.js
const { PrismaClient } = require('@prisma/client');

// For Prisma 7, you need to pass DATABASE_URL explicitly
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"]
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected via Prisma");
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = { prisma, connectDB, disconnectDB };