import { Request, Response } from "express";
import { createAlbumSchema } from "../schemas/album.schema";
import { streamUpload } from "../lib/stream-upload";
import { prisma } from "../lib/prisma";

export const createAlbum = async (req: Request, res: Response) => {
  try {
    const parsed = createAlbumSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid data input",
      });
    }
    const { title, description, releaseDate } = parsed.data;
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({
        status: "fail",
        message: "Cover image is required",
      });
    }
    const result = await streamUpload(file.buffer, "image");
    const album = await prisma.album.create({
      data: {
        title,
        description: description ?? null,
        coverUrl: result.secure_url,
        artistId: artistId,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
      },
    });
    return res.status(201).json({
      status: "success",
      data: album,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: "Error creating album",
    });
  }
};

export const getSingleAlbum = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "A valid Id string is required to find album",
      });
    }
    const album = await prisma.album.findFirst({
      where: {
        artistId: req.user.userId,
        id: id,
      },
    });
    if (!album) {
      return res.status(404).json({
        status: "fail",
        message: "Album is not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: album,
    });
  } catch {}
};

export const getAlbums = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const albums = await prisma.album.findMany({
      where: {
        artistId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      status: "success",
      data: albums,
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Error getting albums",
    });
  }
};

export const updateAlbum = async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(404).json({
        status: "fail",
        message: "Not authorized",
      });
    }
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(404).json({
        status: "fail",
        message: "Album id is required",
      });
    }
    const album = await prisma.album.findFirst({
      where: {
        id,
        artistId,
      },
    });
    if (!album) {
      return res.status(404).json({
        status: "fail",
        message: "Album is not found or access denied",
      });
    }
    const file = req.file as Express.Multer.File | undefined;
    let coverUrl = album.coverUrl;
    if (file) {
      const result = await streamUpload(file.buffer, "image");
      coverUrl = result.secure_url;
    }
    const { artistId: _, songs: __, cover: ___, ...updateData } = req.body;
    const updateAlbum = await prisma.album.update({
      where: { id },
      data: {
        ...updateData,
        coverUrl,
        releaseDate: updateData.releaseDate
          ? new Date(updateData.releaseDate)
          : undefined,
      },
    });
    res.status(200).json({
      message: "success",
      data: { album: updateAlbum },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to update album",
    });
  }
};

export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(404).json();
    }
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(404).json({
        status: "fail",
        message: "Album Id is required",
      });
    }
    const album = await prisma.album.findFirst({
      where: {
        artistId,
        id,
      },
    });
    if (!album) {
      return res.status(404).json({
        status: "fail",
        message: "Album is not found or access denied",
      });
    }
    await prisma.$transaction([
      prisma.song.updateMany({
        where: { albumId: id },
        data: { albumId: null },
      }),
      prisma.album.delete({ where: { id } }),
    ]);
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to delete album",
    });
  }
};
