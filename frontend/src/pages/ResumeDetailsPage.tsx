import { Link, useParams } from "react-router-dom";

import { AppShell } from "../components/AppShell";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import {
  useGenerateAIAnalysis,
  useResume,
  useSavedAIAnalysis,
} from "../hooks/useResume";
import { ResumePreview } from "../components/ResumePreview";

export const ResumeDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();

  const resumeQuery = useResume(id);

  const hasSavedAnalysis =
    resumeQuery.data?.aiAtsScore !== null &&
    resumeQuery.data?.aiAtsScore !== undefined;

  const analysisQuery = useSavedAIAnalysis(id, hasSavedAnalysis);

  const analysisMutation = useGenerateAIAnalysis();

  if (resumeQuery.isPending) {
    return (
      <AppShell>
        <LoadingState message="Loading resume..." />
      </AppShell>
    );
  }

  if (resumeQuery.isError || !resumeQuery.data) {
    return (
      <AppShell>
        <ErrorState
          message="Unable to load this resume."
          onRetry={() => {
            void resumeQuery.refetch();
          }}
        />
      </AppShell>
    );
  }

  const resume = resumeQuery.data;
  const analysis = analysisMutation.data ?? analysisQuery.data;

  return (
    <AppShell>
      <main className="page-container">
        <Link to="/resumes">← Back to resumes</Link>

        <header className="page-header">
          <p className="page-eyebrow">Resume details</p>

          <h2 className="resume-title" title={resume.originalName}>
            {resume.originalName}
          </h2>

          <p>
            Uploaded{" "}
            {new Intl.DateTimeFormat("en-CA", {
              dateStyle: "medium",
            }).format(new Date(resume.createdAt))}
          </p>
        </header>

        <section className="resume-overview-section">
          <article className="resume-card resume-overview-card">
            <h2>Resume overview</h2>

            <dl>
              <div>
                <dt>Rule-based ATS score</dt>
                <dd>{resume.atsScore ?? "Not analyzed"}</dd>
              </div>

              <div>
                <dt>AI provider</dt>
                <dd>{resume.aiProvider ?? "Not analyzed"}</dd>
              </div>

              <div>
                <dt>AI ATS score</dt>
                <dd>{resume.aiAtsScore ?? "Not analyzed"}</dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={analysisMutation.isPending}
              onClick={() => {
                analysisMutation.mutate(id);
              }}
            >
              {analysisMutation.isPending
                ? "Analyzing..."
                : "Run mock AI analysis"}
            </button>
          </article>
        </section>

        <ResumePreview resumeId={resume.id} fileName={resume.originalName} />

        {analysis && (
          <section className="resume-analysis-section">
            <article className="resume-card resume-analysis-card">
              <h2>AI analysis</h2>

              <h3>Professional summary</h3>
              <p>{analysis.professionalSummary}</p>

              <h3>Improved summary</h3>
              <p>{analysis.improvedSummary}</p>

              <h3>Strengths</h3>
              <ul>
                {analysis.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3>Weaknesses</h3>
              <ul>
                {analysis.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3>Missing keywords</h3>
              <div className="tag-list">
                {analysis.missingKeywords.map((keyword) => (
                  <span className="tag" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>

              <h3>Recommendations</h3>
              <ul>
                {analysis.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        )}
      </main>
    </AppShell>
  );
};
