import { z } from "zod";

export const createPlaylistSchema = z.object({
  title: z.string().min(1, "Playlist title is required"),
  description: z.string().optional(),
  cover: z.any().optional(),
});

export const editPlaylistSchema = createPlaylistSchema;
