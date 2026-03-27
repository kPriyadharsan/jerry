import axiosInstance from "./axiosInstance";

export const chatService = {
  sendMessage: async (message) => {
    const res = await axiosInstance.post("/chat", { message });
    return res.data;
  },
  getHistory: async () => {
    const res = await axiosInstance.get("/chat/history");
    return res.data;
  },
};

export default chatService;
