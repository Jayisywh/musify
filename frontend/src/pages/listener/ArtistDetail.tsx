import { Link, useParams } from "react-router-dom";
import { usePlayer } from "../../providers/PlayerProvider";
import { useEffect, useMemo, useState } from "react";
import { getArtistById } from "../../lib/artistApi";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import { ListPlus, Music, Play, User } from "lucide-react";
import Header from "../../components/Header";
import StateMessage from "./StateMessage";

interface ArtistSong {
  id: string;
  title: string;
  genre: string | null;
  audioUrl: string;
  coverImgUrl: string | null;
  playCount: number;
  duration?: number | null;
  createdAt?: string;
  artist: {
    id: string;
    name: string | null;
    username: string | null;
  } | null;
  album?: {
    id: string;
    title: string;
    coverUrl: string | null;
  } | null;
}

interface ArtistAlbum {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  _count?: {
    songs: number;
  };
}

interface ArtistDetailData {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  songs: ArtistSong[];
  albums: ArtistAlbum[];
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayer();
  const [artist, setArtist] = useState<ArtistDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (!id) return;
    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getArtistById(id);
        if (data.status === "success") {
          setArtist(data.data);
        } else {
          setError(data.message || "Failed to load artist");
        }
      } catch (error) {
        console.error("Failed to fetch artists:", error);
        setError("Failed to load artist");
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const playerSongs = useMemo(() => {
    if (!artist) return [];
    return artist.songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist?.name || song.artist?.username || "Unknown artist",
      artistId: song.artist?.id || artist.id,
      coverUrl: song.coverImgUrl || "/default-cover.png",
      audioUrl: song.audioUrl,
    }));
  }, [artist]);

  const handlePlaySong = (songId: string) => {
    const selectedSong = playerSongs.find((song) => song.id === songId);
    if (!selectedSong) return;
    const isCurrent = currentSong?.id === selectedSong.id;
    if (isCurrent) {
      togglePlay();
      return;
    }
    setCurrentSong(selectedSong, playerSongs);
  };

  const handlePlayArtist = () => {
    if (playerSongs.length === 0) return;
    const firstSong = playerSongs[0];
    const isCurrent = currentSong?.id === firstSong.id;
    if (isCurrent) {
      togglePlay();
      return;
    }
    setCurrentSong(firstSong, playerSongs);
  };
  if (loading) {
    return (
      <StateMessage
        type="loading"
        title="Loading artist..."
        message="Getting artist profile"
      />
    );
  }
  if (error || !artist) {
    return (
      <StateMessage
        type="error"
        title="Artist not found"
        message={error || "This artist does not exist"}
      />
    );
  }
  const artistName = artist.name || artist.username || "Unknown artist";
  const hasSongs = artist.songs.length > 0;
  const hasAlbums = artist.albums.length > 0;
  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt={artistName}
              className="h-44 w-44 rounded-full object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-neutral-800 shadow-xl">
              <User className="h-20 w-20 text-neutral-500" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Artist</p>

            <h1 className="mt-2 truncate text-5xl font-bold text-white md:text-7xl">
              {artistName}
            </h1>

            <p className="mt-4 text-sm text-neutral-300">
              @{artist.username || "unknown"} • {artist.songs.length} songs •{" "}
              {artist.albums.length} albums
            </p>

            {artist.bio && (
              <p className="mt-3 max-w-2xl text-sm text-neutral-400">
                {artist.bio}
              </p>
            )}
          </div>
        </div>
      </Header>

      <div className="px-6 py-5">
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={handlePlayArtist}
            disabled={!hasSongs}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Play artist"
          >
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </button>
        </div>

        {!hasSongs ? (
          <StateMessage
            type="empty"
            title="No songs yet"
            message="This artist has no published songs yet"
          />
        ) : (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Popular</h2>

            <div className="space-y-1">
              {artist.songs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const songArtistName =
                  song.artist?.name ||
                  song.artist?.username ||
                  "Unknown Artist";

                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song.id)}
                    className="group flex cursor-pointer items-center gap-4 rounded-md px-4 py-2 hover:bg-neutral-800"
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePlaySong(song.id);
                      }}
                      className="w-8 text-neutral-400 group-hover:text-white"
                      aria-label="Play song"
                    >
                      {isCurrent && isPlaying ? (
                        <span className="text-sm text-green-500">▶</span>
                      ) : (
                        <>
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                          <Play className="hidden h-4 w-4 group-hover:block" />
                        </>
                      )}
                    </button>

                    <img
                      src={song.coverImgUrl || "/default-cover.png"}
                      alt={song.title}
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/songs/${song.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className={`block truncate text-sm font-medium hover:underline ${
                          isCurrent ? "text-green-500" : "text-white"
                        }`}
                      >
                        {song.title || "Untitled Song"}
                      </Link>

                      <p className="truncate text-xs text-neutral-400">
                        {songArtistName}
                      </p>
                    </div>

                    <p className="hidden w-28 text-sm text-neutral-400 md:block">
                      {song.playCount.toLocaleString()} plays
                    </p>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setAddToPlaylistSongId(song.id);
                      }}
                      className="text-neutral-400 transition hover:text-white"
                      aria-label="Add to playlist"
                    >
                      <ListPlus className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!hasSongs && (
          <div className="rounded-lg bg-neutral-800 p-5 text-neutral-400">
            This artist has no published songs yet.
          </div>
        )}

        {hasAlbums && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-white">Albums</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {artist.albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/albums/${album.id}`}
                  className="block rounded-md bg-neutral-800 p-4 transition hover:bg-neutral-700"
                >
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-neutral-700">
                      <Music className="h-16 w-16 text-neutral-500" />
                    </div>
                  )}

                  <p className="mt-4 truncate font-bold text-white">
                    {album.title || "Untitled Album"}
                  </p>

                  <p className="truncate text-sm text-neutral-400">
                    {album._count?.songs || 0} songs
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <AddToPlaylistModal
        isOpen={Boolean(addToPlaylistSongId)}
        onClose={() => setAddToPlaylistSongId(null)}
        songId={addToPlaylistSongId}
      />
    </div>
  );
};

export default ArtistDetail;
