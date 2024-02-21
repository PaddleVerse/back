/*
  Warnings:

  - You are about to drop the column `twofa` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "twofa",
ADD COLUMN     "twoFa" BOOLEAN DEFAULT false,
ADD COLUMN     "twoFaSecret" TEXT;
