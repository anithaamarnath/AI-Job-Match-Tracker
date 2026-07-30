import { prisma } from "../config/prisma.js";

export interface CreateJobMatchData {
  userId: string;
  resume: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export const createJobMatch = async (
  data: CreateJobMatchData
) => {
  return prisma.jobMatch.create({
    data: {
      userId: data.userId,
      resume: data.resume,
      jobDescription: data.jobDescription,
      matchScore: data.matchScore,
      matchedSkills: data.matchedSkills,
      missingSkills: data.missingSkills,
      recommendations: data.recommendations,
    },
  });
};

export const getJobMatchesByUserId = async (
  userId: string
) => {
  return prisma.jobMatch.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getJobMatchById = async (
  userId: string,
  matchId: string
) => {
  return prisma.jobMatch.findFirst({
    where: {
      id: matchId,
      userId,
    },
  });
};