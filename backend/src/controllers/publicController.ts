import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getPublicSongs = async (req: Request, res: Response) => {
  try {
    const { q, genre, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const songs = await prisma.song.findMany({
      where: {
        isPublished: true,
        ...(q && typeof q === "string"
          ? {
              OR: [
                {
                  title: { contains: q, mode: "insensitive" },
                },
                {
                  genre: { contains: q, mode: "insensitive" },
                },
                {
                  artist: {
                    name: { contains: q, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
        ...(genre && typeof genre === "string"
          ? { genre: { equals: genre, mode: "insensitive" } }
          : {}),
      },
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        album: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: Number(limit),
    });
    const total = await prisma.song.count({
      where: {
        isPublished: true,
        ...(q && typeof q === "string"
          ? {
              OR: [
                {
                  title: { contains: q, mode: "insensitive" },
                },
                {
                  genre: { contains: q, mode: "insensitive" },
                },
                {
                  artist: { name: { contains: q, mode: "insensitive" } },
                },
              ],
            }
          : {}),
      },
    });
    res.status(200).json({
      status: "success",
      data: songs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch {
    return res.status(500).json({
      status: "success",
      message: "Failed to fetch Song",
    });
  }
};

export const getPublicSongById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Id",
      });
    }

    const song = await prisma.song.findFirst({
      where: {
        id,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        genre: true,
        audioUrl: true,
        coverImgUrl: true,
        playCount: true,
        duration: true,
        language: true,
        releaseDate: true,
        createdAt: true,
        artist: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        album: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
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
  } catch (error) {
    console.error("Get public song by id error:", error);

    return res.status(500).json({
      status: "fail",
      message: "Failed to fetch song",
    });
  }
};
export const getPublicAlbums = async (req: Request, res: Response) => {
  try {
    const { q, page = "1", limit = "20" } = req.params;
    const skip = (Number(page) - 1) * Number(20);
    const albums = await prisma.album.findMany({
      where: {
        isPublished: true,
        ...(q && typeof q === "string"
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { artist: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        artist: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });
    return res.status(200).json({
      status: "success",
      data: albums,
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Faild to fetch albums",
    });
  }
};

export const getPublicAlbumById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Id",
      });
    }
    const album = await prisma.album.findFirst({
      where: { id, isPublished: true },
      include: {
        artist: {
          select: { id: true, name: true, avatarUrl: true },
        },
        songs: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
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
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Failed to fetch album",
    });
  }
};

export const getPublicArtistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Id",
      });
    }
    const artist = await prisma.account.findFirst({
      where: { id, role: "artist" },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        songs: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            genre: true,
            audioUrl: true,
            coverImgUrl: true,
            playCount: true,
            duration: true,
            createdAt: true,
            artist: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            album: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
              },
            },
          },
        },
        albums: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            coverUrl: true,
            releaseDate: true,
            _count: {
              select: {
                songs: true,
              },
            },
          },
        },
      },
    });
    if (!artist) {
      return res
        .status(404)
        .json({ status: "fail", message: "Artist is not found" });
    }
    return res.status(200).json({
      status: "success",
      data: artist,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to fetch artist info",
    });
  }
};

export const incrementPlayCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Id",
      });
    }
    const song = await prisma.song.findFirst({
      where: {
        id,
        isPublished: true,
      },
      select: {
        id: true,
        playCount: true,
      },
    });
    if (!song) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found",
      });
    }
    const updated = await prisma.song.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      select: { playCount: true },
    });
    return res.status(200).json({
      status: "success",
      data: {
        playCount: updated.playCount,
      },
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Failed to record play",
    });
  }
};
