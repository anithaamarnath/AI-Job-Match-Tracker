import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "../api/dashboardApi";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboardData,
  });
};