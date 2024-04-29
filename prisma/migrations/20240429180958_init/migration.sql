/*
  Warnings:

  - A unique constraint covering the columns `[color]` on the table `ball` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[color]` on the table `paddle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ball_color_key" ON "ball"("color");

-- CreateIndex
CREATE UNIQUE INDEX "paddle_color_key" ON "paddle"("color");
