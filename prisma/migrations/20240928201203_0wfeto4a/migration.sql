-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "lastLogin" DROP NOT NULL;
