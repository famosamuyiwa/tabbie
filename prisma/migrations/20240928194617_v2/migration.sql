/*
  Warnings:

  - You are about to drop the `OTPLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OTPLog";

-- CreateTable
CREATE TABLE "OtpLog" (
    "id" SERIAL NOT NULL,
    "configLength" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lifetime" TIMESTAMP(3) NOT NULL,
    "isDeactivated" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpLog_pkey" PRIMARY KEY ("id")
);
