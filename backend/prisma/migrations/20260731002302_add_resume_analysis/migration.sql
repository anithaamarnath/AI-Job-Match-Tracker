-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "atsScore" INTEGER,
ADD COLUMN     "detectedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[];
