import express from "express";
import { getMe, login, logout, signup } from "../controllers/authController";
import { protect } from "../middlewares/protect";
const authRouter = express.Router();
authRouter.use(protect);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", getMe);
authRouter.post("/logout", logout);

export default authRouter;
