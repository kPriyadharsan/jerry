import axiosInstance from "./axiosInstance";

export const englishService = {
  analyzeAudio: async (audioData, mimeType, duration) => {
    const res = await axiosInstance.post("/english/analyze", { audioData, mimeType, duration });
    return res.data;
  },
  getHistory: async () => {
    const res = await axiosInstance.get("/english/history");
    return res.data;
  },
};

export default englishService;
