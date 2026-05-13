import { NextFunction, Request, Response } from "express";

export const artistOnly = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }
    if (req.user.userRole !== "artist") {
      return res.status(403).json({
        status: "fail",
        message: "Only artists can perform this action",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Not authorized",
    });
  }
};
