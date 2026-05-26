import { createContext, useContext, useState } from "react";
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";
import PlaylistModal from "../components/PlaylistModal";
import AlbumModal from "../components/AlbumModal";

type Mode = "login" | "signup" | "upload" | "playlist" | "album";
type ModalContextProps = {
  openLogin: () => void;
  openSignup: () => void;
  openUpload: () => void;
  openAlbum: () => void;
  openPlaylist: () => void;
  closeModal: () => void;
};
type ModalProviderProps = {
  children: React.ReactNode;
};

const ModalContext = createContext<ModalContextProps | null>(null);

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const openLogin = () => {
    setMode("login");
    setIsOpen(true);
  };

  const openSignup = () => {
    setMode("signup");
    setIsOpen(true);
  };

  const openUpload = () => {
    setMode("upload");
    setIsOpen(true);
  };

  const openPlaylist = () => {
    setMode("playlist");
    setIsOpen(true);
  };

  const openAlbum = () => {
    setMode("album");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        openLogin,
        openSignup,
        openUpload,
        openPlaylist,
        openAlbum,
        closeModal,
      }}
    >
      {children}
      {mode === "signup" || mode === "login" ? (
        <AuthModal isOpen={isOpen} mode={mode} onClose={closeModal} />
      ) : mode === "upload" ? (
        <UploadModal isOpen={isOpen} onClose={closeModal} />
      ) : mode === "album" ? (
        <AlbumModal isOpen={isOpen} onClose={closeModal} />
      ) : mode === "playlist" ? (
        <PlaylistModal isOpen={isOpen} onClose={closeModal} />
      ) : null}
    </ModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used inside ModalProvider");
  }
  return context;
};
