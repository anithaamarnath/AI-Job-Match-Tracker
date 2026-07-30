import type { JobMatchInput } from "../validators/jobMatchValidator.js";

export interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export const analyzeJobMatch = async (
  data: JobMatchInput
): Promise<JobMatchResult> => {
  return {
    matchScore: 0,
    matchedSkills: [],
    missingSkills: [],
    recommendations: [
      "Keyword matching will be added in the next step."
    ]
  };
};