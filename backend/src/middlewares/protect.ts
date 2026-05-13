import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Not authenticated",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      userRole: Role;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
  }
};
