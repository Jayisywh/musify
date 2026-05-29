import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;
    const isExisting = await prisma.account.findUnique({
      where: {
        email: email,
      },
    });
    if (isExisting) {
      return res.status(400).json({ message: "User is already existed" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.account.create({
      data: {
        username: username,
        email,
        hashedPassword: hashPassword,
        name,
      },
    });
    const payload = {
      userId: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      status: "success",
      data: {
        username: user.name,
        role: user.role,
      },
      message: "Account created successfully",
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Failed to create an account",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.account.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const payload = {
      userId: user.id,
      userRole: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      status: "success",
      data: {
        userName: user.name,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch {
    return res.status(500).json({
      status: "fail",
      message: "Failed to login to an account",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const account = await prisma.account.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
    if (!account) {
      return res.status(401).json({
        message: "Account not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: account,
    });
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};
