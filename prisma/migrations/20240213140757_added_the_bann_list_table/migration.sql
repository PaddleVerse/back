-- CreateTable
CREATE TABLE "ban_list" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "channel_id" INTEGER DEFAULT 0,
    "role" "Role" DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ban_list_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ban_list" ADD CONSTRAINT "ban_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_list" ADD CONSTRAINT "ban_list_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
