/*
  Warnings:

  - The values [ACTIVE] on the enum `ElectionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `electionId` on table `Candidate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ElectionStatus_new" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');
ALTER TABLE "public"."Election" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Election" ALTER COLUMN "status" TYPE "ElectionStatus_new" USING ("status"::text::"ElectionStatus_new");
ALTER TYPE "ElectionStatus" RENAME TO "ElectionStatus_old";
ALTER TYPE "ElectionStatus_new" RENAME TO "ElectionStatus";
DROP TYPE "public"."ElectionStatus_old";
ALTER TABLE "Election" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "electionId" SET NOT NULL;
