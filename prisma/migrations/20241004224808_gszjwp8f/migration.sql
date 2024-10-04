/*
  Warnings:

  - You are about to drop the column `amount_paid` on the `user_expenses` table. All the data in the column will be lost.
  - Added the required column `amountPaid` to the `user_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_expenses" DROP COLUMN "amount_paid",
ADD COLUMN     "amountPaid" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "isPaid" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'UNPAID';
