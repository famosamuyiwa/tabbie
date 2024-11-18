/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "password";

-- CreateTable
CREATE TABLE "UserAuth" (
    "userId" INTEGER NOT NULL,
    "password" TEXT,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
