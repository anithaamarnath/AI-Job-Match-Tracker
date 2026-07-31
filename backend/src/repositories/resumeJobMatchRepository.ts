import { prisma } from "../config/prisma.js";

export interface CreateResumeJobMatchData {
  userId: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  resumeSkills: string[];
  jobSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  recommendations: string[];
}

export const saveResumeJobMatch = async (
  data: CreateResumeJobMatchData
) => {
  return prisma.resumeJobMatch.create({
    data,
  });
};

export const getResumeJobMatches = async (
  userId: string
) => {
  return prisma.resumeJobMatch.findMany({
    where: {
      userId,
    },

    select: {
      id: true,
      matchScore: true,
      confidence: true,

      resumeSkills: true,
      jobSkills: true,
      matchingSkills: true,
      missingSkills: true,
      additionalSkills: true,
      recommendations: true,

      createdAt: true,
      updatedAt: true,

      userId: true,
      resumeId: true,
      jobId: true,

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

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getResumeJobMatchById = async (
  userId: string,
  matchId: string
) => {
  return prisma.resumeJobMatch.findFirst({
    where: {
      id: matchId,
      userId,
    },

    select: {
      id: true,
      matchScore: true,
      confidence: true,

      resumeSkills: true,
      jobSkills: true,
      matchingSkills: true,
      missingSkills: true,
      additionalSkills: true,
      recommendations: true,

      createdAt: true,
      updatedAt: true,

      userId: true,
      resumeId: true,
      jobId: true,

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
          description: true,
        },
      },
    },
  });
};

export const deleteResumeJobMatchById = async (
  userId: string,
  matchId: string
) => {
  return prisma.resumeJobMatch.deleteMany({
    where: {
      id: matchId,
      userId,
    },
  });
};