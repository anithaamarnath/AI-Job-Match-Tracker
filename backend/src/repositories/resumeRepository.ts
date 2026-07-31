import { prisma } from "../config/prisma.js";


interface CreateResumeData {
  originalName: string;
  storedName: string;
  filePath: string;
  extractedText: string;
  userId: string;
}

interface UpdateResumeAnalysisData {
  atsScore: number;
  detectedSkills: string[];
  strengths: string[];
  recommendations: string[];
}



export const createResume = async (
  data: CreateResumeData
) => {
  return prisma.resume.create({
    data,
  });
};

export const getResumesByUserId = async (
  userId: string
) => {
  return prisma.resume.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getResumeById = async (
  userId: string,
  resumeId: string
) => {
  return prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });
};

export const deleteResumeById = async (
  userId: string,
  resumeId: string
) => {
  return prisma.resume.deleteMany({
    where: {
      id: resumeId,
      userId,
    },
  });
};

export const updateResumeAnalysis = async (
  userId: string,
  resumeId: string,
  analysis: UpdateResumeAnalysisData
) => {
  return prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
    },
    data: {
      atsScore: analysis.atsScore,
      detectedSkills: analysis.detectedSkills,
      strengths: analysis.strengths,
      recommendations: analysis.recommendations,
      analyzedAt: new Date(),
    },
  });
};