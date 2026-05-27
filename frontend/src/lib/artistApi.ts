import { api } from "./api";

export const getArtistById = async (artistId: string) => {
  const res = await api.get(`/api/public/artists/${artistId}`);
  return res.json();
};
