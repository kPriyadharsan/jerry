import axiosInstance from "./axiosInstance";

export const geminiService = {
  proxyChat: async (prompt) => {
    const res = await axiosInstance.post("/gemini/chat", { prompt });
    return res.data;
  },
  proxyAnalysis: async (prompt) => {
    const res = await axiosInstance.post("/gemini/analysis", { prompt });
    return res.data;
  },
};

export default geminiService;
