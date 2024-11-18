-- AlterTable
ALTER TABLE "user_expenses" ALTER COLUMN "amountPaid" DROP NOT NULL,
ALTER COLUMN "amountPaid" SET DEFAULT '0';
