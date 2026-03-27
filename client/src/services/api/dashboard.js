import axiosInstance from "./axiosInstance";

export const dashboardService = {
  getSummary: async () => {
    const res = await axiosInstance.get("/dashboard");
    return res.data;
  },
};

export default dashboardService;
