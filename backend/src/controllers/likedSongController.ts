import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const addFavoriteSong = async (req: Request, res: Response) => {
  try {
    const listenerId = req.user?.userId;
    if (!listenerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { songId } = req.params;
    if (!songId || typeof songId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Song Id is not provided",
      });
    }
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });
    if (!song) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found",
      });
    }
    const favorite = await prisma.favoriteSong.upsert({
      where: {
        listenerId_songId: {
          listenerId,
          songId,
        },
      },
      update: {},
      create: {
        listenerId,
        songId,
      },
      include: {
        song: true,
      },
    });
    return res.status(201).json({
      status: "success",
      message: "Song added to liked songs",
      data: favorite,
    });
  } catch (error) {
    console.error("Add favorite song error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to add favorite song",
    });
  }
};

export const removeFavoriteSong = async (req: Request, res: Response) => {
  try {
    const listenerId = req.user?.userId;
    if (!listenerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { songId } = req.params;
    if (!songId || typeof songId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Song Id is not provided",
      });
    }
    const favorite = await prisma.favoriteSong.findUnique({
      where: {
        listenerId_songId: {
          listenerId,
          songId,
        },
      },
    });
    if (!favorite) {
      return res.status(404).json({
        status: "fail",
        message: "Favorite song is not found",
      });
    }
    await prisma.favoriteSong.delete({
      where: {
        listenerId_songId: {
          listenerId,
          songId,
        },
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Song removed from liked songs",
    });
  } catch (error) {
    console.error("Remove favorite song error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to remove favorite song",
    });
  }
};

export const getFavoriteSongs = async (req: Request, res: Response) => {
  try {
    const listenerId = req.user?.userId;
    if (!listenerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const favorites = await prisma.favoriteSong.findMany({
      where: {
        listenerId,
      },
      orderBy: {
        addedAt: "desc",
      },
      include: {
        song: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });
    return res.status(200).json({
      status: "success",
      data: favorites,
    });
  } catch (error) {
    console.error("Get favorite songs error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to get favorite songs",
    });
  }
};

export const checkFavoriteSong = async (req: Request, res: Response) => {
  try {
    const listenerId = req.user?.userId;
    if (!listenerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { songId } = req.params;
    if (!songId || typeof songId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Song Id is not provided",
      });
    }
    const favorite = await prisma.favoriteSong.findUnique({
      where: {
        listenerId_songId: {
          listenerId,
          songId,
        },
      },
    });
    return res.status(200).json({
      status: "success",
      isLiked: Boolean(favorite),
    });
  } catch (error) {
    console.error("Check favorite song error", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to check favorite song",
    });
  }
};
