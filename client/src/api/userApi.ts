import api from "./axiosInstance";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  companyId: string;
  createdAt: string;
}

export const userApi = {
  getAll: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (payload: { name: string; email: string; password: string; role: string }) => {
    const { data } = await api.post("/users", payload);
    return data;
  },

  update: async (id: string, payload: Partial<UserProfile>) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
