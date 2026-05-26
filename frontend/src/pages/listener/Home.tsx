import { useEffect, useState } from "react";
import Header from "../../components/Header";
import ListItem from "../../components/ListItem";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import { usePlayer } from "../../providers/PlayerProvider";
import { ListPlus } from "lucide-react";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";

interface Song {
  id: string;
  title: string;
  genre: string;
  coverImgUrl: string | null;
  artist: { name: string | null; id: string; username: string };
  audioUrl: string;
  playCount: number;
}

const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentSong, setCurrentSong, isPlaying, togglePlay, addQueue } =
    usePlayer();
  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/public/songs?limit=50");
        const data = await res.json();
        if (data.status === "success") {
          setSongs(data.data);
        }
      } catch {
        setError("Failed to load songs");
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);
  const handlePlay = (song: Song) => {
    const isCurrentSong = currentSong?.id === song.id;
    if (isCurrentSong) {
      togglePlay();
      return;
    }
    const playerSongs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist.name || song.artist.username,
      artistId: song.artist.id,
      coverUrl: song.coverImgUrl || "/default-cover.png",
      audioUrl: song.audioUrl,
    }));
    const selectedSong = playerSongs.find((item) => item.id === song.id);
    if (!selectedSong) return;
    setCurrentSong(selectedSong, playerSongs);
  };

  const openAddToPlaylist = (songId: string) => {
    setAddToPlaylistSongId(songId);
  };

  const closeAddToPlaylist = () => {
    setAddToPlaylistSongId(null);
  };
  return (
    <div className="bg-neutral-900 h-full w-full rounded-lg overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2">
          <h1 className="text-white text-3xl font-semibold">Welcome back</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4">
            <ListItem image="/liked-song.jpg" name="Liked Songs" href="liked" />
          </div>
        </div>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Newest Songs</h1>
        </div>
        {loading ? (
          <p className="text-gray-400 mt-4">Loading songs...</p>
        ) : error ? (
          <p className="text-red-500 mt-4">{error}</p>
        ) : songs.length === 0 ? (
          <p className="text-gray-400 mt-4">No songs available yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {songs.map((song) => {
              const isCurrent = currentSong?.id === song.id;

              const playerSong = {
                id: song.id,
                title: song.title,
                artist: song.artist.name || song.artist.username,
                artistId: song.artist.id,
                coverUrl: song.coverImgUrl || "/default-cover.png",
                audioUrl: song.audioUrl,
              };
              return (
                <div
                  key={song.id}
                  onClick={() => handlePlay(song)}
                  className="bg-neutral-800 p-3 rounded-md hover:bg-neutral-700 transition group cursor-pointer"
                >
                  <div className="relative mb-3">
                    <img
                      src={song.coverImgUrl || "/default-cover.png"}
                      alt={song.title}
                      className="w-full aspect-square rounded-md object-cover"
                    />
                    <div
                      className={`absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all ${isPlaying && isCurrent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}`}
                    >
                      {isPlaying && isCurrent ? (
                        <svg
                          className="w-5 h-5 text-black"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-black ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/songs/${song.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-white truncate block hover:underline"
                  >
                    {song.title}
                  </Link>
                  <Link
                    to={`/artists/${song.artist.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-gray-400 text-sm truncate block hover:text-shadow-white"
                  >
                    {song.artist.name || song.artist.username}
                  </Link>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addQueue(playerSong);
                      }}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      <ListPlus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylist(song.id);
                      }}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Add to playlist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div>List of song</div>
      </div>
      <AddToPlaylistModal
        isOpen={Boolean(addToPlaylistSongId)}
        onClose={closeAddToPlaylist}
        songId={addToPlaylistSongId}
      />
    </div>
  );
};

export default Home;
