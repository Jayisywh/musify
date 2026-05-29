import { api } from "./api";

export const getMyAccount = async () => {
  const res = await api.get("/api/auth/me");
  return res.json();
};
