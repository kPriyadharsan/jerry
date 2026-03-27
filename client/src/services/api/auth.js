import axiosInstance from "./axiosInstance";

export const authService = {
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await axiosInstance.post("/auth/register", userData);
    return res.data;
  },
  me: async () => {
    const res = await axiosInstance.get("/users/me");
    return res.data;
  },
};

export default authService;
