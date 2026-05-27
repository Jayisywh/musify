import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const search = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({
        status: "success",
        data: {
          songs: [],
          artists: [],
          albums: [],
        },
      });
    }

    const [songs, artists, albums] = await Promise.all([
      prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genre: { contains: query, mode: "insensitive" } },
            {
              artist: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { username: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        take: 20,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          genre: true,
          audioUrl: true,
          coverImgUrl: true,
          playCount: true,
          artist: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),

      prisma.account.findMany({
        where: {
          role: "artist",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 20,
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      }),

      prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              artist: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { username: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        take: 20,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          releaseDate: true,
          artist: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
    ]);

    console.log("Search controller response keys:", {
      songs: songs.length,
      artists: artists.length,
      albums: albums.length,
    });

    return res.status(200).json({
      status: "success",
      data: {
        songs,
        artists,
        albums,
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      status: "fail",
      message: "Failed to search",
    });
  }
};
