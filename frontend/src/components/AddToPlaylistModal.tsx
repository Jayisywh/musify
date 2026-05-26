import { useState } from "react";
import { usePlaylists } from "../providers/PlaylistProvider";
import * as Dialog from "@radix-ui/react-dialog";
import { Music, Plus } from "lucide-react";

type AddToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  songId: string | null;
};

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  songId,
}) => {
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );
  const { playlists, loading, error, addSongToPlaylist } = usePlaylists();
  const handleAddSongToPlaylist = async (playlistId: string) => {
    if (!songId) return;
    try {
      setLoadingPlaylistId(playlistId);
      const result = await addSongToPlaylist(playlistId, songId);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to add song to playlist:", error);
    } finally {
      setLoadingPlaylistId(null);
    }
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#121212] p-6">
          <Dialog.Title className="mb-2 text-xl font-bold text-white">
            Add to playlist
          </Dialog.Title>

          <Dialog.Description className="mb-4 text-sm text-neutral-400">
            Choose a playlist for this song
          </Dialog.Description>

          {loading && (
            <p className="text-sm text-neutral-400">Loading playlists...</p>
          )}

          {error && !loading && <p className="text-sm text-red-400">{error}</p>}

          {!loading && playlists.length === 0 && (
            <div className="rounded-lg bg-neutral-900 p-4 text-center">
              <Music className="mx-auto mb-2 h-10 w-10 text-neutral-500" />
              <p className="text-sm font-medium text-white">No playlists yet</p>
              <p className="mt-1 text-xs text-neutral-400">
                Create a playlist first from Your Library.
              </p>
            </div>
          )}

          {!loading && playlists.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={loadingPlaylistId === playlist.id}
                  onClick={() => handleAddSongToPlaylist(playlist.id)}
                  className="flex w-full items-center gap-3 rounded-md p-3 text-left transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {playlist.coverUrl ? (
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-neutral-800">
                      <Music className="h-6 w-6 text-neutral-500" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {playlist._count?.songs ?? 0} songs
                    </p>
                  </div>

                  <Plus className="h-5 w-5 text-neutral-400" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-full border border-neutral-600 py-3 font-bold text-white transition hover:border-white"
          >
            Cancel
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddToPlaylistModal;
