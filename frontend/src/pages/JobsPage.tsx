import { useState } from "react";
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
