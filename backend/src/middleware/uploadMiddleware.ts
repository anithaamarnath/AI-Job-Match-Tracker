import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { AppError } from "../utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/resumes"
);

// Create the folder automatically if it does not exist
fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueFileName = `${randomUUID()}${fileExtension}`;

    callback(null, uniqueFileName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(
      new AppError(
        "Only PDF and DOCX resume files are allowed",
        400
      )
    );

    return;
  }

  callback(null, true);
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});