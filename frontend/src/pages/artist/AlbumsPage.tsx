import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
}

const AlbumsPage = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const loadAlbums = async () => {
    try {
      const res = await api.get("/api/albums");
      const data = await res.json();
      if (data.status === "success") {
        setAlbums(data.data);
      }
    } catch {
      console.error("Failed to load albums");
    } finally {
      setLoading(false);
    }
  };
  const deleteAlbums = async (id: string) => {
    try {
      const res = await api.delete(`/api/albums/${id}`);
      if (res.status === 204) {
        setAlbums(albums.filter((a) => a.id !== id));
      }
    } catch {
      console.log("Failed to delete album");
    }
  };
  useEffect(() => {
    loadAlbums();
  }, []);
  if (loading) return <p className="text-gray-400">Loading...</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Albums</h1>
        <Link
          to="/dashboard/albums/new"
          className="bg-green-500 text-black px-4 py-2 rounded-full font-bold hover:bg-green-400"
        >
          {" "}
          + Create Album
        </Link>
      </div>
      {albums.length === 0 ? (
        <p className="text-gray-400">No albums yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-gray-900 rounded-lg overflow-hidden"
            >
              <img
                src={album.coverUrl || "/default-cover.png"}
                alt={album.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold truncate">{album.title}</h3>
                <p className="text-gray-400 text-sm line-champ-2 mt-1">
                  {album.description || "No description"}
                </p>
                <div className="flex gap-3 mt-3 text-sm">
                  <Link
                    to={`/dashboard/albums/${album.id}/edit`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteAlbums(album.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;
