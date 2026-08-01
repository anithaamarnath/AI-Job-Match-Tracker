export type MatchConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface ResumeJobMatch {
  id?: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  confidence: MatchConfidence;
  resumeSkills: string[];
  jobSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  recommendations: string[];
  createdAt?: string;
}

export interface CreateResumeJobMatchInput {
  resumeId: string;
  jobId: string;
}