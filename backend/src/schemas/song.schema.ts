import { z } from "zod";

export const createSongSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  duration: z.string().min(1),
  audioUrl: z.string().min(1),
  coverImgUrl: z.string().min(1),
  albumId: z.string().optional(),
});
