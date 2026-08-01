export interface Resume {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  extractedText: string;

  atsScore: number | null;
  detectedSkills: string[];
  strengths: string[];
  recommendations: string[];
  analyzedAt: string | null;

  aiProvider: string | null;
  aiProfessionalSummary: string | null;
  aiStrengths: string[];
  aiWeaknesses: string[];
  aiMissingKeywords: string[];
  aiImprovedSummary: string | null;
  aiRecommendations: string[];
  aiAtsScore: number | null;
  aiAnalyzedAt: string | null;

  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIResumeAnalysis {
  resumeId: string;
  originalName: string;
  provider: string;
  professionalSummary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvedSummary: string;
  recommendations: string[];
  atsScore: number;
  analyzedAt: string;
}