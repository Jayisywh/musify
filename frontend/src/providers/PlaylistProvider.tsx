import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createPlaylist as createPlaylistApi,
  getMyPlaylists as getMyPlaylistsApi,
  updatePlaylist as updatePlaylistApi,
  deletePlaylist as deletePlaylistApi,
  addSongToPlaylist as addSongToPlaylistApi,
} from "../lib/playlistApi";

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    songs: number;
  };
}

interface PlaylistContextType {
  playlists: Playlist[];
  loading: boolean;
  error: string;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (
    body:
      | FormData
      | {
          title?: string;
          description?: string;
          coverUrl?: string;
          isPublic?: boolean;
        },
  ) => Promise<Playlist | null>;
  updatePlaylist: (
    playlistId: string,
    body:
      | FormData
      | {
          title?: string;
          description?: string | null;
          coverUrl?: string | null;
          isPublic?: boolean;
        },
  ) => Promise<Playlist | null>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined,
);

const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyPlaylistsApi();
      if (data.status === "success") {
        setPlaylists(data.data);
      } else {
        setError(data.message || "Failed to load playlists");
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      setError("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async (
    body:
      | FormData
      | {
          title?: string;
          description?: string;
          coverUrl?: string;
          isPublic?: boolean;
        },
  ) => {
    try {
      const data = await createPlaylistApi(body);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to create playlist");
      }
      setPlaylists((prev) => [data.data, ...prev]);
      return data.data;
    } catch (error) {
      console.error("Failed to create playlist:", error);
      return null;
    }
  };

  const updatePlaylist = async (
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
    try {
      const data = await updatePlaylistApi(playlistId, body);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to update playlist");
      }
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, ...data.data } : playlist,
        ),
      );
      return data.data;
    } catch (error) {
      console.error("Failed to update playlist:", error);
      return null;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    const previousPlaylists = playlists;
    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== playlistId),
    );
    try {
      const data = await deletePlaylistApi(playlistId);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to delete playlist");
      }
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      setPlaylists(previousPlaylists);
    }
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const data = await addSongToPlaylistApi(playlistId, songId);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to add song to playlist");
      }
      await fetchPlaylists();
      return true;
    } catch (error) {
      console.error("Failed to add song to playlist:", error);
      return false;
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        error,
        fetchPlaylists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context)
    throw new Error("usePlaylists must be used within Playlist Provider");
  return context;
};
