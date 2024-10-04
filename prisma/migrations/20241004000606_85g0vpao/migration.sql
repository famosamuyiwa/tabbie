/*
  Warnings:

  - You are about to drop the `OtpLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValidationLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OtpLog";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "ValidationLog";

-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_log" (
    "id" SERIAL NOT NULL,
    "configLength" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lifetime" TIMESTAMP(3) NOT NULL,
    "isDeactivated" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_users" (
    "splitId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "split_users_pkey" PRIMARY KEY ("splitId","userId")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_expenses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "amount_paid" DECIMAL(65,30) NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "receipt" TEXT,
    "isPaid" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_log" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_groupId_idx" ON "expense"("groupId");

-- CreateIndex
CREATE INDEX "expense_createdAt_idx" ON "expense"("createdAt");

-- CreateIndex
CREATE INDEX "friends_userId_idx" ON "friends"("userId");

-- CreateIndex
CREATE INDEX "friends_friendId_idx" ON "friends"("friendId");

-- CreateIndex
CREATE INDEX "friends_createdAt_idx" ON "friends"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "friends_userId_friendId_key" ON "friends"("userId", "friendId");

-- CreateIndex
CREATE INDEX "split_id_idx" ON "split"("id");

-- CreateIndex
CREATE INDEX "split_createdAt_idx" ON "split"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

-- CreateIndex
CREATE INDEX "user_expenses_expenseId_idx" ON "user_expenses"("expenseId");

-- CreateIndex
CREATE INDEX "user_expenses_userId_idx" ON "user_expenses"("userId");

-- CreateIndex
CREATE INDEX "user_expenses_createdAt_idx" ON "user_expenses"("createdAt");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "split"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_users" ADD CONSTRAINT "split_users_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "split"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_users" ADD CONSTRAINT "split_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
