import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { generateMockResumeAnalysis } from "./aiResumeService.js";
import {
  createResume,
  deleteResumeById,
  getResumeById,
  getResumesByUserId,
  updateAIResumeAnalysis
} from "../repositories/resumeRepository.js";
import {
  analyzeResumeText,
} from "./resumeAnalyzerService.js";

import { AppError } from "../utils/AppError.js";

const require = createRequire(import.meta.url);

interface PdfParseResult {
  text: string;
}

type PdfParseFunction = (
  buffer: Buffer
) => Promise<PdfParseResult>;

interface SaveResumeInput {
  userId: string;
  originalName: string;
  storedName: string;
  filePath: string;
}

const pdfParse = require("pdf-parse") as PdfParseFunction;

export const extractTextFromPdf = async (
  filePath: string
): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);

  const parsedPdf = await pdfParse(fileBuffer);
  const extractedText = parsedPdf.text.trim();

  if (!extractedText) {
    throw new AppError(
      "No text could be extracted from this PDF",
      400
    );
  }

  return extractedText;
};

export const saveUploadedResume = async (
  data: SaveResumeInput
) => {
  const extractedText = await extractTextFromPdf(
    data.filePath
  );

  return createResume({
    userId: data.userId,
    originalName: data.originalName,
    storedName: data.storedName,
    filePath: data.filePath,
    extractedText,
  });
};

export const getResumeHistory = async (
  userId: string
) => {
  return getResumesByUserId(userId);
};

export const getResumeHistoryById = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(
    userId,
    resumeId
  );

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  return resume;
};

export const deleteResumeHistoryById = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(
    userId,
    resumeId
  );

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  return deleteResumeById(userId, resumeId);
};

export const analyzeSavedResume = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(
    userId,
    resumeId
  );

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  const analysis = analyzeResumeText(
    resume.extractedText
  );

  return {
    resumeId: resume.id,
    originalName: resume.originalName,
    ...analysis,
  };
};

export const getSavedResumeAnalysis = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(
    userId,
    resumeId
  );

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  if (resume.atsScore === null) {
    throw new AppError(
      "This resume has not been analyzed yet",
      404
    );
  }

  return {
    resumeId: resume.id,
    originalName: resume.originalName,
    atsScore: resume.atsScore,
    detectedSkills: resume.detectedSkills,
    strengths: resume.strengths,
    recommendations: resume.recommendations,
    analyzedAt: resume.analyzedAt,
  };
};

export const generateAIResumeAnalysis = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(userId, resumeId);

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  const analysis = await generateMockResumeAnalysis(
    resume.extractedText
  );

  const updateResult = await updateAIResumeAnalysis(
    userId,
    resumeId,
    {
      provider: "MOCK",
      professionalSummary: analysis.professionalSummary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missingKeywords: analysis.missingKeywords,
      improvedSummary: analysis.improvedSummary,
      recommendations: analysis.recommendations,
      atsScore: analysis.atsScore,
    }
  );

  if (updateResult.count === 0) {
    throw new AppError(
      "AI analysis could not be saved",
      500
    );
  }

  const updatedResume = await getResumeById(
    userId,
    resumeId
  );

  return {
    resumeId,
    originalName: resume.originalName,
    provider: updatedResume?.aiProvider,
    professionalSummary:
      updatedResume?.aiProfessionalSummary,
    strengths: updatedResume?.aiStrengths ?? [],
    weaknesses: updatedResume?.aiWeaknesses ?? [],
    missingKeywords:
      updatedResume?.aiMissingKeywords ?? [],
    improvedSummary:
      updatedResume?.aiImprovedSummary,
    recommendations:
      updatedResume?.aiRecommendations ?? [],
    atsScore: updatedResume?.aiAtsScore,
    analyzedAt: updatedResume?.aiAnalyzedAt,
  };
};

export const getSavedAIResumeAnalysis = async (
  userId: string,
  resumeId: string
) => {
  const resume = await getResumeById(userId, resumeId);

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  if (resume.aiAtsScore === null) {
    throw new AppError(
      "This resume has not received AI analysis yet",
      404
    );
  }

  return {
    resumeId: resume.id,
    originalName: resume.originalName,
    provider: resume.aiProvider,
    professionalSummary: resume.aiProfessionalSummary,
    strengths: resume.aiStrengths,
    weaknesses: resume.aiWeaknesses,
    missingKeywords: resume.aiMissingKeywords,
    improvedSummary: resume.aiImprovedSummary,
    recommendations: resume.aiRecommendations,
    atsScore: resume.aiAtsScore,
    analyzedAt: resume.aiAnalyzedAt,
  };
};