-- AlterTable
ALTER TABLE "game_history" ADD COLUMN     "loser_streak" INTEGER DEFAULT 0,
ADD COLUMN     "winner_streak" INTEGER DEFAULT 0;
