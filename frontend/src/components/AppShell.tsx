import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-eyebrow">AI Career Tools</p>
          <h1 className="brand-title">Job Match</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>

          <NavLink to="/resumes">Resumes</NavLink>
        </nav>

        <button
          className="secondary-button"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <div className="app-content">{children}</div>
    </div>
  );
};
