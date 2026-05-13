import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  uploadSongSchema,
  type UploadSongInput,
} from "../../schema/song.schema";
import { api } from "../../lib/api";

interface Album {
  id: string;
  title: string;
}

const UploadSongPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);

  const audioRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadSongInput>({
    resolver: zodResolver(uploadSongSchema),
  });
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setAlbumLoading(true);
        const res = await api.get("/api/albums");
        const data = await res.json();
        if (data.status === "success") {
          setAlbums(data.data);
        }
      } catch {
        console.error("Failed to load albums");
      } finally {
        setAlbumLoading(false);
      }
    };
    loadAlbums();
  }, []);
  const onSubmit = async (data: UploadSongInput) => {
    const audioFile = audioRef.current?.files?.[0];
    const imageFile = imageRef.current?.files?.[0];
    if (!audioFile) {
      setError("Audio file is required");
      return;
    }
    if (!imageFile) {
      setError("Image file is required");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("genre", data.genre);
    formData.append("duration", String(data.duration));
    if (data.albumId && data.albumId !== "")
      formData.append("albumId", data.albumId);
    formData.append("audio", audioFile);
    formData.append("image", imageFile);
    try {
      const res = await api.post("/api/songs", formData);
      const data = await res.json();
      if (data.status === "success") {
        navigate("/dashboard/songs");
      } else {
        setError(data.message || "Upload failed");
      }
    } catch {
      setError("Network error, try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Upload New Song</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            {...register("title")}
            name="title"
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Genre</label>
          <input
            {...register("genre")}
            className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
          />
          {errors.genre && (
            <p className="text-red-400 text-sm mt-1">{errors.genre.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Duration (seconds)
          </label>
          <input
            {...register("duration")}
            className="w-full p-2.5 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:outline-none"
          />
          {errors.duration && (
            <p className="text-red-400 text-sm mt-1">
              {errors.duration.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Album <span className="text-gray-600">(optional)</span>
          </label>
          <select
            {...register("albumId")}
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
            disabled={albumLoading}
          >
            <option value="">No album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          {albumLoading && (
            <p className="text-gray-500 text-sm mt-1">Loading albums...</p>
          )}
          {albums.length === 0 && !albumLoading && (
            <p className="text-gray-500 text-sm mt-1">
              No albums yet
              <a
                href="/dashboard/albums/new"
                className="text-green-400 hover:underline"
              >
                Create one
              </a>
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Audio File</label>
          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-2 file:rounded-full file:border-0 file:bg-green-500 file:text-black file:font-bold"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Image File</label>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-500 file:text-black file:font-bold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-full hover:bg-green-400 disabled:opacity-50 mt-2"
        >
          {loading ? "Uploading..." : "Upload Song"}
        </button>
      </form>
    </div>
  );
};

export default UploadSongPage;
