import { getResumeById } from "../repositories/resumeRepository.js";
import { getJobById } from "../repositories/jobRepository.js";

import {
  deleteResumeJobMatchById,
  getResumeJobMatchById,
  getResumeJobMatches,
  saveResumeJobMatch,
} from "../repositories/resumeJobMatchRepository.js";

import { AppError } from "../utils/AppError.js";
import { detectSkills } from "./resumeAnalyzerService.js";

export type MatchConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface ResumeJobMatchResult {
  matchScore: number;
  confidence: MatchConfidence;
  resumeSkills: string[];
  jobSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  recommendations: string[];
}

const calculateConfidence = (
  detectedJobSkillCount: number
): MatchConfidence => {
  if (detectedJobSkillCount >= 8) {
    return "HIGH";
  }

  if (detectedJobSkillCount >= 4) {
    return "MEDIUM";
  }

  return "LOW";
};

const createRecommendations = (
  matchScore: number,
  confidence: MatchConfidence,
  jobSkills: string[],
  missingSkills: string[]
): string[] => {
  const recommendations: string[] = [];

  if (confidence === "LOW") {
    recommendations.push(
      "The score has low confidence because only a few recognized skills were found in the job description."
    );
  }

  if (jobSkills.length === 0) {
    recommendations.push(
      "The job description does not contain enough recognizable technical skills."
    );

    return recommendations;
  }

  if (matchScore >= 90) {
    recommendations.push(
      "Excellent match! Your resume aligns very well with this job."
    );
  } else if (matchScore >= 75) {
    recommendations.push(
      "Good match. A few improvements could strengthen your application."
    );
  } else if (matchScore >= 50) {
    recommendations.push(
      "Your resume partially matches this position."
    );
  } else {
    recommendations.push(
      "Your resume needs significant improvements for this job."
    );
  }

  for (const skill of missingSkills) {
    recommendations.push(
      `Consider adding projects or experience related to ${skill}.`
    );
  }

  return recommendations;
};

export const calculateResumeJobMatch = async (
  userId: string,
  resumeId: string,
  jobId: string
): Promise<ResumeJobMatchResult> => {
  const resume = await getResumeById(userId, resumeId);

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  const job = await getJobById(userId, jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const resumeSkills = detectSkills(
    resume.extractedText
  );

  const jobSkills = detectSkills(
    job.description
  );

  const matchingSkills = jobSkills.filter(
    (skill) => resumeSkills.includes(skill)
  );

  const missingSkills = jobSkills.filter(
    (skill) => !resumeSkills.includes(skill)
  );

  const additionalSkills = resumeSkills.filter(
    (skill) => !jobSkills.includes(skill)
  );

  const matchScore =
    jobSkills.length === 0
      ? 0
      : Math.round(
          (matchingSkills.length / jobSkills.length) * 100
        );

  const confidence = calculateConfidence(
    jobSkills.length
  );

  const recommendations = createRecommendations(
    matchScore,
    confidence,
    jobSkills,
    missingSkills
  );

  const result: ResumeJobMatchResult = {
    matchScore,
    confidence,
    resumeSkills,
    jobSkills,
    matchingSkills,
    missingSkills,
    additionalSkills,
    recommendations,
  };

  await saveResumeJobMatch({
    userId,
    resumeId,
    jobId,
    matchScore: result.matchScore,
    confidence: result.confidence,
    resumeSkills: result.resumeSkills,
    jobSkills: result.jobSkills,
    matchingSkills: result.matchingSkills,
    missingSkills: result.missingSkills,
    additionalSkills: result.additionalSkills,
    recommendations: result.recommendations,
  });

  return result;
};

export const getResumeJobMatchHistory = async (
  userId: string
) => {
  return getResumeJobMatches(userId);
};

export const getResumeJobMatchHistoryById = async (
  userId: string,
  matchId: string
) => {
  const match = await getResumeJobMatchById(
    userId,
    matchId
  );

  if (!match) {
    throw new AppError(
      "Resume-job match result not found",
      404
    );
  }

  return match;
};

export const deleteResumeJobMatchHistoryById = async (
  userId: string,
  matchId: string
): Promise<void> => {
  const result = await deleteResumeJobMatchById(
    userId,
    matchId
  );

  if (result.count === 0) {
    throw new AppError(
      "Resume-job match result not found",
      404
    );
  }
};