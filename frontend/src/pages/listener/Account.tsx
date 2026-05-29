import { useEffect, useState } from "react";
import { getMyAccount } from "../../lib/accountApi";
import StateMessage from "./StateMessage";
import { Mail, Shield, User } from "lucide-react";
import Header from "../../components/Header";

interface Account {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt?: string;
}

const Account = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyAccount();
        if (data.status === "success") {
          setAccount(data.data);
        } else {
          setError(data.message || "Failed to load account");
        }
      } catch (error) {
        console.error("Failed to fetch account:", error);
        setError("Failed to load account");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);
  if (loading) {
    return (
      <StateMessage
        type="loading"
        title="Loading"
        message="Getting your profile details"
      />
    );
  }
  if (error || !account) {
    return (
      <StateMessage
        type="error"
        title="Account not found"
        message={error || "Please login again"}
      />
    );
  }
  const displayName = account.name || account.username || "Musify User";
  return (
    <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900">
      <Header>
        <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={displayName}
              className="h-44 w-44 rounded-full object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-neutral-800 shadow-xl">
              <User className="h-20 w-20 text-neutral-500" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Account</p>

            <h1 className="mt-2 truncate text-5xl font-bold text-white md:text-7xl">
              {displayName}
            </h1>

            <p className="mt-4 text-sm text-neutral-300">
              @{account.username} • {account.role}
            </p>
          </div>
        </div>
      </Header>

      <div className="px-6 py-5">
        <div className="max-w-2xl rounded-lg bg-neutral-800/60 p-5">
          <h2 className="text-xl font-bold text-white">Profile details</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-md bg-neutral-900 p-4">
              <User className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Username</p>
                <p className="text-sm font-medium text-white">
                  @{account.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-neutral-900 p-4">
              <Mail className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Email</p>
                <p className="text-sm font-medium text-white">
                  {account.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-neutral-900 p-4">
              <Shield className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Role</p>
                <p className="text-sm font-medium capitalize text-white">
                  {account.role}
                </p>
              </div>
            </div>

            {account.createdAt && (
              <div className="rounded-md bg-neutral-900 p-4">
                <p className="text-xs text-neutral-500">Joined</p>
                <p className="text-sm font-medium text-white">
                  {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
