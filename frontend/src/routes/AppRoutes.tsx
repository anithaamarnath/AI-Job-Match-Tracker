import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/DashboardPage";
import { JobsPage } from "../pages/JobsPage";
import { MatchesPage } from "../pages/MatchesPage";
import { LoginPage } from "../pages/LoginPage";
import { ResumeDetailsPage } from "../pages/ResumeDetailsPage";
import { ResumesPage } from "../pages/ResumesPage";

import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/resumes" element={<ResumesPage />} />

          <Route path="/resumes/:id" element={<ResumeDetailsPage />} />

          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
