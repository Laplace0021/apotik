/*
  Warnings:

  - You are about to drop the column `userId` on the `detailTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "detailTransaction" DROP CONSTRAINT "detailTransaction_userId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "dates" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "detailTransaction" DROP COLUMN "userId";
