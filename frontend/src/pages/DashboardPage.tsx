import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") ?? "null") as {
    name?: string;
  } | null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <main>
      <h1>AI Job Match Dashboard</h1>

      <p>Welcome, {user?.name ?? "User"}.</p>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
};
