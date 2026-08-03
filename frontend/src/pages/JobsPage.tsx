import { useMemo, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AppShell } from "../components/AppShell";
import { ConfirmModal } from "../components/ConfirmModal";
import { ErrorState } from "../components/ErrorState";
import { JobCard } from "../components/JobCard";
import { LoadingState } from "../components/LoadingState";
import { Toast } from "../components/Toast";

import { useToast } from "../hooks/useToast";
import {
  useCreateJob,
  useDeleteJob,
  useJobs,
  useUpdateJob,
} from "../hooks/useJobs";

import type { Job } from "../types/job";

const jobFormSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Company must contain at least 2 characters.")
    .max(100, "Company must be 100 characters or fewer."),

  role: z
    .string()
    .trim()
    .min(2, "Role must contain at least 2 characters.")
    .max(120, "Role must be 120 characters or fewer."),

  description: z
    .string()
    .trim()
    .min(10, "Job description must contain at least 10 characters.")
    .max(20_000, "Job description must be 20,000 characters or fewer."),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

type JobStatusFilter =
  | "ALL"
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "REJECTED"
  | "OFFER";

type JobSortOption = "NEWEST" | "OLDEST" | "COMPANY" | "ROLE";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "The request could not be completed."
    );
  }

  return "An unexpected error occurred.";
};

export const JobsPage = () => {
  const jobsQuery = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();

  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("ALL");

  const [sortOption, setSortOption] = useState<JobSortOption>("NEWEST");

  const { toast, showToast, hideToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      company: "",
      role: "",
      description: "",
    },
  });

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const filteredJobs = useMemo(() => {
    const jobs = jobsQuery.data ?? [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.role.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || job.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "OLDEST":
          return (
            new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime()
          );

        case "COMPANY":
          return first.company.localeCompare(second.company);

        case "ROLE":
          return first.role.localeCompare(second.role);

        case "NEWEST":
        default:
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
      }
    });
  }, [jobsQuery.data, searchTerm, statusFilter, sortOption]);

  const resetForm = () => {
    reset({
      company: "",
      role: "",
      description: "",
    });

    setEditingJobId(null);
  };

  const onSubmit = async (values: JobFormValues) => {
    try {
      if (editingJobId) {
        await updateMutation.mutateAsync({
          jobId: editingJobId,
          input: values,
        });

        showToast("Job updated successfully.", "success");
      } else {
        await createMutation.mutateAsync(values);

        showToast("Job saved successfully.", "success");
      }

      resetForm();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJobId(job.id);

    reset({
      company: job.company,
      role: job.role,
      description: job.description,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteRequest = (jobId: string) => {
    setJobIdToDelete(jobId);
  };

  const handleDeleteConfirm = async () => {
    if (!jobIdToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(jobIdToDelete);

      if (editingJobId === jobIdToDelete) {
        resetForm();
      }

      setJobIdToDelete(null);

      showToast("Job deleted successfully.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const clearSearchAndFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setSortOption("NEWEST");
  };

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header">
          <p className="page-eyebrow">Job workspace</p>

          <h1>Manage your jobs</h1>

          <p>
            Save job descriptions and compare them with your uploaded resumes.
          </p>
        </header>

        <section className="job-form-panel">
          <div>
            <h2>{editingJobId ? "Edit job" : "Add a job"}</h2>

            <p>
              {editingJobId
                ? "Update the company, role, or job description."
                : "Save the company, role, and full job description."}
            </p>
          </div>

          <form
            className="job-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="form-field">
              <label htmlFor="company">Company</label>

              <input
                id="company"
                type="text"
                placeholder="Amazon"
                disabled={isSaving}
                aria-invalid={errors.company ? "true" : "false"}
                {...register("company")}
              />

              {errors.company && (
                <p className="field-error">{errors.company.message}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="role">Role</label>

              <input
                id="role"
                type="text"
                placeholder="Software Developer"
                disabled={isSaving}
                aria-invalid={errors.role ? "true" : "false"}
                {...register("role")}
              />

              {errors.role && (
                <p className="field-error">{errors.role.message}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="description">Job description</label>

              <textarea
                id="description"
                placeholder="Paste the complete job description..."
                rows={8}
                disabled={isSaving}
                aria-invalid={errors.description ? "true" : "false"}
                {...register("description")}
              />

              {errors.description && (
                <p className="field-error">{errors.description.message}</p>
              )}
            </div>

            <div className="job-form-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingJobId
                    ? "Update job"
                    : "Save job"}
              </button>

              {editingJobId && (
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel editing
                </button>
              )}

              {!editingJobId && isDirty && (
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Clear form
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-controls-panel">
          <div className="list-controls">
            <div className="form-field search-field">
              <label htmlFor="job-search">Search jobs</label>

              <input
                id="job-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search company or role..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="job-status-filter">Status</label>

              <select
                id="job-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as JobStatusFilter)
                }
              >
                <option value="ALL">All statuses</option>
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="REJECTED">Rejected</option>
                <option value="OFFER">Offer</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="job-sort">Sort by</label>

              <select
                id="job-sort"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as JobSortOption)
                }
              >
                <option value="NEWEST">Newest first</option>
                <option value="OLDEST">Oldest first</option>
                <option value="COMPANY">Company A–Z</option>
                <option value="ROLE">Role A–Z</option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filters-button"
              onClick={clearSearchAndFilters}
              disabled={
                !searchTerm && statusFilter === "ALL" && sortOption === "NEWEST"
              }
            >
              Clear
            </button>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Your jobs</h2>

            <span>
              {filteredJobs.length} of {jobsQuery.data?.length ?? 0}
            </span>
          </div>

          {jobsQuery.isPending && <LoadingState message="Loading jobs..." />}

          {jobsQuery.isError && (
            <ErrorState
              message={getErrorMessage(jobsQuery.error)}
              onRetry={() => {
                void jobsQuery.refetch();
              }}
            />
          )}

          {!jobsQuery.isPending &&
            !jobsQuery.isError &&
            filteredJobs.length === 0 && (
              <div className="empty-state">
                <h2>No matching jobs</h2>

                <p>Try changing your search, filter, or sorting options.</p>

                <button type="button" onClick={clearSearchAndFilters}>
                  Clear filters
                </button>
              </div>
            )}

          {filteredJobs.length > 0 && (
            <div className="job-grid">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === job.id
                  }
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
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
        isOpen={Boolean(jobIdToDelete)}
        title="Delete job?"
        message="This will permanently delete the saved job and its related match history."
        confirmLabel="Delete job"
        isConfirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setJobIdToDelete(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </AppShell>
  );
};
