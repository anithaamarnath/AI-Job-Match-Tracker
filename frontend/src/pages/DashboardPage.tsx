import { Link } from "react-router-dom";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useDashboard } from "../hooks/useDashboard";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "The dashboard could not be loaded."
    );
  }

  return "An unexpected error occurred.";
};

export const DashboardPage = () => {
  const dashboardQuery = useDashboard();

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? (JSON.parse(storedUser) as {
        name?: string;
      })
    : null;

  if (dashboardQuery.isPending) {
    return (
      <AppShell>
        <main className="page-container">
          <LoadingState message="Loading dashboard..." />
        </main>
      </AppShell>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <AppShell>
        <main className="page-container">
          <ErrorState
            message={getErrorMessage(dashboardQuery.error)}
            onRetry={() => {
              void dashboardQuery.refetch();
            }}
          />
        </main>
      </AppShell>
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header">
          <p className="page-eyebrow">Career dashboard</p>

          <h1>Welcome back, {user?.name ?? "User"}</h1>

          <p>Track your resumes, saved jobs, and strongest job match.</p>
        </header>

        <section className="dashboard-stats">
          <article className="stat-card">
            <p>Total resumes</p>
            <strong>{dashboard.totalResumes}</strong>

            <Link to="/resumes">Manage resumes</Link>
          </article>

          <article className="stat-card">
            <p>Saved jobs</p>
            <strong>{dashboard.totalJobs}</strong>

            <Link to="/jobs">Manage jobs</Link>
          </article>

          <article className="stat-card">
            <p>Total matches</p>
            <strong>{dashboard.totalMatches}</strong>

            <Link to="/matches">View matches</Link>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="section-heading">
              <h2>Latest resume</h2>

              <Link to="/resumes">View all</Link>
            </div>

            {dashboard.latestResume ? (
              <div className="dashboard-highlight">
                <div>
                  <p className="card-eyebrow">Most recently uploaded</p>

                  <h3>{dashboard.latestResume.originalName}</h3>

                  <p>
                    Uploaded{" "}
                    {new Intl.DateTimeFormat("en-CA", {
                      dateStyle: "medium",
                    }).format(new Date(dashboard.latestResume.createdAt))}
                  </p>
                </div>

                <div className="dashboard-score">
                  <strong>{dashboard.latestResume.atsScore ?? "—"}</strong>

                  <span>ATS score</span>
                </div>
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No resumes uploaded yet.</p>

                <Link className="dashboard-action-link" to="/resumes">
                  Upload a resume
                </Link>
              </div>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="section-heading">
              <h2>Best match</h2>

              <Link to="/matches">View all</Link>
            </div>

            {dashboard.bestMatch ? (
              <div className="dashboard-highlight">
                <div>
                  <p className="card-eyebrow">Strongest comparison</p>

                  <h3>
                    {dashboard.bestMatch.job.company} —{" "}
                    {dashboard.bestMatch.job.role}
                  </h3>

                  <p>Resume: {dashboard.bestMatch.resume.originalName}</p>

                  <span
                    className={`confidence-badge confidence-${dashboard.bestMatch.confidence.toLowerCase()}`}
                  >
                    {dashboard.bestMatch.confidence} confidence
                  </span>
                </div>

                <div className="dashboard-score">
                  <strong>{dashboard.bestMatch.matchScore}%</strong>

                  <span>Match score</span>
                </div>
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No match results yet.</p>

                <Link className="dashboard-action-link" to="/matches">
                  Run your first match
                </Link>
              </div>
            )}
          </article>

          <aside className="dashboard-panel quick-actions">
            <h2>Quick actions</h2>

            <Link className="quick-action-card" to="/resumes">
              <strong>Upload resume</strong>
              <span>Add a new PDF or DOCX resume.</span>
            </Link>

            <Link className="quick-action-card" to="/jobs">
              <strong>Save job</strong>
              <span>Store a job description.</span>
            </Link>

            <Link className="quick-action-card" to="/matches">
              <strong>Run match</strong>
              <span>Compare one resume with one job.</span>
            </Link>
          </aside>
        </section>
      </main>
    </AppShell>
  );
};
