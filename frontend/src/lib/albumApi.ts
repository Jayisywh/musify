import { api } from "./api";

export const getAlbumById = async (albumId: string) => {
  const res = await api.get(`/api/albums/${albumId}`);
  return res.json();
};
