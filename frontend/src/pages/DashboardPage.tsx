import { Link } from "react-router-dom";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useJobs } from "../hooks/useJobs";
import { useMatches } from "../hooks/useMatches";
import { useResumes } from "../hooks/useResume";

export const DashboardPage = () => {
  const resumesQuery = useResumes();
  const jobsQuery = useJobs();
  const matchesQuery = useMatches();

  const isLoading =
    resumesQuery.isPending || jobsQuery.isPending || matchesQuery.isPending;

  const isError =
    resumesQuery.isError || jobsQuery.isError || matchesQuery.isError;

  if (isLoading) {
    return (
      <AppShell>
        <main className="page-container">
          <LoadingState message="Loading dashboard..." />
        </main>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <main className="page-container">
          <ErrorState
            message="Unable to load dashboard data."
            onRetry={() => {
              void resumesQuery.refetch();
              void jobsQuery.refetch();
              void matchesQuery.refetch();
            }}
          />
        </main>
      </AppShell>
    );
  }

  const resumes = resumesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const matches = matchesQuery.data ?? [];

  const averageMatchScore =
    matches.length === 0
      ? 0
      : Math.round(
          matches.reduce((total, match) => total + match.matchScore, 0) /
            matches.length,
        );

  const recentMatches = matches.slice(0, 4);

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? (JSON.parse(storedUser) as {
        name?: string;
      })
    : null;

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header dashboard-header">
          <div>
            <p className="page-eyebrow">Career dashboard</p>

            <h1>Welcome back, {user?.name ?? "User"}</h1>

            <p>Review your resumes, saved jobs, and recent match results.</p>
          </div>
        </header>

        <section className="dashboard-stats">
          <article className="stat-card">
            <p>Total resumes</p>
            <strong>{resumes.length}</strong>
            <Link to="/resumes">Manage resumes</Link>
          </article>

          <article className="stat-card">
            <p>Saved jobs</p>
            <strong>{jobs.length}</strong>
            <Link to="/jobs">Manage jobs</Link>
          </article>

          <article className="stat-card">
            <p>Total matches</p>
            <strong>{matches.length}</strong>
            <Link to="/matches">View matches</Link>
          </article>

          <article className="stat-card">
            <p>Average match score</p>
            <strong>{averageMatchScore}%</strong>
            <Link to="/matches">Run a new match</Link>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="section-heading">
              <h2>Recent matches</h2>

              <Link to="/matches">View all</Link>
            </div>

            {recentMatches.length === 0 ? (
              <div className="dashboard-empty">
                <p>No match results yet.</p>

                <Link className="dashboard-action-link" to="/matches">
                  Run your first match
                </Link>
              </div>
            ) : (
              <div className="recent-match-list">
                {recentMatches.map((match) => (
                  <article key={match.id} className="recent-match-item">
                    <div>
                      <strong>{match.matchScore}% match</strong>

                      <p>Confidence: {match.confidence}</p>
                    </div>

                    <div className="recent-match-meta">
                      <span>{match.matchingSkills.length} matched skills</span>

                      <span>{match.missingSkills.length} missing skills</span>
                    </div>
                  </article>
                ))}
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
              <span>Store a job description for matching.</span>
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
