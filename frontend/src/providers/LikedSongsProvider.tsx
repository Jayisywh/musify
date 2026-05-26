import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getLikedSongs, likeSong, unLikeSong } from "../lib/likedSongApi";

interface LikedSong {
  id: string;
  addedAt: string;
  song: {
    id: string;
    title: string;
    audioUrl: string;
    coverImgUrl: string | null;
    artist: {
      id: string;
      name: string | null;
      username: string;
    };
  };
}

interface LikedSongContextType {
  likedSongs: LikedSong[];
  likedSongsIds: string[];
  loading: boolean;
  error: string;
  fetchLikedSongs: () => Promise<void>;
  isSongLiked: (songId: string) => boolean;
  toggleLikedSong: (songId: string) => Promise<void>;
  removeLikedSong: (songId: string) => Promise<void>;
}

const LikedSongsContext = createContext<LikedSongContextType | undefined>(
  undefined,
);

const LikedSongsProvider = ({ children }: { children: ReactNode }) => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [likedSongsIds, setLikedSongsIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLikedSongs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLikedSongs();
      if (data.status === "success") {
        setLikedSongs(data.data);
        const ids = data.data.map((likedSong: LikedSong) => likedSong.song.id);
        setLikedSongsIds(ids);
      } else {
        setError(data.message || "Failed to load liked songs");
      }
    } catch (error) {
      console.error("Failed to fetch liked songs:", error);
      setError("Failed to fetch liked songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const isSongLiked = (songId: string) => {
    return likedSongsIds.includes(songId);
  };

  const removeLikedSong = async (songId: string) => {
    const previousLikedSongs = likedSongs;
    const previousLikedSongsIds = likedSongsIds;
    setLikedSongs((prev) =>
      prev.filter((likedSong) => likedSong.song.id !== songId),
    );
    setLikedSongsIds((prev) => prev.filter((id) => id !== songId));
    try {
      const data = await unLikeSong(songId);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to unlike song");
      }
    } catch (error) {
      console.error("Failed to unlike song:", error);
      setLikedSongs(previousLikedSongs);
      setLikedSongsIds(previousLikedSongsIds);
    }
  };

  const toggleLikedSong = async (songId: string) => {
    const alreadyLiked = isSongLiked(songId);
    if (alreadyLiked) {
      await removeLikedSong(songId);
      return;
    }
    const previousLikedSongs = likedSongs;
    const previousLikedSongsIds = likedSongsIds;
    setLikedSongsIds((prev) => [...prev, songId]);
    try {
      const data = await likeSong(songId);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to like song");
      }
      await fetchLikedSongs();
    } catch (error) {
      console.error("Failed to like song:", error);
      setLikedSongs(previousLikedSongs);
      setLikedSongsIds(previousLikedSongsIds);
    }
  };
  return (
    <LikedSongsContext.Provider
      value={{
        likedSongs,
        likedSongsIds,
        loading,
        error,
        fetchLikedSongs,
        isSongLiked,
        toggleLikedSong,
        removeLikedSong,
      }}
    >
      {children}
    </LikedSongsContext.Provider>
  );
};

export default LikedSongsProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useLikedSongs = () => {
  const context = useContext(LikedSongsContext);
  if (!context) {
    throw new Error("useLikedSongs must be used within LikedSongsProvider");
  }
  return context;
};
