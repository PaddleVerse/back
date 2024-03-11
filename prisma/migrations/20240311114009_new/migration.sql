/*
  Warnings:

  - You are about to drop the column `content` on the `notification` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "N_Type" AS ENUM ('MESSAGE', 'REQUEST');

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "content",
ADD COLUMN     "sender_name" TEXT,
ADD COLUMN     "type" "N_Type";
