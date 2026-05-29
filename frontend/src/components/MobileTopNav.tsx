import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { ListMusic, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useModal } from "../providers/ModalProvider";
import { usePlaylists } from "../providers/PlaylistProvider";

const mobileIconButtonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-0 leading-none text-black shadow-lg transition active:scale-95";

const MobileTopNav = () => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin, openUpload, openPlaylist, openSignup, openAlbum } =
    useModal();
  const { playlists, loading, error } = usePlaylists();

  const goTo = (path: string) => {
    navigate(path);
    setActionsOpen(false);
    setLibraryOpen(false);
  };

  return (
    <>
      <div className="fixed left-8 top-[30px] z-50 flex h-10 items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => goTo("/")}
          className={mobileIconButtonClass}
          aria-label="Home"
        >
          <HiHome className="block h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => goTo("/search")}
          className={mobileIconButtonClass}
          aria-label="Search"
        >
          <BiSearch className="block h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setActionsOpen((prev) => !prev)}
          className={mobileIconButtonClass}
          aria-label="Open actions"
        >
          <AiOutlinePlus className="block h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className={mobileIconButtonClass}
          aria-label="Open library"
        >
          <ListMusic className="block h-5 w-5" />
        </button>
      </div>

      {actionsOpen && (
        <div className="fixed left-8 top-[82px] z-[60] w-48 rounded-lg bg-[#282828] p-2 shadow-xl md:hidden">
          {!user && (
            <>
              <button
                type="button"
                onClick={() => {
                  openLogin();
                  setActionsOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  openSignup();
                  setActionsOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Sign Up
              </button>
            </>
          )}

          {user?.role === "artist" && (
            <>
              <button
                type="button"
                onClick={() => {
                  navigate("/dashboard/songs");
                  setActionsOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  openUpload();
                  setActionsOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Upload Song
              </button>

              <button
                type="button"
                onClick={() => {
                  openAlbum();
                  setActionsOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Create Album
              </button>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={() => {
                openPlaylist();
                setActionsOpen(false);
              }}
              className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
            >
              Create Playlist
            </button>
          )}
        </div>
      )}

      {libraryOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 md:hidden">
          <div className="h-full w-[82%] max-w-xs bg-neutral-950 p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ListMusic size={24} />
                <p className="font-bold">Your Library</p>
              </div>

              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
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

export default MobileTopNav;
