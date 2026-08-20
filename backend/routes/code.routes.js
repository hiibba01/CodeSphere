import express from "express";
import { saveCode, runCode } from "../controllers/code.Controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/save", protect, saveCode);
router.post("/run", protect, runCode);

export default router;