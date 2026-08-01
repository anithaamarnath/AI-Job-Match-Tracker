import type { Job } from "../types/job";

interface JobCardProps {
  job: Job;
  isDeleting: boolean;
  onDelete: (jobId: string) => void;
}

export const JobCard = ({ job, isDeleting, onDelete }: JobCardProps) => {
  const createdDate = new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(job.createdAt));

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <p className="card-eyebrow">Saved {createdDate}</p>

          <h2 className="job-title">{job.role}</h2>

          <p className="job-company">{job.company}</p>
        </div>

        <span className="job-status">{job.status}</span>
      </div>

      <p className="job-description">{job.description}</p>

      <div className="job-card-actions">
        <button
          type="button"
          className="danger-button"
          disabled={isDeleting}
          onClick={() => onDelete(job.id)}
        >
          {isDeleting ? "Deleting..." : "Delete job"}
        </button>
      </div>
    </article>
  );
};
