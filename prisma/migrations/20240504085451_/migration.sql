/*
  Warnings:

  - You are about to drop the column `skin_url` on the `ball` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ball" DROP COLUMN "skin_url",
ADD COLUMN     "texture" TEXT DEFAULT '/Game/textures/ball.jpg';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "xp" INTEGER DEFAULT 0,
ALTER COLUMN "level" SET DEFAULT 1;
