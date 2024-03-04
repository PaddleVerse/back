-- CreateEnum
CREATE TYPE "Req" AS ENUM ('RECIVED', 'SEND');

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "request" "Req" DEFAULT 'SEND';
