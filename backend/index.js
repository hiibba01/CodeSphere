import express from "express";
import "dotenv/config"
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDatabase from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import socketHolder from "./sockets/socket.js";
import codeRoutes from './routes/code.routes.js';
import whiteboardRoutes from "./routes/whiteboard.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://codespherefrontend-3ip2.onrender.com",
        methods: ["GET", "POST"]
    }
});


app.use(
    cors({
        origin: "https://codespherefrontend-3ip2.onrender.com",
        credentials: true,
    })
);

app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

connectDatabase();

app.use("/api/auth", authRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/code", codeRoutes);

app.use("/api/whiteboard", whiteboardRoutes);

socketHolder(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}!`);
})