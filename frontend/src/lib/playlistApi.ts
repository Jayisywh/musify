import { api } from "./api";

export const getMyPlaylists = async () => {
  const res = await api.get("/api/playlists");
  return res.json();
};

export const createPlaylist = async (
  body:
    | FormData
    | {
        title?: string;
        description?: string;
        coverUrl?: string;
        isPublic?: boolean;
      },
) => {
  const res = await api.post("/api/playlists", body);
  return res.json();
};

export const getPlaylistById = async (playlistId: string) => {
  const res = await api.get(`/api/playlists/${playlistId}`);
  return res.json();
};

export const updatePlaylist = async (
  playlistId: string,
  body:
    | FormData
    | {
        title?: string;
        description?: string | null;
        coverUrl?: string | null;
        isPublic?: boolean;
      },
) => {
  const res = await api.patch(`/api/playlists/${playlistId}`, body);
  return res.json();
};

export const deletePlaylist = async (playlistId: string) => {
  const res = await api.delete(`/api/playlists/${playlistId}`);
  return res.json();
};

export const addSongToPlaylist = async (playlistId: string, songId: string) => {
  const res = await api.post(
    `/api/playlists/${playlistId}/songs/${songId}`,
    {},
  );
  return res.json();
};

export const removeSongFromPlaylist = async (
  playlistId: string,
  songId: string,
) => {
  const res = await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
  return res.json();
};
