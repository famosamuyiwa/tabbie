/*
  Warnings:

  - You are about to drop the column `groupId` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `split` table. All the data in the column will be lost.
  - Added the required column `splitId` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `split` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_groupId_fkey";

-- DropIndex
DROP INDEX "expense_groupId_idx";

-- AlterTable
ALTER TABLE "expense" DROP COLUMN "groupId",
ADD COLUMN     "splitId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "split" DROP COLUMN "total_amount",
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "expense_splitId_idx" ON "expense"("splitId");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "split"("id") ON DELETE CASCADE ON UPDATE CASCADE;
