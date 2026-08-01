import { useRef, useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ResumeCard } from "../components/ResumeCard";

import {
  useDeleteResume,
  useGenerateAIAnalysis,
  useResumes,
  useUploadResume,
} from "../hooks/useResume.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "The request could not be completed."
    );
  }

  return "An unexpected error occurred.";
};

export const ResumesPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");

  const resumesQuery = useResumes();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();
  const analysisMutation = useGenerateAIAnalysis();

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      setMessage("Only PDF and DOCX files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("The resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Select a resume before uploading.");
      return;
    }

    try {
      setMessage("");

      await uploadMutation.mutateAsync(selectedFile);

      setSelectedFile(null);
      setMessage("Resume uploaded successfully.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (resumeId: string) => {
    const confirmed = window.confirm(
      "Delete this resume and its saved analyses?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      await deleteMutation.mutateAsync(resumeId);

      setMessage("Resume deleted successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleAnalyze = async (resumeId: string) => {
    try {
      setMessage("");

      await analysisMutation.mutateAsync(resumeId);

      setMessage("Mock AI analysis completed and saved.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Resume workspace</p>

            <h1>Manage your resumes</h1>

            <p>
              Upload a resume, run mock AI analysis, and review ATS feedback.
            </p>
          </div>
        </header>

        <section className="upload-panel">
          <div>
            <h2>Upload a new resume</h2>
            <p>PDF or DOCX, maximum 5 MB.</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelection}
          />

          {selectedFile && (
            <p>
              Selected: <strong>{selectedFile.name}</strong>
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload resume"}
          </button>
        </section>

        {message && (
          <p className="status-message" role="status">
            {message}
          </p>
        )}

        <section>
          <div className="section-heading">
            <h2>Your resumes</h2>

            <span>{resumesQuery.data?.length ?? 0} total</span>
          </div>

          {resumesQuery.isPending && (
            <LoadingState message="Loading resumes..." />
          )}

          {resumesQuery.isError && (
            <ErrorState
              message={getErrorMessage(resumesQuery.error)}
              onRetry={() => {
                void resumesQuery.refetch();
              }}
            />
          )}

          {resumesQuery.data?.length === 0 && (
            <div className="empty-state">
              <h2>No resumes uploaded</h2>
              <p>
                Upload your first resume to start analysis and job matching.
              </p>
            </div>
          )}

          {resumesQuery.data && resumesQuery.data.length > 0 && (
            <div className="resume-grid">
              {resumesQuery.data.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === resume.id
                  }
                  isAnalyzing={
                    analysisMutation.isPending &&
                    analysisMutation.variables === resume.id
                  }
                  onDelete={handleDelete}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
};
