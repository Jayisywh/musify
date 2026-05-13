/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import type z from "zod";
import { uploadSongSchema } from "../schema/song.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import axios from "axios";
type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = z.infer<typeof uploadSongSchema>;

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [albums, setAlbums] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(uploadSongSchema),
    defaultValues: {
      albumId: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("genre", data.genre);
      formData.append("duration", data.duration.toString());
      formData.append("audio", data.audio[0]);
      formData.append("image", data.image[0]);
      if (data.albumId) {
        formData.append("albumId", data.albumId);
      }
      const res = await axios.post(
        "http://localhost:5000/api/songs",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data.status === "success") {
        reset();
        onClose();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    const fetchAlbums = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/albums", {
          withCredentials: true,
        });
        if (res.data.status === "success") {
          setAlbums(res.data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAlbums();
  }, [isOpen]);
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto z-50 bg-[#121212] border border-[#282828] p-6 md:p-10 rounded-xl shadow-2xl focus:outline-none animate-in fade-in zoom-in-95 duration-200 
        scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
        >
          <Dialog.Title className="text-white text-xl">
            Upload a Song
          </Dialog.Title>
          <Dialog.Description className="text-neutral-400 text-xs md:text-sm font-medium px-4">
            Upload a mp3 file
          </Dialog.Description>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 mt-4"
          >
            {/* TITLE */}
            <div>
              <label className="text-xs text-neutral-400">Title</label>
              <input
                {...register("title")}
                placeholder="Song title"
                className="w-full mt-1 bg-[#181818] text-white px-4 py-3 rounded-md border border-neutral-700 focus:border-white outline-none transition"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* GENRE */}
            <div>
              <label className="text-xs text-neutral-400">Genre</label>
              <input
                {...register("genre")}
                placeholder="Pop, Hip-hop..."
                className="w-full mt-1 bg-[#181818] text-white px-4 py-3 rounded-md border border-neutral-700 focus:border-white outline-none transition"
              />
              {errors.genre && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.genre.message}
                </p>
              )}
            </div>

            {/* DURATION */}
            <div>
              <label className="text-xs text-neutral-400">
                Duration (seconds)
              </label>
              <input
                type="number"
                {...register("duration", { valueAsNumber: true })}
                placeholder="180"
                className="w-full mt-1 bg-[#181818] text-white px-4 py-3 rounded-md border border-neutral-700 focus:border-white outline-none transition"
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Album Select */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Album</label>

              <Select.Root
                value={selectedAlbum}
                onValueChange={(value) => {
                  setSelectedAlbum(value);
                  setValue("albumId", value === "none" ? "" : value);
                }}
              >
                {/* Trigger */}
                <Select.Trigger className="flex items-center justify-between w-full bg-[#181818] text-white text-sm p-3 rounded-md border border-neutral-700 focus:outline-none">
                  <Select.Value placeholder="🎵 Single (No Album)" />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                {/* Dropdown */}
                <Select.Portal>
                  <Select.Content
                    className="bg-[#181818] border border-neutral-700 rounded-md shadow-lg z-50 overflow-hidden min-w-(--radix-select-trigger-width)"
                    position="popper"
                  >
                    <Select.Viewport className="p-1">
                      {/* Default option */}
                      <Select.Item
                        value="none"
                        className="flex items-center justify-between px-3 py-2 text-sm text-white rounded-md cursor-pointer hover:bg-[#282828]"
                      >
                        <Select.ItemText>🎵 Single (No Album)</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>

                      {/* Albums */}
                      {albums.map((album: any) => (
                        <Select.Item
                          key={album.id}
                          value={album.id}
                          className="flex items-center justify-between px-3 py-2 text-sm text-white rounded-md cursor-pointer hover:bg-[#282828]"
                        >
                          <Select.ItemText>{album.title}</Select.ItemText>
                          <Select.ItemIndicator>
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* AUDIO FILE */}
            <div>
              <label className="text-xs text-neutral-400">Audio File</label>
              <label className="flex items-center justify-center mt-2 border-2 border-dashed border-neutral-700 rounded-md p-4 cursor-pointer hover:border-white transition">
                <span className="text-sm text-neutral-400">
                  Click to upload MP3
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  {...register("audio")}
                  className="hidden"
                />
              </label>
              {errors.audio && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.audio.message?.toString()}
                </p>
              )}
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="text-xs text-neutral-400">Cover Image</label>
              <label className="flex items-center justify-center mt-2 border-2 border-dashed border-neutral-700 rounded-md p-4 cursor-pointer hover:border-white transition">
                <span className="text-sm text-neutral-400">
                  Upload cover image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="hidden"
                />
              </label>
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.image.message?.toString()}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1DB954] text-black font-semibold py-3 rounded-full hover:scale-105 transition disabled:bg-gray-500"
            >
              {loading ? "Uploading..." : "Upload Song"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UploadModal;
