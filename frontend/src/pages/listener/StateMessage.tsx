import { AlertCircle, Loader2, Music } from "lucide-react";

type StateMessageProps = {
  type?: "loading" | "error" | "empty";
  title: string;
  message?: string;
};

const StateMessage: React.FC<StateMessageProps> = ({
  type = "empty",
  title,
  message,
}) => {
  const Icon =
    type === "loading" ? Loader2 : type === "error" ? AlertCircle : Music;
  return (
    <div className="flex h-full min-h-[calc(100vh-180px)] flex-col items-center justify-center rounded-lg bg-neutral-900 px-6 py-10 text-center">
      <Icon
        className={`mb-4 h-12 w-12 text-neutral-500 ${type === "loading" ? "animate-spin" : ""}`}
      />
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {message && (
        <p className="mt-2 max-w-md text-sm text-neutral-400">{message}</p>
      )}
    </div>
  );
};

export default StateMessage;
