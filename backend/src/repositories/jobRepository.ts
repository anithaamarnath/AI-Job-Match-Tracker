import { prisma } from "../config/prisma";

export interface CreateJobData {
  company: string;
  role: string;
  description: string;
}

export interface UpdateJobData {
  company?: string;
  role?: string;
  description?: string;
  status?: string;
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

export const getJobById = async (id: string) => {
  return prisma.job.findUnique({
    where: {
      id,
    },
  });
};

export const updateJob = async (
  id: string,
  data: UpdateJobData
) => {
  return prisma.job.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteJob = async (id: string) => {
  return prisma.job.delete({
    where: {
      id,
    },
  });
};