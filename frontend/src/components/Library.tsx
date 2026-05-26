import { AiOutlinePlus } from "react-icons/ai";
import { TbPlaylist } from "react-icons/tb";
import { useAuth } from "../providers/AuthProvider";
import { useModal } from "../providers/ModalProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../providers/PlaylistProvider";

const Library = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { user } = useAuth();
  const { openLogin, openUpload, openPlaylist, openAlbum } = useModal();
  const onClick = () => {
    if (!user) {
      return openLogin();
    }
    setOpenMenu((prev) => !prev);
  };
  const navigate = useNavigate();
  const { playlists, loading, error } = usePlaylists();
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist className="text-neutral-400" size={26} />
          <p className="text-neutral-400 font-medium text-md">Your Library</p>
        </div>
        <div className="relative">
          <AiOutlinePlus
            onClick={onClick}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          {openMenu && (
            <div className="absolute right-0 top-8 bg-[#282828] rounded-lg w-44 p-2 shadow-lg z-50">
              {user?.role === "artist" && (
                <>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded"
                    onClick={() => {
                      navigate("/dashboard/songs");
                      setOpenMenu(false);
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded"
                    onClick={() => {
                      openUpload();
                      setOpenMenu(false);
                    }}
                  >
                    Upload Song
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded"
                    onClick={() => {
                      openAlbum();
                      setOpenMenu(false);
                    }}
                  >
                    Create Album
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded"
                    onClick={() => {
                      openPlaylist();
                      setOpenMenu(false);
                    }}
                  >
                    Create Playlist
                  </button>
                </>
              )}
              {user?.role === "listener" && (
                <button
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded"
                  onClick={() => {
                    openPlaylist();
                    setOpenMenu(false);
                  }}
                >
                  Create Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-y-2 mt-4 px-3 text-white">
        <button
          type="button"
          onClick={() => navigate("/liked")}
          className="w-full text-left rounded-md px-3 py-2 hover:bg-neutral-800 transition"
        >
          <p className="text-sm font-medium text-white">Liked Songs</p>
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
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="w-full text-left rounded-md px-3 py-2 hover:bg-neutral-800 transition"
            >
              <p className="truncate text-sm font-medium text-white">
                {playlist.title}
              </p>
              <p>Playlist • {playlist._count?.songs ?? 0} songs</p>
            </button>
          ))}
      </div>
    </div>
  );
};

export default Library;
