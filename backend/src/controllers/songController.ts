import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { streamUpload } from "../lib/stream-upload";
import { Prisma } from "@prisma/client";

export const createSong = async (req: Request, res: Response) => {
  try {
    const { title, genre, duration, albumId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files?.["audio"]?.[0];
    const imageFile = files?.["image"]?.[0];
    if (!audioFile || !imageFile) {
      return res.status(400).json({
        status: "fail",
        message: "Files are missing",
      });
    }

    const [audioResult, imageResult] = await Promise.all([
      streamUpload(audioFile.buffer, "video"),
      streamUpload(imageFile.buffer, "image"),
    ]);
    if (albumId) {
      const album = await prisma.album.findFirst({
        where: {
          id: albumId,
          artistId: req.user!.userId,
        },
      });
      if (!album) {
        return res.status(403).json({
          status: "fail",
          message: "Invalid album",
        });
      }
    }
    const song = await prisma.song.create({
      data: {
        title,
        genre,
        duration: Number(duration),
        audioUrl: audioResult.secure_url,
        coverImgUrl: imageResult.secure_url,
        artistId: req.user!.userId,
        albumId: albumId || null,
        language: "unknown",
        releaseDate: new Date(),
      },
    });
    return res.status(201).json({
      status: "success",
      data: song,
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Failed to upload a song",
    });
  }
};

export const getSingleSong = async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (!id || typeof id !== "string")
      return res.status(400).json({
        status: "fail",
        message: "A valid ID string is required to find song",
      });
    const song = await prisma.song.findFirst({
      where: {
        id,
        artistId,
      },
      include: {
        album: true,
      },
    });
    if (!song) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: song,
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
};

export const getSongs = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const songs = await prisma.song.findMany({
      where: {
        artistId: req.user?.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        album: true,
      },
    });
    return res.status(200).json({
      status: "success",
      results: songs.length,
      data: songs,
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: "Fail to get songs",
    });
  }
};

export const updateSong = async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(400).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid song Id",
      });
    }
    const existingSong = await prisma.song.findFirst({
      where: {
        id,
        artistId,
      },
    });
    if (!existingSong) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found",
      });
    }
    const files = req.files as
      | { [fieldName: string]: Express.Multer.File[] }
      | undefined;
    const audioFile = files?.["audio"]?.[0];
    const imageFile = files?.["image"]?.[0];
    let audioUrl = existingSong.audioUrl;
    let coverImgUrl = existingSong.coverImgUrl;
    if (audioFile) {
      const audioResult = await streamUpload(audioFile.buffer, "video");
      audioUrl = audioResult.secure_url;
    }
    if (imageFile) {
      const coverImageResult = await streamUpload(imageFile.buffer, "image");
      coverImgUrl = coverImageResult.secure_url;
    }
    const { title, genre, duration, language, isPublished, releaseDate } =
      req.body;
    const data: Prisma.SongUpdateInput = {
      audioUrl,
    };
    if (coverImgUrl !== null) {
      data.coverImgUrl = coverImgUrl;
    }
    if (title !== undefined && title !== "") {
      data.title = title;
    }
    if (genre !== undefined && genre !== "") {
      data.genre = genre;
    }
    if (language !== undefined && language !== "") {
      data.language = language;
    }
    if (duration !== undefined && duration !== "") {
      const parsedDuration = Number(duration);

      if (Number.isNaN(parsedDuration)) {
        return res.status(400).json({
          status: "fail",
          message: "Duration must be a number",
        });
      }

      data.duration = parsedDuration;
    }
    if (isPublished !== undefined && isPublished !== "") {
      data.isPublished = isPublished === "true" || isPublished === true;
    }
    if (releaseDate !== undefined && releaseDate !== "") {
      data.releaseDate = new Date(releaseDate);
    }
    const updateSong = await prisma.song.update({
      where: {
        id: id,
      },
      data,
    });
    return res.status(200).json({
      status: "success",
      data: { song: updateSong },
    });
  } catch (error) {
    console.error("UPDATE SONG ERROR:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to update song",
    });
  }
};

export const deleteSong = async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.userId;
    if (!artistId) {
      return res.status(400).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid song Id",
      });
    }
    const song = await prisma.song.findFirst({
      where: {
        id,
        artistId,
      },
    });
    if (!song) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found or you don't have permission",
      });
    }
    await prisma.song.delete({
      where: { id },
    });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to delete song",
    });
  }
};
