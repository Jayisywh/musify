import { useEffect, useState } from "react";

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { credentials: "include" });
        const result = await res.json();
        if (result.status === "success") {
          setData(result.data);
        } else {
          setError(result.message || "Something went wrong");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);
  return { data, loading, error };
}
