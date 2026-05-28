import { useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "../../providers/PlayerProvider";
import { usePlaylists } from "../../providers/PlaylistProvider";
import { useEffect, useMemo, useState } from "react";
import { getPlaylistById, removeSongFromPlaylist } from "../../lib/playlistApi";
import Header from "../../components/Header";
import { Music, Pencil, Play, Trash2 } from "lucide-react";
import EditPlaylistModal from "../../components/EditPlaylistModal";
import StateMessage from "./StateMessage";

interface PlaylistSongItem {
  id: string;
  addedAt: string;
  song: {
    id: string;
    title: string;
    audioUrl: string;
    coverImgUrl: string | null;
    duration?: number | null;
    artist: {
      id: string;
      name: string | null;
      username: string;
    };
  };
}

interface PlaylistDetailData {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    username: string;
    name: string | null;
  };
  songs: PlaylistSongItem[];
}

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayer();
  const { fetchPlaylists, deletePlaylist } = usePlaylists();
  const [playlist, setPlaylist] = useState<PlaylistDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const playerSongs = useMemo(() => {
    if (!playlist) return [];
    return playlist.songs.map((item) => ({
      id: item.song.id,
      title: item.song.title,
      artist: item.song.artist.name || item.song.artist.username,
      artistId: item.song.artist.id,
      coverUrl: item.song.coverImgUrl || "/deafult-cover.png",
      audioUrl: item.song.audioUrl,
    }));
  }, [playlist]);

  const fetchPlaylist = async () => {
    if (!playlistId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getPlaylistById(playlistId);
      if (data.status === "success") {
        setPlaylist(data.data);
      } else {
        setError(data.message || "Failed to load playlist");
      }
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
      setError("Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const handlePlaySong = (songId: string) => {
    const selectedSong = playerSongs.find((song) => song.id === songId);
    if (!selectedSong) return;
    const isCurrentSong = currentSong?.id === selectedSong.id;
    if (isCurrentSong) {
      togglePlay();
      return;
    }
    setCurrentSong(selectedSong, playerSongs);
  };

  const handlePlaylist = () => {
    if (playerSongs.length === 0) return;
    setCurrentSong(playerSongs[0], playerSongs);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !playlistId) return;
    const previousPlaylist = playlist;
    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter((item) => item.song.id !== songId),
    });
    try {
      const data = await removeSongFromPlaylist(playlistId, songId);
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to remove song");
      }
      await fetchPlaylists();
    } catch (error) {
      console.error("Failed to remove song from playlist:", error);
      setPlaylist(previousPlaylist);
    }
  };

  const handlePlaylistUpdated = async (updatedPlaylist: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
  }) => {
    setPlaylist((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        title: updatedPlaylist.title,
        description: updatedPlaylist.description,
        coverUrl: updatedPlaylist.coverUrl,
      };
    });
    await fetchPlaylist();
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    const confirmed = window.confirm(
      `Delete "${playlist.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    await deletePlaylist(playlist.id);
    await fetchPlaylist();
    navigate("/");
  };

  if (loading) {
    return (
      <StateMessage
        type="loading"
        title="Loading playlist..."
        message="Getting playlist details"
      />
    );
  }
  if (error || !playlist) {
    return (
      <StateMessage
        type="error"
        title="Playlist is not found"
        message={error || "This playlist may have been deleted"}
      />
    );
  }
  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end">
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.title}
              className="h-44 w-44 rounded-md object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-md bg-neutral-800 shadow-xl">
              <Music className="size-20 text-neutral-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Playlist</p>
            <h1 className="mt-2 truncate text-5xl font-bold text-white">
              {playlist.title}
            </h1>
            {playlist.description && (
              <p className="mt-4 max-w-2xl text-sm text-neutral-300">
                {playlist.description}
              </p>
            )}
            <p className="mt-4 text-sm text-neutral-300">
              {playlist.owner.name || playlist.owner.username} •{" "}
              {playlist.songs.length} song
              {playlist.songs.length === 1 ? "" : "s"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-500 px-4 py-2 text-sm font-bold text-white transition hover:border-white"
              >
                <Pencil className="size-4" />
                Edit details
              </button>
              <button
                type="button"
                onClick={handleDeletePlaylist}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-500 px-4 py-2 text-sm font-bold text-white transition hover:border-white"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </Header>
      <div className="px-6 py-5">
        <button
          type="button"
          disabled={playlist.songs.length === 0}
          onClick={handlePlaylist}
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Play playlist"
        >
          <Play className="ml-1 h-7 w-7" fill="currentColor" />
        </button>
        {playlist.songs.length === 0 ? (
          <StateMessage
            type="empty"
            title="No songs in this playlist yet"
            message="Add songs from Home, Search, or Song pages"
          />
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[40px_minmax(0,1fr)_140px_80px] gap-4 border-b border-neutral-800 px-4 py-2 text-sm text-neutral-400">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Added</span>
              <span className="text-right">Action</span>
            </div>
            {playlist.songs.map((item, index) => {
              const song = item.song;
              const artistName = song.artist.name || song.artist.username;
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={item.id}
                  className="group grid grid-cols-[40px_minmax(0,1fr)_140px_80px] items-center gap-4 rounded-md px-4 py-2 hover:bg-neutral-800"
                >
                  <button
                    type="button"
                    onClick={() => handlePlaySong(song.id)}
                    className="text-neutral-400 group-hover:text-white"
                    aria-label="Play song"
                  >
                    {isCurrent && isPlaying ? (
                      <span className="text-sm text-green-500">▶</span>
                    ) : (
                      <>
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="hidden h-4 w-4 group-hover:block" />
                      </>
                    )}
                  </button>
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={song.coverImgUrl || "/default-cover.png"}
                      alt={song.title}
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${isCurrent ? "text-green-500" : "text-white"}`}
                      >
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {artistName}
                      </p>
                    </div>
                  </div>
                  <p className="hidden text-sm text-neutral-400 md:block">
                    {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveSong(song.id)}
                    className="justify-self-end text-neutral-400 transition hover:text-red-400"
                    aria-label="Remove song from playlist"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <EditPlaylistModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        playlist={{
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          coverUrl: playlist.coverUrl,
        }}
        onUpdated={handlePlaylistUpdated}
      />
    </div>
  );
};

export default PlaylistDetail;
