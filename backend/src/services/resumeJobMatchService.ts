import { getResumeById } from "../repositories/resumeRepository.js";
import { getJobById } from "../repositories/jobRepository.js";
import { AppError } from "../utils/AppError.js";
import { detectSkills } from "./resumeAnalyzerService.js";
import { saveResumeJobMatch } from "../repositories/resumeJobMatchRepository.js";

export interface ResumeJobMatchResult {
  matchScore: number;
  resumeSkills: string[];
  jobSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  recommendations: string[];
}



export const calculateResumeJobMatch = async (
  userId: string,
  resumeId: string,
  jobId: string
): Promise<ResumeJobMatchResult> => {
  // Get resume
  const resume = await getResumeById(userId, resumeId);

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  // Get job
  const job = await getJobById(userId, jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // Detect skills
  const resumeSkills = detectSkills(resume.extractedText);
  const jobSkills = detectSkills(job.description);

  // Skills that exist in both
  const matchingSkills = jobSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  // Skills required by the job but missing from resume
  const missingSkills = jobSkills.filter(
    (skill) => !resumeSkills.includes(skill)
  );

  // Skills on the resume that aren't mentioned in the job
  const additionalSkills = resumeSkills.filter(
    (skill) => !jobSkills.includes(skill)
  );

  // Match score
  const matchScore =
    jobSkills.length === 0
      ? 0
      : Math.round(
          (matchingSkills.length / jobSkills.length) * 100
        );

  // Recommendations
  const recommendations: string[] = [];

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

  missingSkills.forEach((skill) => {
    recommendations.push(
      `Consider adding projects or experience related to ${skill}.`
    );
  });





  const result: ResumeJobMatchResult = {
  matchScore,
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
  resumeSkills: result.resumeSkills,
  jobSkills: result.jobSkills,
  matchingSkills: result.matchingSkills,
  missingSkills: result.missingSkills,
  additionalSkills: result.additionalSkills,
  recommendations: result.recommendations,
});

return result;
};


