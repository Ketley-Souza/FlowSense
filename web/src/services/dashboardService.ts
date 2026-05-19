import api from "./api";
import type { DashboardData } from "@/types";

export const dashboardService = {
  async obter(projetoId?: string): Promise<DashboardData> {
    const params = projetoId ? { projetoId } : {};
    const { data } = await api.get<DashboardData>("/dashboard", { params });
    return data;
  },
};
