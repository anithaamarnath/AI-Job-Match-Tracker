import { useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { JobCard } from "../components/JobCard";
import { LoadingState } from "../components/LoadingState";

import { useCreateJob, useDeleteJob, useJobs } from "../hooks/useJobs";

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
  const deleteMutation = useDeleteJob();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!company.trim() || !role.trim() || description.trim().length < 10) {
      setMessage(
        "Enter a company, role, and description with at least 10 characters.",
      );
      return;
    }

    try {
      setMessage("");

      await createMutation.mutateAsync({
        company: company.trim(),
        role: role.trim(),
        description: description.trim(),
      });

      setCompany("");
      setRole("");
      setDescription("");

      setMessage("Job saved successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (jobId: string) => {
    const confirmed = window.confirm("Delete this saved job?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      await deleteMutation.mutateAsync(jobId);

      setMessage("Job deleted successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
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
            <h2>Add a job</h2>
            <p>Save the company, role, and full job description.</p>
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
              />
            </div>

            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save job"}
            </button>
          </form>
        </section>

        {message && (
          <p className="status-message" role="status">
            {message}
          </p>
        )}

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
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
};
