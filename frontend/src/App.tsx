import Home from "./pages/listener/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/listener/Layout";
import { AuthProvider } from "./providers/AuthProvider";
import Dashboard from "./pages/artist/Dashboard";
import SongsPage from "./pages/artist/SongsPage";
import AlbumsPage from "./pages/artist/AlbumsPage";
import UploadSongPage from "./pages/artist/UploadSongPage";
import CreateAlbumPage from "./pages/artist/CreateAlbumPage";
import EditSongPage from "./pages/artist/EditSongPage";
import EditAlbumPage from "./pages/artist/EditAlbumPage";
import SongPage from "./pages/listener/SongPage";
import PlayerProvider from "./providers/PlayerProvider";

const routes = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/songs/:id",
        element: <SongPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "songs",
        element: <SongsPage />,
      },
      {
        path: "albums",
        element: <AlbumsPage />,
      },
      {
        path: "songs/new",
        element: <UploadSongPage />,
      },
      {
        path: "albums/new",
        element: <CreateAlbumPage />,
      },
      {
        path: "songs/:id/edit",
        element: <EditSongPage />,
      },
      {
        path: "albums/:id/edit",
        element: <EditAlbumPage />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <RouterProvider router={routes} />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
