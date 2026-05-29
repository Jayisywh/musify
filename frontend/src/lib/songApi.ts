import { api } from "./api";

export const getSongById = async (songId: string) => {
  const data = await api.get(`/api/public/songs/${songId}`);
  return data.json();
};

export const recordSongPlay = async (songId: string) => {
  const res = await api.patch(`/api/public/songs/${songId}/play`, {});
  return res.json();
};
