-- CreateTable
CREATE TABLE "ResumeJobMatch" (
    "id" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "resumeSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "matchingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "ResumeJobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeJobMatch_userId_idx" ON "ResumeJobMatch"("userId");

-- CreateIndex
CREATE INDEX "ResumeJobMatch_resumeId_idx" ON "ResumeJobMatch"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeJobMatch_jobId_idx" ON "ResumeJobMatch"("jobId");

-- AddForeignKey
ALTER TABLE "ResumeJobMatch" ADD CONSTRAINT "ResumeJobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeJobMatch" ADD CONSTRAINT "ResumeJobMatch_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeJobMatch" ADD CONSTRAINT "ResumeJobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
