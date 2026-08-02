import type { Job } from "../types/job";
import { Link } from "react-router-dom";

interface JobCardProps {
  job: Job;
  isDeleting: boolean;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

export const JobCard = ({
  job,
  isDeleting,
  onEdit,
  onDelete,
}: JobCardProps) => {
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

      <div className="job-card-actions job-card-actions-three">
        <Link className="job-details-link" to={`/jobs/${job.id}`}>
          View details
        </Link>

        <button
          type="button"
          className="edit-button"
          onClick={() => onEdit(job)}
          disabled={isDeleting}
        >
          Edit job
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(job.id)}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete job"}
        </button>
      </div>
    </article>
  );
};
