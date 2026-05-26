import express from "express";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getMyPlaylists,
  getPlaylistById,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../controllers/playlistController";
import { protect } from "../middlewares/protect";
import { upload } from "../middlewares/upload";

const playlistRouter = express.Router();
playlistRouter.use(protect);

playlistRouter.get("/", getMyPlaylists);
playlistRouter.post("/", upload.single("cover"), createPlaylist);

playlistRouter.get("/:playlistId", getPlaylistById);
playlistRouter.patch("/:playlistId", upload.single("cover"), updatePlaylist);
playlistRouter.delete("/:playlistId", deletePlaylist);

playlistRouter.post("/:playlistId/songs/:songId", addSongToPlaylist);
playlistRouter.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);

export default playlistRouter;
