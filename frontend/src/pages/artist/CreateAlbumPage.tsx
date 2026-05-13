import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  createAlbumSchema,
  type CreateAlbumInput,
} from "../../schema/album.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../lib/api";

const CreateAlbumPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const coverRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAlbumInput>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: {
      title: "",
      description: "",
      releaseDate: "",
    },
  });
  const onSubmit = async (data: CreateAlbumInput) => {
    const coverFile = coverRef.current?.files?.[0];
    if (!coverFile) {
      setError("Cover image is required");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    if (data.releaseDate) formData.append("releaseDate", data.releaseDate);
    formData.append("cover", coverFile);
    try {
      const res = await api.post("/api/albums", formData);
      const data = await res.json();
      if (data.status === "success") {
        navigate("/dashboard/albums");
      } else {
        setError(data.message || "Failed to create an album");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Create New Album</h1>
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
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Description
          </label>
          <textarea
            {...register("releaseDate")}
            rows={3}
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Release Date
          </label>
          <input
            {...register("releaseDate")}
            type="date"
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Cover Image
          </label>
          <input
            ref={coverRef}
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
          {loading ? "Creating..." : "Create Album"}
        </button>
      </form>
    </div>
  );
};

export default CreateAlbumPage;
