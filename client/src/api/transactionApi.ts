import api from "./axiosInstance";

export interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: "income" | "expense";
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const transactionApi = {
  getAll: async (filters: TransactionFilters = {}) => {
    const { data } = await api.get("/transactions", { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  create: async (payload: Omit<Transaction, "_id" | "createdAt" | "updatedAt">) => {
    const { data } = await api.post("/transactions", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Transaction>) => {
    const { data } = await api.put(`/transactions/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },

  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const { data } = await api.get("/transactions/summary", { params });
    return data;
  },
};
