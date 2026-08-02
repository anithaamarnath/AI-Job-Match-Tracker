import { Link, useParams } from "react-router-dom";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useJob } from "../hooks/useJobs";

export const JobDetailsPage = () => {
  const { id = "" } = useParams<{
    id: string;
  }>();

  const jobQuery = useJob(id);

  if (jobQuery.isPending) {
    return (
      <AppShell>
        <main className="page-container">
          <LoadingState message="Loading job..." />
        </main>
      </AppShell>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <AppShell>
        <main className="page-container">
          <ErrorState
            message="Unable to load this job."
            onRetry={() => {
              void jobQuery.refetch();
            }}
          />
        </main>
      </AppShell>
    );
  }

  const job = jobQuery.data;

  const createdDate = new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(job.createdAt));

  return (
    <AppShell>
      <main className="page-container">
        <Link className="back-link" to="/jobs">
          ← Back to jobs
        </Link>

        <header className="page-header job-details-header">
          <div>
            <p className="page-eyebrow">Job details</p>

            <h1>{job.role}</h1>

            <p>
              {job.company} · Saved {createdDate}
            </p>
          </div>

          <span className="job-status">{job.status}</span>
        </header>

        <section className="job-details-grid">
          <article className="dashboard-panel">
            <h2>Job overview</h2>

            <dl className="job-meta-list">
              <div>
                <dt>Company</dt>
                <dd>{job.company}</dd>
              </div>

              <div>
                <dt>Role</dt>
                <dd>{job.role}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{job.status}</dd>
              </div>

              <div>
                <dt>Created</dt>
                <dd>{createdDate}</dd>
              </div>
            </dl>

            <Link
              className="primary-link-button"
              to={`/matches?jobId=${job.id}`}
            >
              Match with a resume
            </Link>
          </article>

          <article className="dashboard-panel">
            <h2>Full job description</h2>

            <p className="job-full-description">{job.description}</p>
          </article>
        </section>
      </main>
    </AppShell>
  );
};
