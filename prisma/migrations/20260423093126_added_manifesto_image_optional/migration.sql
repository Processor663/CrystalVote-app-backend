-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "manifesto" TEXT,
ALTER COLUMN "image" DROP NOT NULL;
