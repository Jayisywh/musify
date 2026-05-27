import { api } from "./api";

export const searchMusify = async (query: string) => {
  const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
  return res.json();
};
