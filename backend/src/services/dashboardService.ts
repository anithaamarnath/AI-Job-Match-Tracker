import { prisma } from "../config/prisma.js";

export const getDashboardData = async (
  userId: string
) => {
  const [
    totalResumes,
    totalJobs,
    totalMatches,
    latestResume,
    bestMatch,
  ] = await Promise.all([
    prisma.resume.count({
      where: {
        userId,
      },
    }),

    prisma.job.count({
      where: {
        userId,
      },
    }),

    prisma.resumeJobMatch.count({
      where: {
        userId,
      },
    }),

    prisma.resume.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalName: true,
        aiAtsScore: true,
        atsScore: true,
        createdAt: true,
      },
    }),

    prisma.resumeJobMatch.findFirst({
      where: {
        userId,
      },
      orderBy: {
        matchScore: "desc",
      },
      include: {
        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
        job: {
          select: {
            id: true,
            company: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    totalResumes,
    totalJobs,
    totalMatches,

    latestResume: latestResume
      ? {
          id: latestResume.id,
          originalName: latestResume.originalName,
          atsScore:
            latestResume.aiAtsScore ??
            latestResume.atsScore,
          createdAt: latestResume.createdAt,
        }
      : null,

    bestMatch: bestMatch
      ? {
          id: bestMatch.id,
          matchScore: bestMatch.matchScore,
          confidence: bestMatch.confidence,
          resume: bestMatch.resume,
          job: bestMatch.job,
          createdAt: bestMatch.createdAt,
        }
      : null,
  };
};