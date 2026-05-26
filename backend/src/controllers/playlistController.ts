import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
const parseBoolean = (value: unknown) => {
  return value === true || value === "true";
};

export const getMyPlaylists = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const playlists = await prisma.playlist.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        coverUrl: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            songs: true,
          },
        },
      },
    });
    return res.status(200).json({
      status: "success",
      data: playlists,
    });
  } catch (error) {
    console.error("Get playlists error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to get playlists",
    });
  }
};

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { title, description, isPublic } = req.body;
    const coverUrl =
      req.file && "path" in req.file
        ? (req.file.path as string)
        : req.body.coverUrl || null;
    const playlist = await prisma.playlist.create({
      data: {
        title: title?.trim() || "My Playlist",
        description: description?.trim() || null,
        coverUrl: coverUrl,
        isPublic: parseBoolean(isPublic),
        ownerId,
      },
    });
    return res.status(201).json({
      status: "success",
      message: "Playlist created",
      data: playlist,
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to create playlist",
    });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { playlistId } = req.params;
    if (!playlistId || typeof playlistId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Playlist Id is not provided",
      });
    }
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        OR: [{ ownerId }, { isPublic: true }],
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        songs: {
          orderBy: {
            addedAt: "asc",
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
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({
        status: "fail",
        message: "Playlist is not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: playlist,
    });
  } catch (error) {
    console.error("Get playlists by id error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to get playlists by id",
    });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    const { playlistId } = req.params;
    if (!playlistId || typeof playlistId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Playlist Id is not provided",
      });
    }
    const { title, description, isPublic } = req.body;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId,
      },
    });
    if (!existingPlaylist) {
      return res.status(404).json({
        status: "fail",
        message: "Playlist is not found",
      });
    }
    const coverUrl =
      req.file && "path" in req.file
        ? (req.file.path as string)
        : req.body.coverUrl;
    const playlist = await prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        ...(title !== undefined && {
          title: title.trim() || "My Playlist",
        }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(coverUrl !== undefined && {
          coverUrl: coverUrl || null,
        }),
        ...(isPublic !== undefined && {
          isPublic: parseBoolean(isPublic),
        }),
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Playlist updated",
      data: playlist,
    });
  } catch (error) {
    console.error("Update playlist error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to update playlist",
    });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    const { playlistId } = req.params;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    if (!playlistId || typeof playlistId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Playlist Id is not provided",
      });
    }
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId,
      },
    });
    if (!existingPlaylist) {
      return res.status(404).json({
        status: "fail",
        message: "Playlist is not found",
      });
    }
    await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Playlist deleted",
    });
  } catch (error) {
    console.error("Delete playlist error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to delete playlist",
    });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    const { playlistId, songId } = req.params;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    if (!playlistId || typeof playlistId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Playlist Id not provided",
      });
    }
    if (!songId || typeof songId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Song Id not provided",
      });
    }
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId,
      },
    });
    if (!playlist) {
      return res.status(404).json({
        status: "fail",
        message: "Playlist not found",
      });
    }
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });
    if (!song) {
      return res.status(404).json({
        status: "fail",
        message: "Song not found",
      });
    }
    const playlistSong = await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
      update: {},
      create: {
        playlistId,
        songId,
      },
    });
    return res.status(201).json({
      status: "success",
      data: playlistSong,
      message: "Song added to playlist",
    });
  } catch (error) {
    console.error("Add song to playlist error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to add song to playlist",
    });
  }
};

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    const { playlistId, songId } = req.params;
    if (!playlistId || typeof playlistId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Playlist Id not provided",
      });
    }
    if (!songId || typeof songId !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Song Id is not provided",
      });
    }
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId,
      },
    });
    if (!playlist) {
      return res.status(404).json({
        status: "fail",
        message: "Playlist not found",
      });
    }
    const existingPlaylistSong = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
    if (!existingPlaylistSong) {
      return res.status(404).json({
        status: "fail",
        message: "Song is not found in the playlist",
      });
    }
    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Remove song from playlist successfully",
    });
  } catch (error) {
    console.error("Remove song to playlist error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Failed to remove song from playlist",
    });
  }
};
