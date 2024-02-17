-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "googleId" TEXT,
    "fortytwoId" INTEGER,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "picture" TEXT DEFAULT 'https://i.ibb.co/FsdsTYc/s-Instagram-photo-Soulless-Manga-Jujutsu-Kaisen-Artist-syrnrr-CLa5z-N2l-D1-L-JPG.jpg',
    "banner_picture" TEXT DEFAULT 'https://i.postimg.cc/85Y2rRB7/jezael-melgoza-lay-Mb-SJ3-YOE-unsplash.jpg',
    "status" TEXT DEFAULT 'offline',
    "level" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "friendId" INTEGER DEFAULT 0,
    "status" "FriendshipStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER DEFAULT 0,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_history" (
    "id" SERIAL NOT NULL,
    "user_a_id" INTEGER DEFAULT 0,
    "user_b_id" INTEGER DEFAULT 0,
    "user_a_score" INTEGER DEFAULT 0,
    "user_b_score" INTEGER DEFAULT 0,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),

    CONSTRAINT "game_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channle" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER DEFAULT 0,
    "conversation_id" INTEGER DEFAULT 0,
    "content" TEXT,
    "content_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_participant" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "channel_id" INTEGER DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "user_a_id" INTEGER DEFAULT 0,
    "user_b_id" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_fortytwoId_key" ON "user"("fortytwoId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_participant" ADD CONSTRAINT "channel_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_participant" ADD CONSTRAINT "channel_participant_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
