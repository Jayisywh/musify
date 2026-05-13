import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  editAlbumSchema,
  type EditAlbumInput,
} from "../../schema/album.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../lib/api";

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  isPublished: boolean;
}
const EditAlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [album, setAlbum] = useState<Album | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAlbumInput>({
    resolver: zodResolver(editAlbumSchema),
  });
  useEffect(() => {
    if (!id) return;
    const fetchAlbum = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get(`/api/albums/${id}`);
        const data = await res.json();
        if (data.status === "success") {
          setAlbum(data.data);
          reset({
            title: data.data.title,
            description: data.data.description || "",
            releaseDate: data.data.releaseDate
              ? data.data.releaseDate.split("T")[0]
              : "",
            isPublished: data.data.isPublished,
          });
        } else {
          setError("Album is not found");
        }
      } catch {
        setError("Failed to load album");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchAlbum();
  }, [id, reset]);
  const onSubmit = async (data: EditAlbumInput) => {
    if (!id) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    if (data.releaseDate) formData.append("releaseDate", data.releaseDate);
    formData.append("isPublished", String(data.isPublished));
    const coverFile = coverRef.current?.files?.[0];
    if (coverFile) formData.append("cover", coverFile);
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (result.status === "success") {
        navigate("/dashboard/albums");
      } else {
        setError(result.message || "Failed to update album");
      }
    } catch {
      setError("Network error, try again later");
    } finally {
      setLoading(false);
    }
  };
  const labelStyle = "block text-sm text-gray-400 mb-1";
  const inputStyle =
    "w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none";
  const inputErrorStyle = "text-red-400 text-sm mt-1";
  if (fetchLoading) return <p className="text-gray-400">Loading...</p>;
  if (!album)
    return <p className="text-red-400">{error || "Album is not found"}</p>;
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Album</h1>
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelStyle}>Title</label>
          <input {...register("title")} className={inputStyle} />
          {errors.title && (
            <p className={inputErrorStyle}>{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className={labelStyle}>Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className={labelStyle}>Release Date</label>
          <input
            {...register("isPublished")}
            type="checkbox"
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            {...register("isPublished")}
            type="checkbox"
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-400">
            Published (visible to listeners)
          </label>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <p className={labelStyle}>Current Cover</p>
          <img
            src={album.coverUrl || "/default-cover.png"}
            alt={album.title}
            className="w-32 h-32 object-cover rounded"
          />
        </div>
        <div>
          <label className={labelStyle}>Replace Cover (optional)</label>
          <input
            ref={coverRef}
            name="cover"
            type="file"
            accept="image/*"
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-500 file:text-black file:font-bold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-full hover:bg-green-400 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditAlbumPage;
