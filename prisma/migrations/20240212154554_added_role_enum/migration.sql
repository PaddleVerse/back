/*
  Warnings:

  - The `role` column on the `channel_participant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MOD', 'MEMBER');

-- AlterTable
ALTER TABLE "channel_participant" DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT 'MEMBER';
