import { apiClient } from "./client";

import type { ApiResponse } from "../types/api";
import type { DashboardData } from "../types/dashboard";

export const getDashboardData =
  async (): Promise<DashboardData> => {
    const response =
      await apiClient.get<ApiResponse<DashboardData>>(
        "/dashboard"
      );

    return response.data.data;
  };