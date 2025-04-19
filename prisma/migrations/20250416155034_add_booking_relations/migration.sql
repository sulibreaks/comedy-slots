/*
  Warnings:

  - You are about to drop the column `userId` on the `Show` table. All the data in the column will be lost.
  - Added the required column `promoterId` to the `Show` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Show" DROP CONSTRAINT "Show_userId_fkey";

-- DropIndex
DROP INDEX "Booking_showId_userId_key";

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "userId",
ADD COLUMN     "promoterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
