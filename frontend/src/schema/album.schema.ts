import { z } from "zod";

export const createAlbumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  albumId: z.string().optional(),
  cover: z
    .any()
    .refine((file) => file?.length === 1, "Cover Image is required"),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;

export const editAlbumSchema = z.object({
  title: z.string().min(11, "Title is required"),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type EditAlbumInput = z.infer<typeof editAlbumSchema>;
