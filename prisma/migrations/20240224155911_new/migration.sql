-- AlterTable
ALTER TABLE "message" ADD COLUMN     "sender_id" INTEGER,
ALTER COLUMN "channel_id" DROP DEFAULT,
ALTER COLUMN "conversation_id" DROP DEFAULT;
