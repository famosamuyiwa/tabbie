-- AlterTable
ALTER TABLE "expense" ALTER COLUMN "totalAmount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_expenses" ALTER COLUMN "percentage" SET DATA TYPE TEXT,
ALTER COLUMN "amountPaid" SET DATA TYPE TEXT;
