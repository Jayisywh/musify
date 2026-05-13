import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

interface Song {
  id: string;
  title: string;
  genre: string;
  description: string | null;
  coverImgUrl: string | null;
  audioUrl: string;
  language: string | null;
  playCount: number;
  releaseDate: string | null;
  artist: {
    id: string;
    name: string | null;
    username: string;
    avatarUrl: string | null;
  };
  album: {
    id: string;
    title: string;
    coverUrl: string | null;
  } | null;
}

const SongPage = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchSong = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/public/song/${id}`);
        const data = await res.json();
        if (data.status === "success") {
          setSong(data.data);
        } else {
          setError(data.message || "Song is not found");
        }
      } catch {
        setError("Failed to load song");
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  const handlePlay = async () => {
    if (hasPlayed) return;
    try {
      await api.get(`/api/public/songs/${id}/play`);
      setHasPlayed(true);
    } catch {
      console.log("Failed to record play");
    }
  };

  if (loading) return <p className="text-gray-400 p-4 md:p-8">Loading...</p>;
  if (error || !song)
    return (
      <p className="text-red-400 p-4 md:p-8">{error || "Song is not found"}</p>
    );

  return (
    <div className="bg-neutral-900 min-h-full p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
        <img
          src={song.coverImgUrl || "/default-cover.png"}
          alt={song.title}
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-lg object-cover shadow-2xl mx-auto sm:mx-0"
        />
        <div className="flex flex-col justify-end text-center sm:text-left">
          <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
            {song.genre}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
            {song.title}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base flex-wrap">
            <img
              src={song.artist.avatarUrl || "/default-avatar.png"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            />
            <Link
              to={`/artists/${song.artist.id}`}
              className="hover:underline hover:text-white"
            >
              {song.artist.name || song.artist.username}
            </Link>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {song.playCount.toLocaleString()} plays
            </span>
          </div>
          <span className="sm:hidden text-gray-400 text-xs mt-1">
            {song.playCount.toLocaleString()} plays
          </span>
        </div>
      </div>{" "}
      {/* ← HERO SECTION CLOSES HERE */}
      {/* ✅ AUDIO PLAYER — separate section below hero */}
      <div className="mb-6 sm:mb-8">
        <audio
          ref={audioRef}
          src={song.audioUrl}
          controls
          className="w-full h-10 sm:h-12"
          onPlay={handlePlay}
        />
      </div>
      {/* ✅ DESCRIPTION — below audio */}
      {song.description && (
        <p className="text-gray-400 text-sm sm:text-base mb-4">
          {song.description}
        </p>
      )}
      {/* ✅ ALBUM CARD — separate section */}
      {song.album && (
        <div className="bg-neutral-800 p-3 sm:p-4 rounded-lg flex items-center gap-3 sm:gap-4 max-w-full">
          <img
            src={song.album.coverUrl || "/default-cover.png"}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm">From the album</p>
            <Link
              to={`/albums/${song.album.id}`}
              className="text-white font-bold text-sm sm:text-base hover:underline truncate block"
            >
              {song.album.title}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongPage;
