import type z from "zod";
import { editPlaylistSchema } from "../schema/playlist.schema";
import { useEffect, useState } from "react";
import { usePlaylists } from "../providers/PlaylistProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
  };
  onUpdated: (updatePlaylis: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }) => void;
}

type EditPlaylistFormData = z.infer<typeof editPlaylistSchema>;

const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const { updatePlaylist } = usePlaylists();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPlaylistFormData>({
    resolver: zodResolver(editPlaylistSchema),
    defaultValues: {
      title: playlist.title,
      description: playlist.description || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: playlist.title,
        description: playlist.description || "",
      });
    }
  }, [isOpen, playlist, reset]);

  const onSubmit = async (data: EditPlaylistFormData) => {
    try {
      setLoading(true);
      const formData = new window.FormData();
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      } else {
        formData.append("description", "");
      }
      if (data.cover?.[0]) {
        formData.append("cover", data.cover[0]);
      }
      const updatedPlaylist = await updatePlaylist(playlist.id, formData);
      if (updatedPlaylist) {
        onUpdated(updatedPlaylist);
        onClose();
      }
    } catch (error) {
      console.error("Updated playlist error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#121212] p-6">
          <Dialog.Title className="mb-2 text-xl font-bold text-white">
            Edit Playlist
          </Dialog.Title>

          <Dialog.Description className="mb-4 text-sm text-neutral-400">
            Update your playlist details
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

            {playlist.coverUrl && (
              <div>
                <p className="mb-2 text-xs text-neutral-400">Current cover</p>
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="h-28 w-28 rounded-md object-cover"
                />
              </div>
            )}

            <div>
              <p className="mb-1 text-xs text-neutral-400">
                New cover image optional
              </p>

              <input
                type="file"
                accept="image/*"
                {...register("cover")}
                className="text-sm text-neutral-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-full border border-neutral-600 py-3 font-bold text-white transition hover:border-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[#1DB954] py-3 font-bold text-black transition hover:scale-105 disabled:bg-gray-500"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditPlaylistModal;
