import { usePlayer } from "../../providers/PlayerProvider";
import Header from "../../components/Header";
import { Heart, Play } from "lucide-react";
import { useLikedSongs } from "../../providers/LikedSongsProvider";
import StateMessage from "./StateMessage";

interface LikedSong {
  id: string;
  addedAt: string;
  song: {
    id: string;
    title: string;
    audioUrl: string;
    coverImgUrl: string | null;
    artist: {
      id: string;
      name: string | null;
      username: string;
    };
  };
}

const LikedSong = () => {
  const { likedSongs, loading, error, removeLikedSong } = useLikedSongs();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayer();
  const playerSongs = likedSongs.map((likedSong) => ({
    id: likedSong.song.id,
    title: likedSong.song.title,
    artist: likedSong.song.artist.name || likedSong.song.artist.username,
    artistId: likedSong.song.artist.id,
    coverUrl: likedSong.song.coverImgUrl || "/default-cover.png",
    audioUrl: likedSong.song.audioUrl,
  }));

  const handlePlay = (songId: string) => {
    const selectedSong = playerSongs.find((song) => song.id === songId);
    if (!selectedSong) return;
    const isCurrentSong = currentSong?.id === selectedSong.id;
    if (isCurrentSong) {
      togglePlay();
      return;
    }
    setCurrentSong(selectedSong, playerSongs);
  };

  const handleUnlike = async (songId: string) => {
    await removeLikedSong(songId);
  };

  return (
    <div className="bg-neutral-900 h-full w-full rounded-lg overflow-hidden overflow-y-auto">
      <Header>
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 px-6 pb-6">
          <div className="w-44 h-44 rounded-md bg-linear-to-br from-purple-700 to-blur-500 flex items-center justify-center shadow-xl">
            <Heart className="w-20 h-20 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm text-white font-semibold">Playlist</p>
            <h1 className="text-white text-5xl md:text-7xl font-bold mt-2">
              Liked Songs
            </h1>
            <p className="text-neutral-300 text-sm mt-4">
              {likedSongs.length} liked song{likedSongs.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </Header>
      <div className="px-6 py-5">
        {loading ? (
          <StateMessage
            type="loading"
            title="Loading liked songs..."
            message="Getting your favorite songs"
          />
        ) : error ? (
          <StateMessage
            type="error"
            title="Failed to load liked songs"
            message={error}
          />
        ) : likedSongs.length === 0 ? (
          <StateMessage
            type="empty"
            title="No liked songs yet"
            message="Tap the heart on songs you love, and they will appear here"
          />
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[40px_1fr_140px_80px] gap-4 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-800">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Added</span>
              <span className="text-right">Action</span>
            </div>
            {likedSongs.map((likedsong, index) => {
              const song = likedsong.song;
              const artistName = song.artist.name || song.artist.username;
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={likedsong.id}
                  className="grid grid-cols-[40px_minmax(0,1fr)_140px_80px] gap-4 items-center px-4 py-2 rounded-md hover:bg-neutral-800 group"
                >
                  <button
                    type="button"
                    onClick={() => handlePlay(song.id)}
                    className="text-neutral-400 group-hover:text-white"
                    aria-label="Play song"
                  >
                    {isCurrent && isPlaying ? (
                      <span className="text-green-500 text-sm">▶</span>
                    ) : (
                      <>
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="hidden group-hover:block w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.coverImgUrl || "/default-cover.png"}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? "text-green-500" : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {artistName}
                      </p>
                    </div>
                  </div>

                  <p className="hidden md:block text-sm text-neutral-400">
                    {new Date(likedsong.addedAt).toLocaleDateString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleUnlike(song.id)}
                    className="justify-self-end text-green-500 hover:text-white transition"
                    aria-label="Unlike song"
                  >
                    <Heart className="w-5 h-5" fill="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSong;
