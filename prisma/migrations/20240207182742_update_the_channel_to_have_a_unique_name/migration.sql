/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `channel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "banner_picture" SET DEFAULT 'https://i.ibb.co/9sV2NJD/samurai-jacket-3840x2160-13683.png';

-- CreateIndex
CREATE UNIQUE INDEX "channel_name_key" ON "channel"("name");
