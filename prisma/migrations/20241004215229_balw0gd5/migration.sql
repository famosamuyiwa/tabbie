/*
  Warnings:

  - Added the required column `creatorId` to the `split` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "split" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "split" ADD CONSTRAINT "split_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
