import {
  createJob as createJobInDatabase,
  getAllJobs as getAllJobsFromDatabase,
} from "../repositories/jobRepository";

export const createJob = async (data: {
  company: string;
  role: string;
  description: string;
}) => {
  return createJobInDatabase(data);
};

export const getAllJobs = async () => {
  return getAllJobsFromDatabase();
};