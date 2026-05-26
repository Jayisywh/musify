import express from "express";
import { protect } from "../middlewares/protect";
import {
  addFavoriteSong,
  checkFavoriteSong,
  getFavoriteSongs,
  removeFavoriteSong,
} from "../controllers/likedSongController";

const likedSongRouter = express.Router();
likedSongRouter.use(protect);

likedSongRouter.get("/", getFavoriteSongs);
likedSongRouter.get("/:songId/check", checkFavoriteSong);
likedSongRouter.post("/:songId", addFavoriteSong);
likedSongRouter.delete("/:songId", removeFavoriteSong);

export default likedSongRouter;
