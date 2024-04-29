-- AlterTable
ALTER TABLE "user" ADD COLUMN     "coins" INTEGER DEFAULT 1000;

-- CreateTable
CREATE TABLE "paddle" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "image" TEXT,
    "color" TEXT,
    "enabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paddle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ball" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "image" TEXT,
    "color" TEXT,
    "enabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ball_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paddle" ADD CONSTRAINT "paddle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball" ADD CONSTRAINT "ball_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
