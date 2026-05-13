import express from "express";
import {
  createAlbum,
  deleteAlbum,
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
albumRouter.get("/:id", protect, artistOnly, getSingleAlbum);
albumRouter.post("/", protect, artistOnly, upload.single("cover"), createAlbum);
albumRouter.patch(
  "/:id",
  protect,
  artistOnly,
  upload.single("cover"),
  updateAlbum,
);
albumRouter.delete("/:id", protect, artistOnly, deleteAlbum);
export default albumRouter;
