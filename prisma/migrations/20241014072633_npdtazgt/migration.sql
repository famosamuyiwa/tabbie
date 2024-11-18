/*
  Warnings:

  - A unique constraint covering the columns `[splitId]` on the table `expense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "expense_splitId_key" ON "expense"("splitId");
