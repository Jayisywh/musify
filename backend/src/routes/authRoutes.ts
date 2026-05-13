import express from "express";
import { getMe, login, logout, signup } from "../controllers/authController";
const authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", getMe);
authRouter.post("/logout", logout);

export default authRouter;
