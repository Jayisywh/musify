import { useEffect, useRef, useState } from "react";
import { ListMusic, Repeat, Repeat1, Shuffle } from "lucide-react";
import { usePlayer } from "../providers/PlayerProvider";
import { useLikedSongs } from "../providers/LikedSongsProvider";

const Player = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    pause,
    playPrevious,
    playNext,
    repeatMode,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    queue,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  const { isSongLiked, toggleLikedSong } = useLikedSongs();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Load new audio file when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) return;

    audio.load();
  }, [currentSong]);

  // Play / pause control
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Audio failed", error);
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong, pause]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Mute control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }

    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);

    setVolume(newVolume);

    if (newVolume > 0) {
      setIsMuted(false);
    }

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleSongEnd = () => {
    if (repeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (repeatMode === "all") {
      playNext();
      return;
    }

    pause();
  };

  return (
    <>
      <div className="relative">
        <div className="h-22.5 bg-black px-4 grid grid-cols-3 items-center">
          {currentSong && (
            <audio
              ref={audioRef}
              src={currentSong.audioUrl}
              onEnded={handleSongEnd}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
                setCurrentTime(0);
              }}
            />
          )}

          {/* Left: current song */}
          <div className="flex items-center gap-3 min-w-0">
            {currentSong ? (
              <>
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 object-cover rounded"
                />

                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-neutral-400 text-xs truncate">
                    {currentSong.artist}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!currentSong}
                  onClick={() => {
                    if (!currentSong) return;
                    toggleLikedSong(currentSong.id);
                  }}
                  className={`ml-3 transition disabled:opacity-40 ${
                    isLiked
                      ? "text-green-500"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label={isLiked ? "Unlike song" : "Like song"}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded bg-neutral-800" />

                <div className="min-w-0">
                  <p className="text-neutral-400 text-sm font-medium">
                    Select a song
                  </p>
                  <p className="text-neutral-600 text-xs">
                    Nothing playing yet
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Center: player controls */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                disabled={!currentSong}
                onClick={toggleShuffle}
                className={`transition disabled:opacity-30 disabled:cursor-not-allowed ${isShuffle ? "text-green-500" : "text-neutral-400 hover:text-white"}`}
                aria-label="Shuffle"
              >
                <Shuffle className="size-4" />
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={playPrevious}
                className="text-neutral-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous song"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
                </svg>
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={playNext}
                className="text-neutral-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next song"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 6h2v12h-2V6zM6 18l8.5-6L6 6v12z" />
                </svg>
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={toggleRepeat}
                className={`transition disabled:opacity-30 disabled:cursor-not-allowed ${
                  repeatMode !== "off"
                    ? "text-green-500"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Repeat"
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="size-4" />
                ) : (
                  <Repeat className="size-4" />
                )}
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={() => setIsQueueOpen((prev) => !prev)}
                className={`relative transition disabled:opacity-30 disabled:cursor-not-allowed ${isQueueOpen || queue.length > 0 ? "text-green-500" : "text-neutral-400 hover:text-white"}`}
                aria-label="Open Queue"
              >
                <ListMusic className="size-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-green-500 text-black text-[10px] font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-[11px] text-neutral-500">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={!currentSong}
                style={{
                  background: `linear-gradient(to right, white ${progressPercent}%, #404040 ${progressPercent}%)`,
                }}
                className="flex-1 accent-white cursor-pointer disabled:cursor-not-allowed player-slider"
              />

              <span className="text-[11px] text-neutral-500">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: volume */}
          <div className="flex items-center justify-end">
            <div className="hidden sm:flex items-center gap-2 w-32">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white hover:text-neutral-300 transition"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                    <path d="M16 9.5 20.5 14M20.5 9.5 16 14" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  background: `linear-gradient(to right, white ${volumePercent}%, #404040 ${volumePercent}%)`,
                }}
                className="w-full accent-white cursor-pointer player-slider"
              />
            </div>
          </div>
        </div>
        {isQueueOpen && (
          <div className="absolute bottom-24 right-4 w-80 max-h-96 overflow-y-auto rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl p-4 z-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Queue</h3>
              <button
                type="button"
                onClick={clearQueue}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            {queue.length === 0 ? (
              <p className="text-sm text-neutral-500">No songs in queue</p>
            ) : (
              <div className="space-y-3">
                {queue.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-800"
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {song.artist}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(song.id)}
                        className="text-xs text-neutral-400 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Player;
