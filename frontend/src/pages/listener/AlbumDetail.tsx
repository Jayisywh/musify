import { Link, useParams } from "react-router-dom";
import { usePlayer } from "../../providers/PlayerProvider";
import { useEffect, useMemo, useState } from "react";
import { getAlbumById } from "../../lib/albumApi";
import { Music, Play } from "lucide-react";
import Header from "../../components/Header";
import StateMessage from "./StateMessage";

interface AlbumSong {
  id: string;
  title: string;
  audioUrl: string;
  coverImgUrl: string | null;
  artist: {
    id: string;
    name: string | null;
    username: string;
  };
}

interface AlbumDetailData {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  artist: {
    id: string;
    name: string | null;
    username: string;
  };
  songs: AlbumSong[];
}

const AlbumDetail = () => {
  const { albumId } = useParams();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayer();
  const [album, setAlbum] = useState<AlbumDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const playerSongs = useMemo(() => {
    if (!album) return [];
    return album.songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist.name || song.artist.username,
      artistId: song.artist.id,
      coverUrl: song.coverImgUrl || album.coverUrl || "/default-cover.png",
      audioUrl: song.audioUrl,
    }));
  }, [album]);

  const fetchAlbum = async () => {
    if (!albumId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getAlbumById(albumId);
      if (data.status === "success") {
        setAlbum(data.data);
      } else {
        setError(data.message || "Failed to load album");
      }
    } catch (error) {
      console.error("Failed to fetch error:", error);
      setError("Failed to load album");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [albumId]);

  const handlePlayAlbum = () => {
    if (playerSongs.length === 0) return;
    setCurrentSong(playerSongs[0], playerSongs);
  };

  const handlePlaySong = (songId: string) => {
    const selectedSong = playerSongs.find((song) => song.id === songId);
    if (!selectedSong) return;

    const isCurrent = selectedSong?.id === currentSong?.id;
    if (isCurrent) {
      togglePlay();
      return;
    }
    setCurrentSong(selectedSong, playerSongs);
  };

  if (loading) {
    return (
      <StateMessage
        type="loading"
        title="Loading album..."
        message="Getting album details"
      />
    );
  }

  if (error || !album) {
    return (
      <StateMessage
        type="error"
        title="Album is not found"
        message={error || "This album may have been removed"}
      />
    );
  }
  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="h-44 w-44 rounded-md object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-md bg-neutral-800 shadow-xl">
              <Music className="h-20 w-20 text-neutral-500" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Album</p>

            <h1 className="mt-2 truncate text-5xl font-bold text-white md:text-7xl">
              {album.title}
            </h1>

            {album.description && (
              <p className="mt-4 max-w-2xl text-sm text-neutral-300">
                {album.description}
              </p>
            )}

            <p className="mt-4 text-sm text-neutral-300">
              <Link
                to={`/artists/${album.artist.id}`}
                className="font-semibold text-white hover:underline"
              >
                {album.artist.name || album.artist.username}
              </Link>{" "}
              • {album.songs.length} song{album.songs.length === 1 ? "" : "s"}
              {album.releaseDate
                ? ` • ${new Date(album.releaseDate).getFullYear()}`
                : ""}
            </p>
          </div>
        </div>
      </Header>

      <div className="px-6 py-5">
        <button
          type="button"
          disabled={album.songs.length === 0}
          onClick={handlePlayAlbum}
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Play album"
        >
          <Play className="ml-1 h-7 w-7" fill="currentColor" />
        </button>

        {album.songs.length === 0 ? (
          <StateMessage
            type="empty"
            title="No songs in this album yet"
            message="Songs added to this album will appear here"
          />
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[40px_minmax(0,1fr)_120px] gap-4 border-b border-neutral-800 px-4 py-2 text-sm text-neutral-400">
              <span>#</span>
              <span>Title</span>
              <span className="text-right">Play</span>
            </div>

            {album.songs.map((song, index) => {
              const artistName = song.artist.name || song.artist.username;
              const isCurrent = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  className="group grid grid-cols-[40px_minmax(0,1fr)_120px] items-center gap-4 rounded-md px-4 py-2 hover:bg-neutral-800"
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
                      src={
                        song.coverImgUrl ||
                        album.coverUrl ||
                        "/default-cover.png"
                      }
                      alt={song.title}
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${
                          isCurrent ? "text-green-500" : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>

                      <Link
                        to={`/artists/${song.artist.id}`}
                        className="truncate text-xs text-neutral-400 hover:underline"
                      >
                        {artistName}
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlaySong(song.id)}
                    className="justify-self-end text-sm font-bold text-neutral-400 hover:text-white"
                  >
                    Play
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;
