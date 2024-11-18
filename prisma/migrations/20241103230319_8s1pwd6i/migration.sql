/*
  Warnings:

  - The `amountPaid` column on the `user_expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amountOwed` column on the `user_expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `totalAmount` on the `expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalAmount` on the `split` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "expense" DROP COLUMN "totalAmount",
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "split" DROP COLUMN "totalAmount",
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "user_expenses" DROP COLUMN "amountPaid",
ADD COLUMN     "amountPaid" DOUBLE PRECISION DEFAULT 0.00,
DROP COLUMN "amountOwed",
ADD COLUMN     "amountOwed" DOUBLE PRECISION NOT NULL DEFAULT 0.00;
