import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

interface Song {
  id: string;
  title: string;
  genre: string;
  coverImgUrl: string | null;
  audioUrl: string;
  album: { id: string; title: string } | null;
  createdAt: string;
}

const SongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const loadSongs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/songs");
      const data = await res.json();
      if (data.status === "success") setSongs(data.data);
    } catch {
      console.log("Failed to load");
    } finally {
      setLoading(false);
    }
  };
  const deleteSong = async (id: string) => {
    try {
      const res = await api.delete(`/api/songs/${id}`);
      if (res.status === 204) setSongs(songs.filter((s) => s.id !== id));
    } catch {
      console.log("Failed to delete");
    }
  };
  useEffect(() => {
    loadSongs();
  }, []);
  if (loading) return <p className="text-gray-400">Loading...</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>My Songs</h1>
        <Link
          to="/dashboard/songs/new"
          className="bg-green-500 text-black px-4 py-2 rounded-full font-bold hover:bg-green-400"
        >
          + Upload Song
        </Link>
      </div>
      {songs.length === 0 ? (
        <p className="text-gray-400">No songs yet. Upload your first track!</p>
      ) : (
        <div className="grid gap-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="bg-gray-900 p-4 rounded-lg flex items-center gap-4"
            >
              <img
                src={song.coverImgUrl || "/default-cover.png"}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{song.title}</h3>
                <p className="text-gray-400 text-sm">{song.genre}</p>
                {song.album && (
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                    {song.album.title}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  to={`/dashboard/songs/${song.id}/edit`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Edit
                </Link>
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => deleteSong(song.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongsPage;
