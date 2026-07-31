import fs from "node:fs/promises";
import { createRequire } from "node:module";

import {
  createResume,
  deleteResumeById,
  getResumeById,
  getResumesByUserId,
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