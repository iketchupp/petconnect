/*
  Warnings:

  - You are about to drop the column `address_id` on the `shelter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shelterId]` on the table `address` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "shelter" DROP CONSTRAINT "shelter_address_id_fkey";

-- AlterTable
ALTER TABLE "shelter" DROP COLUMN "address_id";

-- CreateIndex
CREATE UNIQUE INDEX "address_shelterId_key" ON "address"("shelterId");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
