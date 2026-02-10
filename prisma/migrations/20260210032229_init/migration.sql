/*
  Warnings:

  - You are about to drop the column `brand` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "brand",
DROP COLUMN "imageUrl",
DROP COLUMN "price",
DROP COLUMN "size",
ADD COLUMN     "image" TEXT;
