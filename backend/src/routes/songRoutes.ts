import express from "express";
import { protect } from "../middlewares/protect";
import { artistOnly } from "../middlewares/artistOnly";
import {
  createSong,
  deleteSong,
  getSingleSong,
  getSongs,
  updateSong,
} from "../controllers/songController";
import { upload } from "../middlewares/upload";

const songRouter = express.Router();

songRouter.use(protect, artistOnly);
songRouter.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createSong,
);
songRouter.get("/", getSongs);
songRouter.get("/:id", protect, artistOnly, getSingleSong);
songRouter.patch(
  "/:id",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  updateSong,
);
songRouter.delete("/:id", deleteSong);

export default songRouter;
