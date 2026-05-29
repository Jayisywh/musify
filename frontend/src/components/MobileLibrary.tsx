import { useState } from "react";
import { TbPlaylist } from "react-icons/tb";
import { ListMusic, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../providers/PlaylistProvider";

const MobileLibraryBtn = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { playlists, loading, error } = usePlaylists();

  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed left-46 top-7.5 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition active:scale-95"
          aria-label="Open library"
        >
          <TbPlaylist size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 md:hidden">
          <div className="h-full w-[82%] max-w-xs bg-neutral-950 p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ListMusic size={24} />
                <p className="font-bold">Your Library</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Close library"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => goTo("/liked")}
                className="w-full rounded-md px-3 py-3 text-left hover:bg-neutral-800"
              >
                <p className="text-sm font-semibold text-white">Liked Songs</p>
                <p className="text-xs text-neutral-400">Playlist</p>
              </button>

              {loading && (
                <p className="px-3 py-2 text-sm text-neutral-500">
                  Loading playlists...
                </p>
              )}

              {error && !loading && (
                <p className="px-3 py-2 text-sm text-red-400">{error}</p>
              )}

              {!loading &&
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => goTo(`/playlist/${playlist.id}`)}
                    className="w-full rounded-md px-3 py-3 text-left hover:bg-neutral-800"
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Playlist • {playlist._count?.songs ?? 0} songs
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileLibraryBtn;
