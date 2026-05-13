import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { editSongSchema, type EditSongInput } from "../../schema/song.schema";
import { api } from "../../lib/api";

interface Song {
  id: string;
  title: string;
  genre: string;
  duration: number;
  description: string | null;
  language: string | null;
  isPublished: boolean;
  coverImgUrl: string | null;
  audioUrl: string;
  albumId: string | null;
}

const EditSongPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [song, setSong] = useState<Song | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSongSchema),
  });
  useEffect(() => {
    if (!id) return;
    const fetchSong = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get(`/api/songs/${id}`);
        const data = await res.json();
        if (data.status === "success") {
          setSong(data.data);
          reset({
            title: data.data.title,
            genre: data.data.genre,
            duration: data.data.duration,
            description: data.data.description || "",
            language: data.data.language || "",
            isPublished: data.data.isPublished,
          });
        } else {
          setError("Song is not found");
        }
      } catch {
        setError("Failed to load song");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSong();
  }, [id, reset]);
  const onSubmit = async (data: EditSongInput) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("genre", data.genre);
      formData.append("duration", String(data.duration));
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.language) {
        formData.append("language", data.language);
      }
      formData.append("isPublished", String(data.isPublished));
      if (data.albumId) {
        formData.append("albumId", data.albumId);
      }
      const audioFile = audioRef.current?.files?.[0];
      const imageFile = imageRef.current?.files?.[0];
      if (audioFile) formData.append("audio", audioFile);
      if (imageFile) formData.append("image", imageFile);
      const res = await fetch(`http://localhost:5000/api/songs/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (result.status === "success") {
        navigate("/dashboard/songs");
      } else {
        setError(result.message || "Failed to update a song");
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
  if (!song)
    return <p className="text-red-400">{error || "Song is not found"}</p>;
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Song</h1>
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
          <label className={labelStyle}>Genre</label>
          <input {...register("genre")} className={inputStyle} />
          {errors.genre && (
            <p className={inputErrorStyle}>{errors.genre.message}</p>
          )}
        </div>
        <div>
          <label className={labelStyle}>Duration (seconds)</label>
          <input
            {...register("duration", { valueAsNumber: true })}
            className={inputStyle}
            type="number"
          />
          {errors.duration && (
            <p className={inputErrorStyle}>{errors.duration.message}</p>
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
          <label className={labelStyle}>Language</label>
          <input {...register("language")} className={inputStyle} />
        </div>
        <div className="flex items-center gap-2">
          <input
            {...register("isPublished")}
            type="checkbox"
            className="w-4 h-4"
          />
          <label>Published (visible to listeners)</label>
        </div>
        <div>
          <p className={labelStyle}>Current Audio</p>
          <audio src={song.audioUrl} controls className="w-full" />
        </div>
        <div>
          <label className={labelStyle}>Replace Audio (optional)</label>
          <input
            ref={audioRef}
            name="audio"
            type="file"
            accept="audio/*"
            className={inputStyle}
          />
        </div>
        <div className="">
          <p className={labelStyle}>Current Cover</p>
          <img
            src={song.coverImgUrl || "/default-cover.png"}
            alt={song.title}
            className="w-20 h-20 rounded object-cover"
          />
        </div>
        <div>
          <label className={labelStyle}>Replace Cover (optional)</label>
          <input
            ref={imageRef}
            type="file"
            name="image"
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

export default EditSongPage;
