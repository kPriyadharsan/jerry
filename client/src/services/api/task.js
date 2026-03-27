import axiosInstance from "./axiosInstance";

export const taskService = {
  updateProgress: async (data) => {
    const res = await axiosInstance.post("/task", data);
    return res.data;
  },
  getTodayStatus: async () => {
    const res = await axiosInstance.get("/task/status");
    return res.data;
  },
};

export default taskService;
