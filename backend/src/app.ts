import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./lib/prisma";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes";
import songRouter from "./routes/songRoutes";
import albumRouter from "./routes/albumRoutes";
import publicRouter from "./routes/publicRoutes";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get("/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    res.json({
      success: true,
      message: "Database connected successfully 🚀",
      timestamp: result,
    });
    console.log("Database connection success");
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed ❌",
      error: error instanceof Error ? error.message : error,
    });
  }
});
app.use("/api/auth", authRouter);
app.use("/api/songs", songRouter);
app.use("/api/albums", albumRouter);
app.use("/api/public", publicRouter);

app.get("/", (req, res) => {
  res.send(`Backend running`);
});

export default app;
