export interface AIResumeAnalysisResult {
  professionalSummary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvedSummary: string;
  recommendations: string[];
  atsScore: number;
}

export const generateMockResumeAnalysis = async (
  resumeText: string
): Promise<AIResumeAnalysisResult> => {
  const normalizedText = resumeText.toLowerCase();

  const detectedKeywords = [
    "react",
    "typescript",
    "node.js",
    "postgresql",
    "aws",
    "docker",
    "salesforce",
  ].filter((keyword) => normalizedText.includes(keyword));

  const missingKeywords = [
    "kubernetes",
    "redis",
    "microservices",
    "ci/cd",
  ].filter((keyword) => !normalizedText.includes(keyword));

  const atsScore = Math.min(
    60 + detectedKeywords.length * 5,
    95
  );

  return {
    professionalSummary:
      "Software developer with experience building frontend and backend applications using modern web technologies.",

    strengths: [
      "Strong technical background",
      "Experience with full-stack development",
      "Relevant database and API experience",
      "Good foundation for software engineering roles",
    ],

    weaknesses: [
      "Some achievements may need stronger metrics",
      "Technical skills could be grouped more clearly",
      "The professional summary could be more targeted",
    ],

    missingKeywords,

    improvedSummary:
      "Results-driven software developer with experience building scalable web applications using React, TypeScript, Node.js, PostgreSQL, and cloud technologies. Skilled in developing reliable APIs, improving application performance, and collaborating across teams to deliver user-focused solutions.",

    recommendations: [
      "Add measurable achievements using numbers and percentages.",
      "Tailor the professional summary for each job.",
      "Add missing keywords only when they reflect real experience.",
      "Highlight production support, testing, and deployment experience.",
    ],

    atsScore,
  };
};