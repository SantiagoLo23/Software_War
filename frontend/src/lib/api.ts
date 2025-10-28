import axios from "axios";
import type {
  User,
  LoginResponse,
  Victim,
  Feedback,
  CreateVictimDto,
  CreateFeedbackDto,
} from "@/types";

const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { username, password }),

  signup: (username: string, password: string, role: string) =>
    api.post<User>("/users/signup", { username, password, role }),
};

export const usersAPI = {
  getAll: () => api.get<User[]>("/users"),

  getMe: () => api.get<User>("/users/me"),

  getById: (id: string) => api.get<User>(`/users/${id}`),

  getLeaderboard: () => api.get<User[]>("/users/leaderboard"),

  getVictims: () => api.get<User[]>("/users/victims"),

  getDevelopers: () => api.get<User[]>("/users/developers"),

  getAvailable: () => api.get<User[]>("/users/available"),

  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  assignReward: (id: string, reward: string) =>
    api.patch<User>(`/users/${id}/reward`, { reward }),
};

export const victimsAPI = {
  create: (data: CreateVictimDto) => api.post<Victim>("/victims/create", data),

  getAll: () => api.get<Victim[]>("/victims"),

  getById: (id: string) => api.get<Victim>(`/victims/${id}`),

  update: (id: string, data: Partial<Victim>) =>
    api.patch<Victim>(`/victims/${id}`, data),

  delete: (id: string) => api.delete(`/victims/${id}`),
};

export const feedbackAPI = {
  create: (data: CreateFeedbackDto) => api.post<Feedback>("/feedback", data),

  getResistanceTips: () => api.get<Feedback[]>("/feedback/resistance-tips"),

  getSurvivalStories: () => api.get<Feedback[]>("/feedback/survival-stories"),

  getSlaveActivityReports: () =>
    api.get<Feedback[]>("/feedback/slave-activity-reports"),

  getById: (id: string) => api.get<Feedback>(`/feedback/${id}`),

  vote: (id: string, voteType: "upvote" | "downvote") =>
    api.patch<Feedback>(`/feedback/${id}/vote`, { voteType }),
};

export default api;
