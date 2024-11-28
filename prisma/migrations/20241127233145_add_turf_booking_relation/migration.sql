/*
  Warnings:

  - You are about to drop the column `businessId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turfId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sport` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turfId` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('TENNIS', 'FOOTBALL', 'BADMINTON', 'BASKETBALL');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Court" DROP CONSTRAINT "Court_businessId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "businessId",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "turfId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "businessId",
DROP COLUMN "description",
ADD COLUMN     "isTemporarilyClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sport" "Sport" NOT NULL,
ADD COLUMN     "turfId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Business";

-- CreateTable
CREATE TABLE "Turf" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isTemporarilyClosed" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timing" (
    "id" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "Timing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Turf" ADD CONSTRAINT "Turf_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "Turf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timing" ADD CONSTRAINT "Timing_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "Turf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
