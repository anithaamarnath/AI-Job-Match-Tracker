export interface DashboardLatestResume {
  id: string;
  originalName: string;
  atsScore: number | null;
  createdAt: string;
}

export interface DashboardBestMatch {
  id: string;
  matchScore: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;

  resume: {
    id: string;
    originalName: string;
  };

  job: {
    id: string;
    company: string;
    role: string;
  };
}

export interface DashboardData {
  totalResumes: number;
  totalJobs: number;
  totalMatches: number;
  latestResume: DashboardLatestResume | null;
  bestMatch: DashboardBestMatch | null;
}