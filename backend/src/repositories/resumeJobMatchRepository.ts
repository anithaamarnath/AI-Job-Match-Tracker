import { prisma } from "../config/prisma.js";

export interface CreateResumeJobMatchData {
  userId: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
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

