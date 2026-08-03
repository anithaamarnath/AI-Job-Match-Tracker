import { useMemo, useRef, useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ConfirmModal } from "../components/ConfirmModal";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ResumeCard } from "../components/ResumeCard";
import { Toast } from "../components/Toast";

import {
  useDeleteResume,
  useGenerateAIAnalysis,
  useResumes,
  useUploadResume,
} from "../hooks/useResume";

import { useToast } from "../hooks/useToast";

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

  const [resumeIdToDelete, setResumeIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisFilter, setAnalysisFilter] = useState<
    "ALL" | "ANALYZED" | "NOT_ANALYZED"
  >("ALL");

  const [sortOrder, setSortOrder] = useState<
    "NEWEST" | "OLDEST" | "HIGHEST_ATS"
  >("NEWEST");

  const { toast, showToast, hideToast } = useToast();

  const resumesQuery = useResumes();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();
  const analysisMutation = useGenerateAIAnalysis();

  const filteredResumes = useMemo(() => {
    const resumes = resumesQuery.data ?? [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = resumes.filter((resume) => {
      const matchesSearch =
        normalizedSearch === "" ||
        resume.originalName.toLowerCase().includes(normalizedSearch);

      const isAnalyzed = resume.aiAtsScore !== null || resume.atsScore !== null;

      const matchesFilter =
        analysisFilter === "ALL" ||
        (analysisFilter === "ANALYZED" && isAnalyzed) ||
        (analysisFilter === "NOT_ANALYZED" && !isAnalyzed);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "OLDEST") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (sortOrder === "HIGHEST_ATS") {
        const scoreA = a.aiAtsScore ?? a.atsScore ?? -1;

        const scoreB = b.aiAtsScore ?? b.atsScore ?? -1;

        return scoreB - scoreA;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [resumesQuery.data, searchTerm, analysisFilter, sortOrder]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      showToast("Only PDF and DOCX files are allowed.", "error");

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("The resume must be smaller than 5 MB.", "error");

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Select a resume before uploading.", "error");
      return;
    }

    try {
      await uploadMutation.mutateAsync(selectedFile);

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      showToast("Resume uploaded successfully.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleDeleteRequest = (resumeId: string) => {
    console.log("Resume delete requested:", resumeId);
    setResumeIdToDelete(resumeId);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeIdToDelete) {
      return;
    }

    try {
      console.log("Deleting resume:", resumeIdToDelete);

      await deleteMutation.mutateAsync(resumeIdToDelete);

      setResumeIdToDelete(null);

      showToast("Resume deleted successfully.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleAnalyze = async (resumeId: string) => {
    try {
      await analysisMutation.mutateAsync(resumeId);

      showToast("Mock AI analysis completed and saved.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
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

        <section className="resume-toolbar">
          <div className="resume-search">
            <label>Search</label>

            <input
              type="search"
              placeholder="Search resume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="resume-filter">
            <label>Filter</label>

            <select
              value={analysisFilter}
              onChange={(e) =>
                setAnalysisFilter(
                  e.target.value as "ALL" | "ANALYZED" | "NOT_ANALYZED",
                )
              }
            >
              <option value="ALL">All resumes</option>

              <option value="ANALYZED">AI Analyzed</option>

              <option value="NOT_ANALYZED">Not analyzed</option>
            </select>
          </div>

          <div className="resume-filter">
            <label>Sort</label>

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value as "NEWEST" | "OLDEST" | "HIGHEST_ATS",
                )
              }
            >
              <option value="NEWEST">Newest</option>

              <option value="OLDEST">Oldest</option>

              <option value="HIGHEST_ATS">Highest ATS</option>
            </select>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Your resumes</h2>

            <span>{filteredResumes.length} shown</span>
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
              {resumesQuery.data &&
                resumesQuery.data.length > 0 &&
                filteredResumes.length === 0 && (
                  <div className="empty-state">
                    <h2>No matching resumes</h2>

                    <p>Try another search or filter.</p>
                  </div>
                )}
              {filteredResumes.map((resume) => (
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
                  onDelete={handleDeleteRequest}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(resumeIdToDelete)}
        title="Delete resume?"
        message="This will permanently delete the resume and its saved analyses."
        confirmLabel="Delete resume"
        isConfirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setResumeIdToDelete(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </AppShell>
  );
};
