import { prisma } from "../config/prisma";

export interface CreateJobData {
  company: string;
  role: string;
  description: string;
}

export const createJob = async (data: CreateJobData) => {
  return prisma.job.create({
    data,
  });
};

export const getAllJobs = async () => {
  return prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};