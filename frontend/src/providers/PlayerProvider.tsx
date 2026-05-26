import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

type RepeatMode = "off" | "one" | "all";

const PLAYER_STORAGE_KEY = "musify-player-state";

interface SavedPlayerState {
  currentSong: Song | null;
  songs: Song[];
  currentIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  songs: Song[];
  currentIndex: number;
  setCurrentSong: (song: Song, songList?: Song[]) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  queue: Song[];
  addQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
}

const getSavedPlayerStates = (): SavedPlayerState | null => {
  const savedState = localStorage.getItem(PLAYER_STORAGE_KEY);
  if (!savedState) return null;
  try {
    return JSON.parse(savedState);
  } catch {
    return null;
  }
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const savedPlayerState = getSavedPlayerStates();
  const [songs, setSongs] = useState<Song[]>(savedPlayerState?.songs || []);
  const [currentSong, setCurrentSongState] = useState<Song | null>(
    savedPlayerState?.currentSong || null,
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(
    savedPlayerState?.currentIndex || -1,
  );

  const [repeatMode, setRepeatMode] = useState<RepeatMode>(
    savedPlayerState?.repeatMode || "off",
  );
  const [isShuffle, setIsShuffle] = useState(
    savedPlayerState?.isShuffle || false,
  );

  const [queue, setQueue] = useState<Song[]>(savedPlayerState?.queue || []);
  useEffect(() => {
    console.log("Current queue:", queue);
  }, [queue]);

  const addQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const removeFromQueue = (songId: string) => {
    setQueue((prev) => prev.filter((song) => song.id !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const setCurrentSong = useCallback((song: Song, songList?: Song[]) => {
    if (songList && songList.length > 0) {
      setSongs(songList);

      const index = songList.findIndex((item) => item.id === song.id);
      setCurrentIndex(index);
    }

    setCurrentSongState(song);
    localStorage.setItem("currentSong", JSON.stringify(song));
    setIsPlaying(true);
  }, []);

  const play = () => setIsPlaying(true);

  const pause = () => setIsPlaying(false);

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying((prev) => !prev);
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrentSongState(nextSong);
      localStorage.setItem("currentSong", JSON.stringify(nextSong));
      setIsPlaying(true);
      return;
    }
    if (!songs.length) return;
    if (isShuffle && songs.length > 1) {
      let randomIndex = currentIndex;
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      const randomSong = songs[randomIndex];
      setCurrentIndex(randomIndex);
      setCurrentSongState(randomSong);
      localStorage.setItem("currentSong", JSON.stringify(randomSong));
      setIsPlaying(true);
      return;
    }

    const nextIndex =
      currentIndex === -1 || currentIndex === songs.length - 1
        ? 0
        : currentIndex + 1;
    const nextSong = songs[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentSongState(nextSong);
    localStorage.setItem("currentSong", JSON.stringify(nextSong));
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (!songs.length) return;

    const previousIndex =
      currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;

    const previousSong = songs[previousIndex];

    setCurrentIndex(previousIndex);
    setCurrentSongState(previousSong);
    localStorage.setItem("currentSong", JSON.stringify(previousSong));
    setIsPlaying(true);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "one";
      if (prev === "one") return "all";
      return "off";
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  useEffect(() => {
    const playerState = {
      currentSong,
      currentIndex,
      songs,
      repeatMode,
      isShuffle,
      queue,
    };
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerState));
  }, [currentIndex, currentSong, songs, repeatMode, isShuffle, queue]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        songs,
        currentIndex,
        setCurrentSong,
        togglePlay,
        play,
        pause,
        playNext,
        playPrevious,
        repeatMode,
        toggleRepeat,
        isShuffle,
        toggleShuffle,
        queue,
        addQueue,
        removeFromQueue,
        clearQueue,
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

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
};
