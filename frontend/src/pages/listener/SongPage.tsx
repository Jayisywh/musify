import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, ListPlus, Music, Play, Plus } from "lucide-react";
import { api } from "../../lib/api";
import Header from "../../components/Header";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import { usePlayer } from "../../providers/PlayerProvider";
import { useLikedSongs } from "../../providers/LikedSongsProvider";
import StateMessage from "./StateMessage";

interface Song {
  id: string;
  title: string;
  genre: string | null;
  description?: string | null;
  coverImgUrl: string | null;
  audioUrl: string;
  language: string | null;
  playCount: number;
  releaseDate: string | null;
  createdAt?: string;
  artist: {
    id: string;
    name: string | null;
    username: string | null;
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

  const { currentSong, isPlaying, setCurrentSong, togglePlay, addQueue } =
    usePlayer();

  const { isSongLiked, toggleLikedSong } = useLikedSongs();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSong = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/api/public/songs/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          setSong(data.data);
        } else {
          setError(data.message || "Song is not found");
        }
      } catch (error) {
        console.error("Failed to fetch song:", error);
        setError("Failed to load song");
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  const playerSong = song
    ? {
        id: song.id,
        title: song.title || "Untitled Song",
        artist: song.artist?.name || song.artist?.username || "Unknown Artist",
        artistId: song.artist?.id || "",
        coverUrl: song.coverImgUrl || "/default-cover.png",
        audioUrl: song.audioUrl,
      }
    : null;

  const handlePlay = async () => {
    if (!playerSong) return;

    const isCurrent = currentSong?.id === playerSong.id;

    if (isCurrent) {
      togglePlay();
      return;
    }

    setCurrentSong(playerSong, [playerSong]);
  };

  const handleAddQueue = () => {
    if (!playerSong) return;
    addQueue(playerSong);
  };

  if (loading) {
    return (
      <StateMessage
        type="loading"
        title="Loading song..."
        message="Getting the song details"
      />
    );
  }

  if (error || !song || !playerSong) {
    return (
      <StateMessage
        type="error"
        title="Song not found"
        message={error || "This song may have been removed or unpublished"}
      />
    );
  }

  const artistName =
    song.artist?.name || song.artist?.username || "Unknown Artist";

  const isCurrent = currentSong?.id === song.id;
  const isLiked = isSongLiked(song.id);

  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end">
          {song.coverImgUrl ? (
            <img
              src={song.coverImgUrl}
              alt={song.title}
              className="h-44 w-44 rounded-md object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-md bg-neutral-800 shadow-xl">
              <Music className="h-20 w-20 text-neutral-500" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Song</p>

            <h1 className="mt-2 truncate text-5xl font-bold text-white md:text-7xl">
              {song.title || "Untitled Song"}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-neutral-300">
              {song.artist?.avatarUrl && (
                <img
                  src={song.artist.avatarUrl}
                  alt={artistName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}

              <Link
                to={`/artists/${song.artist.id}`}
                className="font-semibold text-white hover:underline"
              >
                {artistName}
              </Link>

              <span>•</span>
              <span>{song.genre || "Unknown genre"}</span>
              <span>•</span>
              <span>{song.playCount.toLocaleString()} plays</span>
            </p>

            {song.album && (
              <p className="mt-2 text-sm text-neutral-400">
                Album:{" "}
                <Link
                  to={`/albums/${song.album.id}`}
                  className="text-white hover:underline"
                >
                  {song.album.title}
                </Link>
              </p>
            )}
          </div>
        </div>
      </Header>

      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105"
            aria-label="Play song"
          >
            {isCurrent && isPlaying ? (
              <span className="text-xl font-bold">Ⅱ</span>
            ) : (
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleLikedSong(song.id)}
            className={`transition hover:scale-105 ${
              isLiked ? "text-green-500" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Like song"
          >
            <Heart
              className="h-8 w-8"
              fill={isLiked ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsAddToPlaylistOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-4 py-2 text-sm font-bold text-white transition hover:border-white"
          >
            <ListPlus className="h-5 w-5" />
            Add to playlist
          </button>

          <button
            type="button"
            onClick={handleAddQueue}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-4 py-2 text-sm font-bold text-white transition hover:border-white"
          >
            <Plus className="h-5 w-5" />
            Queue
          </button>
        </div>

        {song.description && (
          <p className="mt-8 max-w-2xl text-sm text-neutral-400">
            {song.description}
          </p>
        )}

        {song.album && (
          <div className="mt-8 max-w-md rounded-lg bg-neutral-800 p-4">
            <p className="mb-3 text-sm text-neutral-400">From the album</p>

            <Link
              to={`/albums/${song.album.id}`}
              className="flex items-center gap-4"
            >
              <img
                src={song.album.coverUrl || "/default-cover.png"}
                alt={song.album.title}
                className="h-16 w-16 rounded object-cover"
              />

              <div className="min-w-0">
                <p className="truncate font-bold text-white hover:underline">
                  {song.album.title}
                </p>
                <p className="text-sm text-neutral-400">Album</p>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-8 max-w-2xl rounded-lg bg-neutral-800/60 p-5">
          <h2 className="text-xl font-bold text-white">About this song</h2>

          <div className="mt-4 space-y-2 text-sm text-neutral-300">
            <p>
              <span className="text-neutral-500">Artist:</span>{" "}
              <Link
                to={`/artists/${song.artist.id}`}
                className="text-white hover:underline"
              >
                {artistName}
              </Link>
            </p>

            <p>
              <span className="text-neutral-500">Genre:</span>{" "}
              {song.genre || "Unknown"}
            </p>

            <p>
              <span className="text-neutral-500">Language:</span>{" "}
              {song.language || "Unknown"}
            </p>

            <p>
              <span className="text-neutral-500">Plays:</span>{" "}
              {song.playCount.toLocaleString()}
            </p>

            {song.releaseDate && (
              <p>
                <span className="text-neutral-500">Released:</span>{" "}
                {new Date(song.releaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        songId={song.id}
      />
    </div>
  );
};

export default SongPage;
