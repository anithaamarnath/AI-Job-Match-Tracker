export type MatchConfidence =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface MatchResumeSummary {
  id: string;
  originalName: string;
}

export interface MatchJobSummary {
  id: string;
  company: string;
  role: string;
}

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

  resume?: MatchResumeSummary;
  job?: MatchJobSummary;
}

export interface CreateResumeJobMatchInput {
  resumeId: string;
  jobId: string;
}