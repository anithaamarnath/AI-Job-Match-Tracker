import { prisma } from "../config/prisma.js";

export interface CreateJobData {
  company: string;
  role: string;
  description: string;
  status?: string;
}

export interface UpdateJobData {
  company?: string;
  role?: string;
  description?: string;
  status?: string;
}

export const createJob = async (
  userId: string,
  data: CreateJobData
) => {
  return prisma.job.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getAllJobs = async (userId: string) => {
  return prisma.job.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getJobById = async (
  userId: string,
  jobId: string
) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });
};

export const updateJob = async (
  userId: string,
  jobId: string,
  data: UpdateJobData
) => {
  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!existingJob) {
    return null;
  }

  return prisma.job.update({
    where: {
      id: jobId,
    },
    data,
  });
};

export const deleteJob = async (
  userId: string,
  jobId: string
) => {
  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!existingJob) {
    return null;
  }

  return prisma.job.delete({
    where: {
      id: jobId,
    },
  });
};