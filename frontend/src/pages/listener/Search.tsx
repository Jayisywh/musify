import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ListPlus,
  Music,
  Play,
  Search as SearchIcon,
  User,
} from "lucide-react";
import Header from "../../components/Header";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import { searchMusify } from "../../lib/searchApi";
import { usePlayer } from "../../providers/PlayerProvider";
import StateMessage from "./StateMessage";

interface SearchSong {
  id: string;
  title: string;
  genre: string | null;
  audioUrl: string;
  coverImgUrl: string | null;
  playCount: number;
  artist: {
    id: string;
    name: string | null;
    username: string | null;
  } | null;
}

interface SearchArtist {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface SearchAlbum {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  artist: {
    id: string;
    name: string | null;
    username: string | null;
  } | null;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<SearchSong[]>([]);
  const [artists, setArtists] = useState<SearchArtist[]>([]);
  const [albums, setAlbums] = useState<SearchAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(
    null,
  );

  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayer();

  const playerSongs = useMemo(() => {
    return songs.map((song) => ({
      id: song.id,
      title: song.title || "Untitled Song",
      artist: song.artist?.name || song.artist?.username || "Unknown Artist",
      artistId: song.artist?.id || "",
      coverUrl: song.coverImgUrl || "/default-cover.png",
      audioUrl: song.audioUrl,
    }));
  }, [songs]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setError("");
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await searchMusify(trimmedQuery);

        if (data.status === "success") {
          setSongs(Array.isArray(data.data.songs) ? data.data.songs : []);
          setArtists(Array.isArray(data.data.artists) ? data.data.artists : []);
          setAlbums(Array.isArray(data.data.albums) ? data.data.albums : []);
        } else {
          setError(data.message || "Search failed");
        }
      } catch (error) {
        console.error("Search failed:", error);
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

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

  const closeAddToPlaylist = () => {
    setAddToPlaylistSongId(null);
  };

  const hasQuery = query.trim().length > 0;
  const hasResults =
    songs.length > 0 || artists.length > 0 || albums.length > 0;

  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="px-6 pb-6">
          <h1 className="text-3xl font-bold text-white">Search</h1>

          <div className="relative mt-5 max-w-xl">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full rounded-full bg-white py-3 pl-12 pr-4 text-sm font-medium text-black outline-none placeholder:text-neutral-500"
            />
          </div>
        </div>
      </Header>

      <div className="px-6 py-5">
        {!hasQuery && (
          <div className="mt-10 text-center">
            <SearchIcon className="mx-auto h-14 w-14 text-neutral-600" />
            <h2 className="mt-4 text-2xl font-bold text-white">
              Search Musify
            </h2>
            <p className="mt-2 text-neutral-400">
              Find songs, artists, and albums.
            </p>
          </div>
        )}

        {loading && hasQuery && (
          <StateMessage
            type="loading"
            title="Searching..."
            message="Looking for songs, artists, and albums"
          />
        )}

        {error && !loading && (
          <StateMessage type="error" title="Search failed" message={error} />
        )}

        {!loading && hasQuery && !error && !hasResults && (
          <StateMessage
            type="empty"
            title="No results found"
            message="Try searching for another song, artist, or album"
          />
        )}

        {!loading && hasResults && (
          <div className="space-y-10">
            {songs.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-white">Songs</h2>

                <div className="space-y-1">
                  {songs.map((song, index) => {
                    const artistName =
                      song.artist?.name ||
                      song.artist?.username ||
                      "Unknown Artist";

                    const isCurrent = currentSong?.id === song.id;

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
                          alt={song.title || "Song cover"}
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

                          <Link
                            to={
                              song.artist?.id
                                ? `/artists/${song.artist.id}`
                                : "#"
                            }
                            onClick={(event) => event.stopPropagation()}
                            className="block truncate text-xs text-neutral-400 hover:underline"
                          >
                            {artistName}
                          </Link>
                        </div>

                        <p className="hidden w-24 text-sm text-neutral-400 md:block">
                          {song.genre || "Song"}
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

            {artists.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-white">Artists</h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  {artists.map((artist) => {
                    const artistName =
                      artist.name || artist.username || "Unknown Artist";

                    return (
                      <Link
                        key={artist.id}
                        to={`/artists/${artist.id}`}
                        className="block rounded-md bg-neutral-800 p-4 transition hover:bg-neutral-700"
                      >
                        {artist.avatarUrl ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artistName}
                            className="aspect-square w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center rounded-full bg-neutral-700">
                            <User className="h-16 w-16 text-neutral-500" />
                          </div>
                        )}

                        <p className="mt-4 truncate font-bold text-white">
                          {artistName}
                        </p>

                        <p className="text-sm text-neutral-400">Artist</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {albums.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-white">Albums</h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  {albums.map((album) => {
                    const artistName =
                      album.artist?.name ||
                      album.artist?.username ||
                      "Unknown Artist";

                    return (
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
                          {artistName}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AddToPlaylistModal
        isOpen={Boolean(addToPlaylistSongId)}
        onClose={closeAddToPlaylist}
        songId={addToPlaylistSongId}
      />
    </div>
  );
};

export default Search;
