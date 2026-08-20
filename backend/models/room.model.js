import mongoose from "mongoose";
const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: [true, "Room name is required"],
            trim: true
        },
        roomCode: {
            type: String,
            required: [true, "Room code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: {
            type: [
                {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
                },
            ],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        lastActivity: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String,
            default: "",
            trim: true
        },

        whiteboardData: {
            type: Array,
            default: [],
        },
        code: {
            type: String,
            default: "// Write your code here....",
        },

        language: {
            type: String,
            default: "javascript",
        },

        participantsHistory: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                name: String,
                profileImage: String,
                isActive: Boolean,
                lastActive: Date

            }
        ]


    },{timestamps: true}
);


const Room = mongoose.model("Room", roomSchema);
export default Room;