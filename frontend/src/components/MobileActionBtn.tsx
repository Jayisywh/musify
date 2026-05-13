import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useAuth } from "../providers/AuthProvider";
import { useModal } from "../providers/ModalProvider";
import { twMerge } from "tailwind-merge";

const MobileActionBtn = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { openLogin, openUpload, openPlaylist, openSignup } = useModal();
  return (
    <div
      className={twMerge(
        "md:hidden fixed top-8.5 left-28 z-20",
        !user ? "top-9.5" : "top-8.5",
      )}
    >
      <button
        className="bg-white p-2.5 rounded-full shadow-lg active:scale-95 transition"
        onClick={() => setOpen(!open)}
      >
        <AiOutlinePlus size={17} className="text-black" />
      </button>
      {open && (
        <div className="absolute top-12 left-0 bg-[#282828] rounded-lg w-44 p-2">
          {!user && (
            <>
              <button
                onClick={openLogin}
                className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded"
              >
                Login
              </button>
              <button
                onClick={openSignup}
                className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded"
              >
                Sign Up
              </button>
            </>
          )}
          {user?.role === "artist" && (
            <button
              onClick={() => {
                openUpload();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded"
            >
              Upload Song
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                openPlaylist();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded"
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
