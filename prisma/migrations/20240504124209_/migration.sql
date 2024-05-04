-- AlterTable
ALTER TABLE "ball" ALTER COLUMN "texture" SET DEFAULT '/Game/textures/balls/default.jpg';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lose_streak" INTEGER DEFAULT 0,
ADD COLUMN     "win_streak" INTEGER DEFAULT 0;
