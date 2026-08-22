import express from "express";
import { register, login } from "../controllers/auth.Controller.js";
import uploads from "../middleware/uploads.js";

export const router = express.Router();

router.post(
    "/register",
    (req, res, next) => {
        uploads.single("profileImage")(req, res, (err) => {
            if (err) {
                console.error("MULTER ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: err.message,
                    error: err.code || "UNKNOWN"
                });
            }

            next();
        });
    },
    register
);

router.post("/login", login);

export default router;