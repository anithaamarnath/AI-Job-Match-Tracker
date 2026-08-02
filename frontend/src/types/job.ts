export interface Job {
  id: string;
  company: string;
  role: string;
  description: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  company: string;
  role: string;
  description: string;
}

export interface UpdateJobInput {
  company: string;
  role: string;
  description: string;
  status?: string;
}