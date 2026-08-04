import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";

import { useJobs } from "../hooks/useJobs";
import { useCreateResumeJobMatch, useMatches } from "../hooks/useMatches";
import { useResumes } from "../hooks/useResume";

type ConfidenceFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH";

type ScoreFilter = "ALL" | "EXCELLENT" | "GOOD" | "AVERAGE" | "LOW";

type MatchSortOption = "NEWEST" | "OLDEST" | "HIGHEST_SCORE" | "LOWEST_SCORE";

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
  const ITEMS_PER_PAGE = 5;

  const createMatchMutation = useCreateResumeJobMatch();

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("ALL");

  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("ALL");

  const [sortOption, setSortOption] = useState<MatchSortOption>("NEWEST");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, confidenceFilter, scoreFilter, sortOption]);

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

  const filteredMatches = useMemo(() => {
    const matches = matchesQuery.data ?? [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = matches.filter((match) => {
      const resumeName = match.resume?.originalName?.toLowerCase() ?? "";

      const company = match.job?.company?.toLowerCase() ?? "";

      const role = match.job?.role?.toLowerCase() ?? "";

      const matchesSearch =
        !normalizedSearch ||
        resumeName.includes(normalizedSearch) ||
        company.includes(normalizedSearch) ||
        role.includes(normalizedSearch);

      const matchesConfidence =
        confidenceFilter === "ALL" || match.confidence === confidenceFilter;

      const matchesScore = (() => {
        switch (scoreFilter) {
          case "EXCELLENT":
            return match.matchScore >= 90;

          case "GOOD":
            return match.matchScore >= 70 && match.matchScore < 90;

          case "AVERAGE":
            return match.matchScore >= 50 && match.matchScore < 70;

          case "LOW":
            return match.matchScore < 50;

          case "ALL":
          default:
            return true;
        }
      })();

      return matchesSearch && matchesConfidence && matchesScore;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "OLDEST":
          return (
            new Date(first.createdAt ?? 0).getTime() -
            new Date(second.createdAt ?? 0).getTime()
          );

        case "HIGHEST_SCORE":
          return second.matchScore - first.matchScore;

        case "LOWEST_SCORE":
          return first.matchScore - second.matchScore;

        case "NEWEST":
        default:
          return (
            new Date(second.createdAt ?? 0).getTime() -
            new Date(first.createdAt ?? 0).getTime()
          );
      }
    });
  }, [
    matchesQuery.data,
    searchTerm,
    confidenceFilter,
    scoreFilter,
    sortOption,
  ]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMatches.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMatches = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredMatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMatches, safeCurrentPage]);

  const clearMatchFilters = () => {
    setSearchTerm("");
    setConfidenceFilter("ALL");
    setScoreFilter("ALL");
    setSortOption("NEWEST");
  };

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

            <span>
              {filteredMatches.length === 0
                ? "0 results"
                : `${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                    safeCurrentPage * ITEMS_PER_PAGE,
                    filteredMatches.length,
                  )} of ${filteredMatches.length}`}
            </span>
          </div>

          <section className="list-controls-panel">
            <div className="list-controls match-list-controls">
              <div className="form-field search-field">
                <label htmlFor="match-search">Search comparisons</label>

                <input
                  id="match-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search resume, company, or role..."
                />
              </div>

              <div className="form-field">
                <label htmlFor="confidence-filter">Confidence</label>

                <select
                  id="confidence-filter"
                  value={confidenceFilter}
                  onChange={(event) =>
                    setConfidenceFilter(event.target.value as ConfidenceFilter)
                  }
                >
                  <option value="ALL">All confidence</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="score-filter">Match score</label>

                <select
                  id="score-filter"
                  value={scoreFilter}
                  onChange={(event) =>
                    setScoreFilter(event.target.value as ScoreFilter)
                  }
                >
                  <option value="ALL">All scores</option>
                  <option value="EXCELLENT">Excellent: 90–100</option>
                  <option value="GOOD">Good: 70–89</option>
                  <option value="AVERAGE">Average: 50–69</option>
                  <option value="LOW">Low: below 50</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="match-sort">Sort by</label>

                <select
                  id="match-sort"
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as MatchSortOption)
                  }
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                  <option value="HIGHEST_SCORE">Highest score</option>
                  <option value="LOWEST_SCORE">Lowest score</option>
                </select>
              </div>

              <button
                type="button"
                className="clear-filters-button"
                onClick={clearMatchFilters}
                disabled={
                  !searchTerm &&
                  confidenceFilter === "ALL" &&
                  scoreFilter === "ALL" &&
                  sortOption === "NEWEST"
                }
              >
                Clear
              </button>
            </div>
          </section>

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

          {!matchesQuery.isPending &&
            !matchesQuery.isError &&
            filteredMatches.length === 0 && (
              <div className="empty-state">
                <h2>No matching comparisons</h2>

                <p>
                  Try changing your search, confidence, score, or sorting
                  options.
                </p>

                <button type="button" onClick={clearMatchFilters}>
                  Clear filters
                </button>
              </div>
            )}

          {filteredMatches.length > 0 && (
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
                  {paginatedMatches.map((match) => (
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
          {filteredMatches.length > ITEMS_PER_PAGE && (
            <nav className="pagination" aria-label="Match history pagination">
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
                  { length: totalPages },
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
    </AppShell>
  );
};
