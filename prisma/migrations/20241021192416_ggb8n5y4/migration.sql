/*
  Warnings:

  - The `percentage` column on the `split` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `percentage` on the `user_expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "split" DROP COLUMN "percentage",
ADD COLUMN     "percentage" DOUBLE PRECISION DEFAULT 0.00;

-- AlterTable
ALTER TABLE "user_expenses" DROP COLUMN "percentage",
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL;
