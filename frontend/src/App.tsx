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
import LikedSong from "./pages/listener/LikedSong";
import LikedSongsProvider from "./providers/LikedSongsProvider";
import PlaylistProvider from "./providers/PlaylistProvider";
import PlaylistDetail from "./pages/listener/PlaylistDetail";
import AlbumDetail from "./pages/listener/AlbumDetail";
import Search from "./pages/listener/Search";
import ArtistDetail from "./pages/listener/ArtistDetail";

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
      {
        path: "/liked",
        element: <LikedSong />,
      },
      {
        path: "/playlist/:playlistId",
        element: <PlaylistDetail />,
      },
      {
        path: "/albums/:albumId",
        element: <AlbumDetail />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/artists/:id",
        element: <ArtistDetail />,
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
        <LikedSongsProvider>
          <PlaylistProvider>
            <RouterProvider router={routes} />
          </PlaylistProvider>
        </LikedSongsProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
