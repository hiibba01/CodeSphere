import Room from "../models/room.model.js";
import crypto from 'crypto';


export const createRoom = async(req, res)=>{
    try {

        const {roomName, description} = req.body;
        if(!roomName){
            return res.status(400).json({
                success: false,
                message: "Room name is required!"
            });
        }

        const owner = req.user._id;

        let roomCode;
        let roomExists = true;
        while(roomExists){
            roomCode = crypto
              .randomBytes(3)
              .toString("hex")
              .toUpperCase();

            roomExists = await Room.findOne({ roomCode });
        }

        const room = await Room.create({
            roomName: roomName.trim(),
            description: description?.trim() || "",
            roomCode,
            owner,
            members: [owner],
            isActive: true,
            lastActivity: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully!",
            room
        });
        
    } catch (error) {

        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
        
    }
}


export const joinRoom = async(req,res)=>{
    try {
        const {roomCode} = req.body;

        if(!roomCode){
            return res.status(400).json({
                success: false,
                message: "Room code is required!"
            })
        }

        const room  = await Room.findOne({
            roomCode: roomCode.toUpperCase()
        });

        if(!room){
            return res.status(404).json({
                success: false,
                message: "Room not found!"
            })
        }

        const userId = req.user._id;

        const alreadyMember = room.members.some(
            (member) => member.toString() === userId.toString()
        );

        if(alreadyMember){
            return res.status(400).json({
                success: false,
                message: "User is already in the room!"
            });
        }

        room.members.push(userId);
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Joined room successfully!",
            room
        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
        
    }
}

export const getMyRooms = async(req,res)=>{
    try {
        

        const userId = req.user._id;

        const rooms = await Room.find({
            members: userId,
        }).sort({ lastActivity: -1 });

        return res.status(200).json({
            success: true,
            message: "Rooms fetched successfully!",
            rooms
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
        
    }
}


export const getRoomById = async(req,res)=>{
    try {

        const { roomId } = req.params;

        console.log("Room ID:", roomId);

        const room = await Room.findById(roomId);

        console.log("Room:", room);

        if(!room){
            return res.status(404).json({
                success: false,
                message: "Room not found!"
            })
        }

        const userId = req.user._id;

        console.log("Logged in user ID:", userId);   
        console.log("Room members:", room.members);

        const isMember = room.members.some(
            (member) => member.toString() === userId.toString()
        );

        if(!isMember){
            return res.status(403).json({
                success: false,
                message: "You are not a member of this room!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room details fetched successfully!",
            room
        });

        
    } catch (error) {

        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
        
    }
}