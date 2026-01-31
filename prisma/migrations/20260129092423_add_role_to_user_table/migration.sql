/*
  Warnings:

  - Added the required column `userId` to the `detailTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "detailTransaction" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "detailTransaction" ADD CONSTRAINT "detailTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
