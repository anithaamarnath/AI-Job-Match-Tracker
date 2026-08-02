import { useState } from "react";
import axios from "axios";

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

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);

  const { toast, showToast, hideToast } = useToast();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setCompany("");
    setRole("");
    setDescription("");
    setEditingJobId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();
    const trimmedDescription = description.trim();

    if (!trimmedCompany || !trimmedRole || trimmedDescription.length < 10) {
      showToast(
        "Enter a company, role, and description with at least 10 characters.",
        "error",
      );

      return;
    }

    const input = {
      company: trimmedCompany,
      role: trimmedRole,
      description: trimmedDescription,
    };

    try {
      if (editingJobId) {
        await updateMutation.mutateAsync({
          jobId: editingJobId,
          input,
        });

        showToast("Job updated successfully.", "success");
      } else {
        await createMutation.mutateAsync(input);

        showToast("Job saved successfully.", "success");
      }

      resetForm();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJobId(job.id);
    setCompany(job.company);
    setRole(job.role);
    setDescription(job.description);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    resetForm();
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

          <form className="job-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="company">Company</label>

              <input
                id="company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Amazon"
                disabled={isSaving}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="role">Role</label>

              <input
                id="role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Software Developer"
                disabled={isSaving}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="description">Job description</label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Paste the complete job description..."
                rows={8}
                disabled={isSaving}
                required
              />
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
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="section-heading">
            <h2>Your jobs</h2>

            <span>{jobsQuery.data?.length ?? 0} total</span>
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

          {jobsQuery.data?.length === 0 && (
            <div className="empty-state">
              <h2>No jobs saved</h2>

              <p>Add your first job description to start matching resumes.</p>
            </div>
          )}

          {jobsQuery.data && jobsQuery.data.length > 0 && (
            <div className="job-grid">
              {jobsQuery.data.map((job) => (
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
