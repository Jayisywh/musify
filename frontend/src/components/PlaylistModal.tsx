import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createPlaylistSchema } from "../schema/playlist.schema";
import { usePlaylists } from "../providers/PlaylistProvider";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";

type PlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PlaylistFormData = z.infer<typeof createPlaylistSchema>;

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { createPlaylist } = usePlaylists();
  const navigate = useNavigate();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const onSubmit = async (data: PlaylistFormData) => {
    try {
      setLoading(true);
      const formData = new window.FormData();
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.cover?.[0]) {
        formData.append("cover", data.cover[0]);
      }
      const playlist = await createPlaylist(formData);
      if (playlist) {
        reset();
        onClose();
        navigate(`/playlist/${playlist.id}`);
      }
    } catch (error) {
      console.error("Create playlist error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-40" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] sm:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#121212] p-6">
          <Dialog.Title className="mb-2 text-xl font-bold text-white">
            Create Playlist
          </Dialog.Title>

          <Dialog.Description className="mb-4 text-sm text-neutral-400">
            Create a new playlist for your favorite songs
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <input
                {...register("title")}
                placeholder="Playlist title"
                className="input"
              />
              {errors.title && <p className="error">{errors.title.message}</p>}
            </div>

            <textarea
              {...register("description")}
              placeholder="Description (optional)"
              className="input"
            />

            <div>
              <p className="mb-1 text-xs text-neutral-400">
                Cover Image (optional)
              </p>
              <input
                type="file"
                accept="image/*"
                {...register("cover")}
                className="text-sm text-neutral-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-[#1DB954] py-3 font-bold text-black transition hover:scale-105 disabled:bg-gray-500"
            >
              {loading ? "Creating..." : "Create Playlist"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PlaylistModal;
