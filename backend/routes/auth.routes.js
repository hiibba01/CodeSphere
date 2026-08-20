import express from "express";
import {register, login} from  "../controllers/auth.Controller.js";
import uploads from "../middleware/uploads.js";

export const router = express.Router();

router.post("/register", uploads.single("profileImage"), register);
router.post("/login", login);

export default router;