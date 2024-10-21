/*
  Warnings:

  - Changed the type of `category` on the `split` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "split" DROP COLUMN "category",
ADD COLUMN     "category" INTEGER NOT NULL;
