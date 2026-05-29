import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useModal } from "../providers/ModalProvider";

const MobileActionBtn = () => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin, openUpload, openPlaylist, openSignup, openAlbum } =
    useModal();

  const handleOpen = () => {
    if (!user) {
      setOpen((prev) => !prev);
      return;
    }

    setOpen((prev) => !prev);
  };

  return (
    <div className="fixed left-32 top-8 z-50 md:hidden">
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition active:scale-95"
        aria-label="Open actions"
      >
        <AiOutlinePlus size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-48 rounded-lg bg-[#282828] p-2 shadow-xl">
          {!user && (
            <>
              <button
                type="button"
                onClick={() => {
                  openLogin();
                  setOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  openSignup();
                  setOpen(false);
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
                  setOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  openUpload();
                  setOpen(false);
                }}
                className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
              >
                Upload Song
              </button>

              <button
                type="button"
                onClick={() => {
                  openAlbum();
                  setOpen(false);
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
                setOpen(false);
              }}
              className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-neutral-700"
            >
              Create Playlist
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileActionBtn;
