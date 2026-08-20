import express from "express";
import { createRoom, joinRoom, getMyRooms, getRoomById } from "../controllers/room.Controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get("/my-rooms", protect, getMyRooms);
router.get("/:roomId", protect, getRoomById);

export default router;
