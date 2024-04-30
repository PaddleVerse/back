/*
  Warnings:

  - You are about to drop the column `user_a_id` on the `game_history` table. All the data in the column will be lost.
  - You are about to drop the column `user_a_score` on the `game_history` table. All the data in the column will be lost.
  - You are about to drop the column `user_b_id` on the `game_history` table. All the data in the column will be lost.
  - You are about to drop the column `user_b_score` on the `game_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "game_history" DROP COLUMN "user_a_id",
DROP COLUMN "user_a_score",
DROP COLUMN "user_b_id",
DROP COLUMN "user_b_score",
ADD COLUMN     "loser" INTEGER DEFAULT 0,
ADD COLUMN     "loser_score" INTEGER DEFAULT 0,
ADD COLUMN     "winner" INTEGER DEFAULT 0,
ADD COLUMN     "winner_score" INTEGER DEFAULT 0,
ALTER COLUMN "start_time" SET DEFAULT CURRENT_TIMESTAMP;
