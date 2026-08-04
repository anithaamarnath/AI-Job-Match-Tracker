import { Link } from "react-router-dom";

import type { Resume } from "../types/resume";

interface ResumeCardProps {
  resume: Resume;
  isDeleting: boolean;
  isAnalyzing: boolean;
  onDelete: (resumeId: string) => void;
  onAnalyze: (resumeId: string) => void;
}

export const ResumeCard = ({
  resume,
  isDeleting,
  isAnalyzing,
  onDelete,
  onAnalyze,
}: ResumeCardProps) => {
  const createdDate = new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(resume.createdAt));

  return (
    <article className="resume-card">
      <div className="resume-card-header">
        <div>
          <p className="card-eyebrow">Uploaded {createdDate}</p>

          <h2 className="resume-title" title={resume.originalName}>
            {resume.originalName}
          </h2>
        </div>

        {resume.aiAtsScore !== null && (
          <div className="score-badge">
            <strong>{resume.aiAtsScore}</strong>
            <span>AI score</span>
          </div>
        )}
      </div>

      <div className="resume-card-body">
        <p className="resume-summary">
          {resume.aiProfessionalSummary ??
            "Run AI analysis to generate a professional summary and recommendations."}
        </p>

        {resume.aiMissingKeywords.length > 0 && (
          <div>
            <h3>Missing keywords</h3>

            <div className="tag-list">
              {resume.aiMissingKeywords.map((keyword) => (
                <span key={keyword} className="tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="resume-card-actions">
        <button
          type="button"
          onClick={() => onAnalyze(resume.id)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Run AI analysis"}
        </button>

        <Link to={`/resumes/${resume.id}`}>View details</Link>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(resume.id)}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
};
