import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface PdfParseResult {
  text: string;
}

type PdfParseFunction = (
  buffer: Buffer
) => Promise<PdfParseResult>;

const pdfParse = require("pdf-parse") as PdfParseFunction;

export const extractTextFromPdf = async (
  filePath: string
): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);

  const parsedPdf = await pdfParse(fileBuffer);
  const extractedText = parsedPdf.text.trim();

  if (!extractedText) {
    throw new Error(
      "No text could be extracted from this PDF"
    );
  }

  return extractedText;
};