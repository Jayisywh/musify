import { api } from "./api";

export const getLikedSongs = async () => {
  const res = await api.get("/api/likedsongs");
  return res.json();
};

export const checkLikedSongs = async (songId: string) => {
  const res = await api.get(`/api/likedsongs/${songId}/check`);
  return res.json();
};

export const likeSong = async (songId: string) => {
  const res = await api.post(`/api/likedsongs/${songId}`, {});
  return res.json();
};

export const unLikeSong = async (songId: string) => {
  const res = await api.delete(`/api/likedsongs/${songId}`);
  return res.json();
};
