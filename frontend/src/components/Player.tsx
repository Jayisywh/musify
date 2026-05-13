import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../providers/PlayerProvider";

const Player = () => {
  const { currentSong, isPlaying, togglePlay, pause } = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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
  }, [currentSong, isPlaying, pause]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  return (
    <div className="h-22.5 bg-black px-4 grid grid-cols-3 items-center">
      {/* Left: current song */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onEnded={pause}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}
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
              className="ml-3 text-neutral-400 hover:text-white transition"
              aria-label="Like song"
            >
              <svg
                className="w-5 h-5"
                fill="none"
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
              <p className="text-neutral-600 text-xs">Nothing playing yet</p>
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
            className="text-neutral-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous song"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
            className="text-neutral-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next song"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6h2v12h-2V6zM6 18l8.5-6L6 6v12z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-[11px] text-neutral-500">
            {formatTime(currentTime)}
          </span>

          <div className="h-1 flex-1 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>

          <span className="text-[11px] text-neutral-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: volume */}
      <div className="flex items-center justify-end">
        <div className="hidden sm:flex items-center gap-2 w-32">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M16 9.5 20.5 14M20.5 9.5 16 14" />
          </svg>

          <div className="h-1 flex-1 bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
