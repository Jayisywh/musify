import { z } from "zod";

export const uploadSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  duration: z.string().optional(),
  albumId: z.string().optional(),
});

export type UploadSongInput = z.infer<typeof uploadSongSchema>;

export const editSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  duration: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, "Duration must be at least 1 second").optional(),
  ),
  description: z.string().optional(),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
  albumId: z.string().optional(),
  audio: z.any().optional(),
  image: z.any().optional(),
});

export type EditSongInput = z.infer<typeof editSongSchema>;
