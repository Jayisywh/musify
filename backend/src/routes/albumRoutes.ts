import express from "express";
import {
  createAlbum,
  deleteAlbum,
  getAlbumById,
  getAlbums,
  getSingleAlbum,
  updateAlbum,
} from "../controllers/albumController";
import { protect } from "../middlewares/protect";
import { artistOnly } from "../middlewares/artistOnly";
import { upload } from "../middlewares/upload";

const albumRouter = express.Router();
albumRouter.use(protect, artistOnly);
albumRouter.get("/", getAlbums);
albumRouter.get("/:albumId", getAlbumById);
albumRouter.get("/:id", getSingleAlbum);
albumRouter.post("/", upload.single("cover"), createAlbum);
albumRouter.patch(
  "/:id",
  protect,
  artistOnly,
  upload.single("cover"),
  updateAlbum,
);
albumRouter.delete("/:id", deleteAlbum);
export default albumRouter;
