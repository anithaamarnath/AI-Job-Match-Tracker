import { useEffect, useMemo, useRef, useState } from "react";
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
const RESUMES_PER_PAGE = 6;

const allowedFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type AnalysisFilter = "ALL" | "ANALYZED" | "NOT_ANALYZED";

type ResumeSortOrder = "NEWEST" | "OLDEST" | "HIGHEST_ATS";

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

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [resumeIdToDelete, setResumeIdToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [analysisFilter, setAnalysisFilter] = useState<AnalysisFilter>("ALL");

  const [sortOrder, setSortOrder] = useState<ResumeSortOrder>("NEWEST");

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
        !normalizedSearch ||
        resume.originalName.toLowerCase().includes(normalizedSearch);

      const isAnalyzed = resume.aiAtsScore !== null || resume.atsScore !== null;

      const matchesFilter =
        analysisFilter === "ALL" ||
        (analysisFilter === "ANALYZED" && isAnalyzed) ||
        (analysisFilter === "NOT_ANALYZED" && !isAnalyzed);

      return matchesSearch && matchesFilter;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOrder) {
        case "OLDEST":
          return (
            new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime()
          );

        case "HIGHEST_ATS": {
          const firstScore = first.aiAtsScore ?? first.atsScore ?? -1;

          const secondScore = second.aiAtsScore ?? second.atsScore ?? -1;

          return secondScore - firstScore;
        }

        case "NEWEST":
        default:
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
      }
    });
  }, [resumesQuery.data, searchTerm, analysisFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, analysisFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResumes.length / RESUMES_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedResumes = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * RESUMES_PER_PAGE;

    return filteredResumes.slice(startIndex, startIndex + RESUMES_PER_PAGE);
  }, [filteredResumes, safeCurrentPage]);

  const firstVisibleResume =
    filteredResumes.length === 0
      ? 0
      : (safeCurrentPage - 1) * RESUMES_PER_PAGE + 1;

  const lastVisibleResume = Math.min(
    safeCurrentPage * RESUMES_PER_PAGE,
    filteredResumes.length,
  );

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      showToast("Only PDF and DOCX files are allowed.", "error");

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("The resume must be smaller than 5 MB.", "error");

      event.target.value = "";
      setSelectedFile(null);

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
    setResumeIdToDelete(resumeId);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeIdToDelete) {
      return;
    }

    try {
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

  const clearSearchAndFilters = () => {
    setSearchTerm("");
    setAnalysisFilter("ALL");
    setSortOrder("NEWEST");
    setCurrentPage(1);
  };

  const hasActiveControls =
    Boolean(searchTerm) || analysisFilter !== "ALL" || sortOrder !== "NEWEST";

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

        <section className="list-controls-panel">
          <div className="list-controls">
            <div className="form-field search-field">
              <label htmlFor="resume-search">Search resumes</label>

              <input
                id="resume-search"
                type="search"
                placeholder="Search resume name..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="resume-filter">Analysis status</label>

              <select
                id="resume-filter"
                value={analysisFilter}
                onChange={(event) =>
                  setAnalysisFilter(event.target.value as AnalysisFilter)
                }
              >
                <option value="ALL">All resumes</option>

                <option value="ANALYZED">Analyzed</option>

                <option value="NOT_ANALYZED">Not analyzed</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="resume-sort">Sort by</label>

              <select
                id="resume-sort"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as ResumeSortOrder)
                }
              >
                <option value="NEWEST">Newest first</option>

                <option value="OLDEST">Oldest first</option>

                <option value="HIGHEST_ATS">Highest ATS score</option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filters-button"
              onClick={clearSearchAndFilters}
              disabled={!hasActiveControls}
            >
              Clear
            </button>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Your resumes</h2>

            <span>
              {filteredResumes.length === 0
                ? "0 results"
                : `${firstVisibleResume}–${lastVisibleResume} of ${filteredResumes.length}`}
            </span>
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

          {!resumesQuery.isPending &&
            !resumesQuery.isError &&
            (resumesQuery.data?.length ?? 0) === 0 && (
              <div className="empty-state">
                <h2>No resumes uploaded</h2>

                <p>
                  Upload your first resume to start analysis and job matching.
                </p>
              </div>
            )}

          {!resumesQuery.isPending &&
            !resumesQuery.isError &&
            (resumesQuery.data?.length ?? 0) > 0 &&
            filteredResumes.length === 0 && (
              <div className="empty-state">
                <h2>No matching resumes</h2>

                <p>Try changing your search, filter, or sorting options.</p>

                <button type="button" onClick={clearSearchAndFilters}>
                  Clear filters
                </button>
              </div>
            )}

          {paginatedResumes.length > 0 && (
            <div className="resume-grid">
              {paginatedResumes.map((resume) => (
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

          {filteredResumes.length > RESUMES_PER_PAGE && (
            <nav className="pagination" aria-label="Resume pagination">
              <button
                type="button"
                className="pagination-button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
              >
                Previous
              </button>

              <div className="pagination-pages">
                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      page === safeCurrentPage
                        ? "pagination-number active"
                        : "pagination-number"
                    }
                    aria-current={page === safeCurrentPage ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage === totalPages}
              >
                Next
              </button>
            </nav>
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
