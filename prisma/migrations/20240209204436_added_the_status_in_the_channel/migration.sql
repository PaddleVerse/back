-- CreateEnum
CREATE TYPE "Appearance" AS ENUM ('protected', 'private', 'public');

-- AlterTable
ALTER TABLE "channel" ADD COLUMN     "key" TEXT,
ADD COLUMN     "state" "Appearance" DEFAULT 'public';
