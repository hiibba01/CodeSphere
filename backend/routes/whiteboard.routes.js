import express from "express";
import { saveWhiteboard,getWhiteboard } from "../controllers/whiteboard.Controller.js";

const router = express.Router();

router.post("/save", saveWhiteboard);

router.get(":/roomId", getWhiteboard);

export default router;