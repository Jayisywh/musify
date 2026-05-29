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
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.load();
  }, [currentSong]);

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }

    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);

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
    <div className="relative bg-black">
      <div className="h-[92px] px-3 py-2 md:px-4">
        <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,2fr)_minmax(120px,1fr)]">
          {currentSong && (
            <audio
              ref={audioRef}
              src={currentSong.audioUrl}
              onEnded={handleSongEnd}
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
              onLoadedMetadata={(event) => {
                setDuration(event.currentTarget.duration);
                setCurrentTime(0);
              }}
            />
          )}

          {/* Left song info */}
          <div className="flex min-w-0 items-center gap-3">
            {currentSong ? (
              <>
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="h-12 w-12 shrink-0 rounded object-cover md:h-14 md:w-14"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentSong.title}
                  </p>
                  <p className="truncate text-xs text-neutral-400">
                    {currentSong.artist}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!currentSong}
                  onClick={() => toggleLikedSong(currentSong.id)}
                  className={`hidden shrink-0 transition disabled:opacity-40 sm:block ${
                    isLiked
                      ? "text-green-500"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label={isLiked ? "Unlike song" : "Like song"}
                >
                  <svg
                    className="h-5 w-5"
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
                <div className="h-12 w-12 shrink-0 rounded bg-neutral-800 md:h-14 md:w-14" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-400">
                    Select a song
                  </p>
                  <p className="truncate text-xs text-neutral-600">
                    Nothing playing yet
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Center controls */}
          <div className="flex min-w-0 flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-6">
              <button
                type="button"
                disabled={!currentSong}
                onClick={toggleShuffle}
                className={`hidden transition disabled:cursor-not-allowed disabled:opacity-30 sm:block ${
                  isShuffle
                    ? "text-green-500"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Shuffle"
              >
                <Shuffle className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={playPrevious}
                className="text-neutral-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous song"
              >
                <svg
                  className="h-5 w-5"
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
                  </svg>
                ) : (
                  <svg
                    className="ml-0.5 h-5 w-5"
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
                className="text-neutral-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next song"
              >
                <svg
                  className="h-5 w-5"
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
                className={`hidden transition disabled:cursor-not-allowed disabled:opacity-30 sm:block ${
                  repeatMode !== "off"
                    ? "text-green-500"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Repeat"
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                disabled={!currentSong}
                onClick={() => setIsQueueOpen((prev) => !prev)}
                className={`relative hidden transition disabled:cursor-not-allowed disabled:opacity-30 sm:block ${
                  isQueueOpen || queue.length > 0
                    ? "text-green-500"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Open Queue"
              >
                <ListMusic className="h-4 w-4" />

                {queue.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-black">
                    {queue.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex w-full max-w-[240px] items-center gap-2 sm:max-w-md">
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
                className="player-slider min-w-0 flex-1 cursor-pointer accent-white disabled:cursor-not-allowed"
              />

              <span className="text-[11px] text-neutral-500">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right volume */}
          <div className="hidden items-center justify-end md:flex">
            <div className="flex w-32 items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white transition hover:text-neutral-300"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                    <path d="M16 9.5 20.5 14M20.5 9.5 16 14" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
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
                className="player-slider w-full cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      </div>

      {isQueueOpen && (
        <div className="absolute bottom-[100px] right-3 z-50 max-h-80 w-[calc(100vw-24px)] overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-4 shadow-xl [scrollbar-width:none] sm:right-4 sm:w-80 md:bottom-24 [&::-webkit-scrollbar]:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">Queue</h3>

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
                    className="h-10 w-10 rounded object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{song.title}</p>
                    <p className="truncate text-xs text-neutral-400">
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
  );
};

export default Player;
