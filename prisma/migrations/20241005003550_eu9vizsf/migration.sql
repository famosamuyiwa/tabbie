-- CreateIndex
CREATE INDEX "split_creatorId_idx" ON "split"("creatorId");

-- CreateIndex
CREATE INDEX "user_expenses_expenseId_userId_idx" ON "user_expenses"("expenseId", "userId");
