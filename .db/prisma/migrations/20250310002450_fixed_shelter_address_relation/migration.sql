-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_shelterId_fkey";

-- AddForeignKey
ALTER TABLE "shelter" ADD CONSTRAINT "shelter_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
