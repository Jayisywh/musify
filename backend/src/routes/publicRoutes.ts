import { Router } from "express";
import {
  getPublicAlbumById,
  getPublicAlbums,
  getPublicArtistById,
  getPublicSongById,
  getPublicSongs,
  incrementPlayCount,
} from "../controllers/publicController";

const publicRouter = Router();

publicRouter.get("/songs", getPublicSongs);
publicRouter.get("/songs/:id", getPublicSongById);

publicRouter.patch("/songs/:id/play", incrementPlayCount);

publicRouter.get("/albums", getPublicAlbums);
publicRouter.get("/albums/:id", getPublicAlbumById);

publicRouter.get("/artists/:id", getPublicArtistById);

export default publicRouter;
