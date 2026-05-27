import { api } from "./api";

export const getSongById = async (songId: string) => {
  const data = await api.get(`/api/public/songs/${songId}`);
  return data.json();
};
