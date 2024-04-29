-- CreateTable
CREATE TABLE "table" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER DEFAULT 0,
    "image" TEXT,
    "color" TEXT,
    "enabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "table_color_key" ON "table"("color");

-- AddForeignKey
ALTER TABLE "table" ADD CONSTRAINT "table_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
