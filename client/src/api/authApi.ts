import api from "./axiosInstance";

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};
