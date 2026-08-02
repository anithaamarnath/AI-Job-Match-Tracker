import { useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useJobs } from "../hooks/useJobs";
import { useCreateResumeJobMatch, useMatches } from "../hooks/useMatches";
import { useResumes } from "../hooks/useResume";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "The request could not be completed."
    );
  }

  return "An unexpected error occurred.";
};

export const MatchesPage = () => {
  const resumesQuery = useResumes();
  const jobsQuery = useJobs();
  const matchesQuery = useMatches();
  const createMatchMutation = useCreateResumeJobMatch();

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [message, setMessage] = useState("");

  const handleMatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeId || !jobId) {
      setMessage("Select both a resume and a job.");
      return;
    }

    try {
      setMessage("");

      await createMatchMutation.mutateAsync({
        resumeId,
        jobId,
      });

      setMessage("Resume and job matched successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const isLoading = resumesQuery.isPending || jobsQuery.isPending;

  const isError = resumesQuery.isError || jobsQuery.isError;

  const latestResult = createMatchMutation.data;

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header">
          <p className="page-eyebrow">Match workspace</p>

          <h1>Resume and job match</h1>

          <p>
            Choose a resume and a saved job to compare skills, identify gaps,
            and review recommendations.
          </p>
        </header>

        {isLoading && <LoadingState message="Loading resumes and jobs..." />}

        {isError && (
          <ErrorState
            message="Unable to load resumes or jobs."
            onRetry={() => {
              void resumesQuery.refetch();
              void jobsQuery.refetch();
            }}
          />
        )}

        {!isLoading && !isError && (
          <section className="match-form-panel">
            <form className="match-form" onSubmit={handleMatch}>
              <div className="form-field">
                <label htmlFor="resumeId">Resume</label>

                <select
                  id="resumeId"
                  value={resumeId}
                  onChange={(event) => setResumeId(event.target.value)}
                >
                  <option value="">Select a resume</option>

                  {resumesQuery.data?.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.originalName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="jobId">Job</label>

                <select
                  id="jobId"
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                >
                  <option value="">Select a job</option>

                  {jobsQuery.data?.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.company} — {job.role}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={createMatchMutation.isPending}>
                {createMatchMutation.isPending ? "Matching..." : "Run match"}
              </button>
            </form>
          </section>
        )}

        {message && (
          <p className="status-message" role="status">
            {message}
          </p>
        )}

        {latestResult && (
          <section className="current-match-section">
            <div className="current-match-header">
              <div>
                <p className="page-eyebrow">Current result</p>

                <h2>Match report</h2>
              </div>

              <span
                className={`confidence-badge confidence-${latestResult.confidence.toLowerCase()}`}
              >
                {latestResult.confidence} confidence
              </span>
            </div>

            <div className="current-match-grid">
              <article className="current-score-card">
                <strong>{latestResult.matchScore}%</strong>

                <span>Overall match</span>
              </article>

              <article className="match-detail-card">
                <h3>Matching skills</h3>

                {latestResult.matchingSkills.length > 0 ? (
                  <div className="tag-list">
                    {latestResult.matchingSkills.map((skill) => (
                      <span className="tag match-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No matching skills detected.</p>
                )}
              </article>

              <article className="match-detail-card">
                <h3>Missing skills</h3>

                {latestResult.missingSkills.length > 0 ? (
                  <div className="tag-list">
                    {latestResult.missingSkills.map((skill) => (
                      <span className="tag missing-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No missing skills detected.</p>
                )}
              </article>

              <article className="match-detail-card recommendations-card">
                <h3>Recommendations</h3>

                <ul>
                  {latestResult.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        )}

        <section className="previous-matches-section">
          <div className="section-heading">
            <div>
              <p className="page-eyebrow">Previous comparisons</p>

              <h2>Recent match reports</h2>
            </div>

            <span>{matchesQuery.data?.length ?? 0} total</span>
          </div>

          {matchesQuery.isPending && (
            <LoadingState message="Loading previous matches..." />
          )}

          {matchesQuery.isError && (
            <ErrorState
              message={getErrorMessage(matchesQuery.error)}
              onRetry={() => {
                void matchesQuery.refetch();
              }}
            />
          )}

          {matchesQuery.data?.length === 0 && (
            <div className="empty-state">
              <h2>No previous comparisons</h2>

              <p>Run your first resume-job match.</p>
            </div>
          )}

          {matchesQuery.data && matchesQuery.data.length > 0 && (
            <div className="match-table-wrapper">
              <table className="match-table">
                <thead>
                  <tr>
                    <th>Resume</th>
                    <th>Job</th>
                    <th>Score</th>
                    <th>Confidence</th>
                    <th>Matched</th>
                    <th>Missing</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {matchesQuery.data.map((match) => (
                    <tr key={match.id}>
                      <td>{match.resume?.originalName ?? "Resume"}</td>

                      <td>
                        {match.job
                          ? `${match.job.company} — ${match.job.role}`
                          : "Job"}
                      </td>

                      <td>
                        <strong>{match.matchScore}%</strong>
                      </td>

                      <td>
                        <span
                          className={`confidence-badge confidence-${match.confidence.toLowerCase()}`}
                        >
                          {match.confidence}
                        </span>
                      </td>

                      <td>{match.matchingSkills.length}</td>

                      <td>{match.missingSkills.length}</td>

                      <td>
                        {match.createdAt
                          ? new Intl.DateTimeFormat("en-CA", {
                              dateStyle: "medium",
                            }).format(new Date(match.createdAt))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
};
