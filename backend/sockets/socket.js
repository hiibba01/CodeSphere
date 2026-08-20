import Room from "../models/room.model.js";
const roomParticipants = {};

const socketHolder = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("send-message", ({ roomId, message, sender}) => {
            socket.to(roomId).emit("receive-message", { 
                message,
                sender
            });
        });

        socket.on("code-change", ({roomId,code})=>{
            socket.to(roomId).emit("code-update", code);
        });

        socket.on("language-change", ({roomId, language})=>{
            socket.to(roomId).emit("language-change", language);
        });

        socket.on("start-draw", ({ roomId, x, y , color, brushSize}) => {
            socket.to(roomId).emit("start-draw", {
                x,
                y,
                color,
                brushSize
            });
        });

        socket.on("draw", ({roomId, x, y, color, brushSize}) => {
            socket.to(roomId).emit("draw", {
                x,
                y,
                color,
                brushSize
            });
        });

        socket.on("stop-draw", ({ roomId }) => {
            socket.to(roomId).emit("stop-draw");
        });

        socket.on("clear-canvas", ({ roomId }) => {
            socket.to(roomId).emit("clear-canvas");
        });

        socket.on("undo", ({roomId, removedStroke}) => {
            socket.to(roomId).emit("undo", removedStroke);
        });

        socket.on("redo", ({ roomId, stroke }) => {
            socket.to(roomId).emit("redo", stroke);
        });

        socket.on("join-room", ({ roomId, name, profileImage, userId }) => {

            
            socket.join(roomId);

            socket.roomId = roomId;
            socket.userId = userId;

            console.log(`${name} ${socket.id} joined room ${roomId}`);

            if(!roomParticipants[roomId]) {
                roomParticipants[roomId] = [];
            }

            roomParticipants[roomId] = roomParticipants[roomId].filter(
                (user) => user.socketId !== socket.id
            );


            roomParticipants[roomId].push({
                socketId: socket.id,
                userId,
                name,
                profileImage
            });

            
                Room.findById(roomId)
    .then((room) => {
        if (!room) return;

        const existingParticipant = room.participantsHistory.find(
            (participant) =>
                participant.user.toString() === userId.toString()
        );

        if (existingParticipant) {
            existingParticipant.isActive = true;
            existingParticipant.lastActive = new Date();
            existingParticipant.name = name;
            existingParticipant.profileImage = profileImage;
        } else {
            room.participantsHistory.push({
                user: userId,
                name,
                profileImage,
                isActive: true,
                lastActive: new Date()
            });
        }

        return room.save();
    }).then(() => {
    io.emit("participant-status-updated");
})
    .catch((error) => {
        console.log("Error saving participant history:", error);
    });


            io.to(roomId).emit(
                "participants-updated",
                roomParticipants[roomId]
            );

            
        });
   socket.on("leave-room", async () => {

    const roomId = socket.roomId;
    const userId = socket.userId;

    console.log("LEAVE ROOM RECEIVED:", {
        roomId,
        userId
    });

    if (!roomId || !userId) return;

    socket.leave(roomId);

    // Remove this socket from active participants
    if (roomParticipants[roomId]) {

        roomParticipants[roomId] =
            roomParticipants[roomId].filter(
                (user) => user.socketId !== socket.id
            );

        io.to(roomId).emit(
            "participants-updated",
            roomParticipants[roomId]
        );
    }

    try {

        const room = await Room.findById(roomId);

        if (!room) return;

        // Check if the same user still has another socket
        const stillConnected = roomParticipants[roomId]?.some(
            (user) =>
                user.userId?.toString() === userId.toString()
        );

        const participant = room.participantsHistory.find(
            (user) =>
                user.user.toString() === userId.toString()
        );

        if (participant && !stillConnected) {

            participant.isActive = false;
            participant.lastActive = new Date();

            console.log(
                "SETTING USER INACTIVE:",
                participant.name
            );

            await room.save();

            io.emit("participant-status-updated");
        }

    } catch (error) {

        console.log(
            "Error updating participant:",
            error
        );
    }
});

       socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const roomId = socket.roomId;
    const userId = socket.userId;

    if (!roomId || !userId) return;

    // Remove user from currently connected users
    if (roomParticipants[roomId]) {
        roomParticipants[roomId] =
            roomParticipants[roomId].filter(
                (user) => user.socketId !== socket.id
            );

        io.to(roomId).emit(
            "participants-updated",
            roomParticipants[roomId]
        );
    }

    try {
        const room = await Room.findById(roomId);

        if (!room) return;

        const participant =
            room.participantsHistory.find(
                (user) =>
                    user.user.toString() === userId.toString()
            );

        if (participant) {
            participant.isActive = false;
            participant.lastActive = new Date();

            console.log(
                "SETTING INACTIVE:",
                participant.name
            );

            await room.save();
        }

        // Tell everyone in this room that status changed
        io.to(roomId).emit(
            "participant-status-updated"
        );

    } catch (error) {
        console.log(
            "Error updating participant on disconnect:",
            error
        );
    }
});

        socket.on("draw-shape", ({ roomId, ...shapeData }) => {
            socket.to(roomId).emit("draw-shape", shapeData);
        });
    });
}

export default socketHolder;