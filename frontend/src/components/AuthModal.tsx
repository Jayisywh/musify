import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { loginSchema, signupSchema } from "../schema/auth.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import { SiGithub, SiGoogle } from "react-icons/si";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type AuthMode = "login" | "signup" | "upload";
interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose }) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);
  const schema = currentMode === "login" ? loginSchema : signupSchema;
  type LoginData = z.infer<typeof loginSchema>;
  type SignupData = z.infer<typeof signupSchema>;
  type FormData = LoginData & Partial<SignupData>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      const url =
        currentMode === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/signup";

      const res = await axios.post(url, data, {
        withCredentials: true,
      });
      if (res.data.status === "success") {
        reset();
        onClose();
        navigate("/");
        setUser(res.data.data);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/80 backdrop-blur-sm fixed inset-0 z-50 transition-opacity" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto z-50 bg-[#121212] border border-[#282828] p-6 md:p-10 rounded-xl shadow-2xl focus:outline-none animate-in fade-in zoom-in-95 duration-200 
        scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
            <Dialog.Title className="text-2xl md:text-3xl font-bold text-white tracking-tighter mb-2">
              {currentMode === "login" ? "Welcome back" : "Sign up for free"}
            </Dialog.Title>
            <Dialog.Description className="text-neutral-400 text-xs md:text-sm font-medium px-4">
              {currentMode === "login"
                ? "Login to your account"
                : "Start listening with a free account"}
            </Dialog.Description>
          </div>
          {/* Social Logins */}
          <div className="flex flex-col gap-3 mb-6 md:mb-8">
            <button className="flex items-center justify-center gap-3 w-full bg-transparent border border-neutral-500 hover:border-white text-white font-bold py-3 rounded-full transition-all text-xs md:text-sm uppercase tracking-widest">
              <SiGithub size={20} />
              Sign in with GitHub
            </button>
            <button className="flex items-center justify-center gap-3 w-full bg-transparent border border-neutral-500 hover:border-white text-white font-bold py-3 rounded-full transition-all text-xs md:text-sm uppercase tracking-widest">
              <SiGoogle size={20} />
              Sign in with Google
            </button>
          </div>
          <div className="relative flex py-4 items-center mb-2">
            <div className="grow border-t border-[#282828]"></div>
            <span className="shrink mx-4 text-neutral-400 text-[10px] md:text-xs font-bold uppercase">
              or
            </span>
            <div className="grow border-t border-[#282828]"></div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 md:gap-5"
          >
            {currentMode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white ml-1">
                    Username
                  </label>
                  <input
                    {...register("username")}
                    placeholder="Your username"
                    className="w-full bg-[#121212] border border-neutral-500 hover:border-white text-white p-3 rounded text-base md:text-sm transition-all focus:ring-1 focus:ring-white outline-none"
                  />
                  {errors.username && (
                    <p className="text-[11px] text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white ml-1">
                    Name
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Your name (Display name)"
                    className="w-full bg-[#121212] border border-neutral-500 hover:border-white text-white p-3 rounded text-base md:text-sm transition-all focus:ring-1 focus:ring-white outline-none"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white ml-1">
                Email address
              </label>
              <input
                {...register("email")}
                placeholder="Your email address"
                className="w-full bg-[#121212] border border-neutral-500 hover:border-white text-white p-3 rounded text-base md:text-sm transition-all focus:ring-1 focus:ring-white outline-none placeholder:text-neutral-600"
              />
              {errors.email && (
                <p className="text-[11px] text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white ml-1">
                Your Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Your password"
                className="w-full bg-[#121212] border border-neutral-500 hover:border-white text-white p-3 rounded text-base md:text-sm transition-all focus:ring-1 focus:ring-white outline-none placeholder:text-neutral-600"
              />
              {errors.password && (
                <p className="text-[11px] text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            <button
              disabled={loading}
              className={`w-full bg-[#1DB954] hover:scale-105 active:scale-95 hover:bg-[#1ed760] text-black font-bold py-3.5 rounded-full transition-all mt-2 uppercase tracking-widest text-xs md:text-sm ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#1DB954] hover:bg-[#1ed760] text-black"}`}
            >
              {loading
                ? currentMode === "login"
                  ? "Signing in..."
                  : "Signing up..."
                : currentMode === "login"
                  ? "Login"
                  : "Sign Up"}
            </button>
          </form>
          <p className="text-xs md:text-sm text-neutral-400 text-center mt-6 md:mt-8 font-medium">
            {currentMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => {
                setCurrentMode(currentMode === "login" ? "signup" : "login");
                reset();
              }}
              className="text-white hover:underline ml-1 font-bold"
            >
              {currentMode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
          <Dialog.Close className="absolute top-4 right-4 md:top-6 md:right-6 text-neutral-400 hover:text-white transition-colors focus:outline-none">
            <FiX size={24} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;
