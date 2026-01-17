import axios, { type AxiosInstance } from "axios";
import type {
  UserCreate,
  AuthResponse,
  ContributionCreate,
} from "./frontend_types";

const apiBase = import.meta.env.VITE_API_PROXY || "/api";

const api: AxiosInstance = axios.create({
  baseURL: apiBase,
  headers: { "Content-Type": "application/json" },
});

export const createUser = async (payload: UserCreate) => {
  const res = await api.post("/users", payload);
  return res.data;
};

export const authenticate = async (payload: {
  phoneNumber?: string;
  email?: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post("/auth", payload);
  return res.data;
};

export const getUser = async (id: string, token?: string) => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await api.get(`/users/${id}`, { headers });
  return res.data;
};

export const createContribution = async (payload: ContributionCreate) => {
  const res = await api.post("/contributions", payload);
  return res.data;
};

export const listContributions = async () => {
  const res = await api.get("/contributions");
  return res.data;
};

export const getContributionsTotal = async () => {
  const res = await api.get("/contributions/total");
  return res.data;
};

export const getContributors = async (token?: string) => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await api.get("/contributors", { headers });
  return res.data;
};

export const confirmContribution = async (id: string, token: string) => {
  const res = await api.post(
    `/contributions/${id}/confirm`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteContribution = async (id: string, token: string) => {
  const res = await api.delete(`/contributions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const logout = async (token?: string) => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await api.post("/auth/logout", {}, { headers });
  return res.data;
};

export default api;
