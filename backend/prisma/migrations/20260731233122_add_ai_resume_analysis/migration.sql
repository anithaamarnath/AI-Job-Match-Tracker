-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "aiAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "aiAtsScore" INTEGER,
ADD COLUMN     "aiImprovedSummary" TEXT,
ADD COLUMN     "aiMissingKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiProfessionalSummary" TEXT,
ADD COLUMN     "aiProvider" TEXT,
ADD COLUMN     "aiRecommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiWeaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[];
