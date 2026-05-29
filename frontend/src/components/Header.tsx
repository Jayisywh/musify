import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { useModal } from "../providers/ModalProvider";
import { useAuth } from "../providers/AuthProvider";
import { FaUserAlt } from "react-icons/fa";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}
const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const navigate = useNavigate();
  const { openLogin, openSignup } = useModal();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  return (
    <div
      className={twMerge(
        `h-fit bg-linear-to-b from-emerald-800 p-6`,
        className,
      )}
    >
      <div className="w-full mb-4 flex items-center justify-end md:justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <button
            className="rounded-full bg-black flex items-center justify-center cursor-pointer hover:opacity-75 transition"
            onClick={() => navigate(-1)}
          >
            <RxCaretLeft size={35} className="text-white" />
          </button>
          <button
            className="rounded-full bg-black flex items-center justify-center cursor-pointer hover:opacity-75 transition"
            onClick={() => navigate(1)}
          >
            <RxCaretRight size={35} className="text-white" />
          </button>
        </div>
        <div className="flex justify-end items-center gap-x-4 ml-auto">
          {user ? (
            <div className="flex gap-x-4 items-center">
              <Button className="bg-white px-6 py-2" onClick={handleLogout}>
                Logout
              </Button>
              <Button onClick={() => navigate("/account")} className="bg-white">
                <FaUserAlt />
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Button
                  className="bg-transparent text-neutral-300 font-medium"
                  onClick={openSignup}
                >
                  Sign Up
                </Button>
              </div>
              <div>
                <Button className="bg-white px-6 py-2" onClick={openLogin}>
                  Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Header;
