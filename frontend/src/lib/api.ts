const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = {
  get: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
    }),
  post: (endpoint: string, body: FormData | object) =>
    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers:
        body instanceof FormData
          ? undefined
          : {
              "Content-Type": "application/json",
            },
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint: string, body: object) =>
    fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  delete: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
    }),
};
