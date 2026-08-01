import { useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useJobs } from "../hooks/useJobs";
import { useMatches, useCreateResumeJobMatch } from "../hooks/useMatches";
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

  return (
    <AppShell>
      <main className="page-container">
        <header className="page-header">
          <p className="page-eyebrow">Match workspace</p>

          <h1>Match a resume to a job</h1>

          <p>
            Choose one saved resume and one saved job to calculate alignment,
            missing skills, and recommendations.
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

        {createMatchMutation.data && (
          <section className="match-result-card">
            <div className="match-score-block">
              <strong>{createMatchMutation.data.matchScore}%</strong>

              <span>Match score</span>
            </div>

            <div>
              <h2>Confidence</h2>

              <span className="match-confidence">
                {createMatchMutation.data.confidence}
              </span>
            </div>

            <div>
              <h2>Missing skills</h2>

              {createMatchMutation.data.missingSkills.length > 0 ? (
                <div className="tag-list">
                  {createMatchMutation.data.missingSkills.map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No missing skills detected.</p>
              )}
            </div>

            <div>
              <h2>Missing skills</h2>

              <div className="tag-list">
                {createMatchMutation.data.missingSkills.map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2>Recommendations</h2>

              <ul>
                {createMatchMutation.data.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section>
          <div className="section-heading">
            <h2>Match history</h2>

            <span>{matchesQuery.data?.length ?? 0} total</span>
          </div>

          {matchesQuery.isPending && (
            <LoadingState message="Loading match history..." />
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
              <h2>No matches yet</h2>
              <p>Run your first resume-job match.</p>
            </div>
          )}

          {matchesQuery.data && matchesQuery.data.length > 0 && (
            <div className="match-history-grid">
              {matchesQuery.data.map((match) => (
                <article key={match.id} className="match-history-card">
                  <div className="match-score-block">
                    <strong>{match.matchScore}%</strong>
                    <span>Match score</span>
                  </div>

                  <p>
                    Confidence: <strong>{match.confidence}</strong>
                  </p>

                  <p>Matching skills: {match.matchingSkills.length}</p>

                  <p>Missing skills: {match.missingSkills.length}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
};
