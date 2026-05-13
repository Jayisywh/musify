import type z from "zod";
import { createAlbumSchema } from "../schema/album.schema";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios from "axios";

type AlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = z.infer<typeof createAlbumSchema>;

const AlbumModal: React.FC<AlbumModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(createAlbumSchema) });
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.releaseDate) formData.append("releaseDate", data.releaseDate);
      formData.append("cover", data.cover[0]);
      const res = await axios.post(
        "http://localhost:5000/api/albums",
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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-40" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-md bg-[#121212] p-6 rounded-xl z-50">
          <Dialog.Title className="text-white text-xl font-bold mb-2">
            Create Album
          </Dialog.Title>

          <Dialog.Description className="text-neutral-400 text-sm mb-4">
            Create a new album for your songs
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Title */}
            <input
              {...register("title")}
              placeholder="Album Title"
              className="input"
            />
            {errors.title && <p className="error">{errors.title.message}</p>}

            {/* Description */}
            <textarea
              {...register("description")}
              placeholder="Description (optional)"
              className="input"
            />

            {/* Release Date */}
            <input type="date" {...register("releaseDate")} className="input" />

            {/* Cover */}
            <div>
              <p className="text-neutral-400 text-xs mb-1">Cover Image</p>
              <input type="file" {...register("cover")} />
              {errors.cover && (
                <p className="error">{errors.cover.message?.toString()}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#1DB954] text-black font-bold py-3 rounded-full mt-2 hover:scale-105 transition disabled:bg-gray-500"
            >
              {loading ? "Creating..." : "Create Album"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AlbumModal;
