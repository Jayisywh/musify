import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  audioUrl: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  setCurrentSong: (song: Song) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSongState] = useState<Song | null>(() => {
    const savedSong = localStorage.getItem("currentSong");

    if (!savedSong) return null;

    try {
      return JSON.parse(savedSong);
    } catch {
      return null;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const setCurrentSong = useCallback((song: Song) => {
    setCurrentSongState(song);
    localStorage.setItem("currentSong", JSON.stringify(song));
    setIsPlaying(true);
  }, []);
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying((prev) => !prev);
  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        setCurrentSong,
        togglePlay,
        play,
        pause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
