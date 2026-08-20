import Room from "../models/room.model.js"


export const saveWhiteboard = async(req,res)=>{

    try {

        const { roomId, whiteboardData } = req.body;

        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required",
            });
        }

        await Room.findByIdAndUpdate(
            roomId,
            {
                whiteboardData,
                lastActivity: new Date(),
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Whiteboard saved successfully!",
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}


export const getWhiteboard = async(req,res)=>{
    try {
        
        const {roomId} = req.params;

        const room = await Room.findById(roomId).select("whiteboardData");

        if(!room){
            return res.status(404).json({
                message: "Room not found!",
            });
        }

        res.status(200).json({
            success: true,
            whiteboardData: room.whiteboardData || [],
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
        
    }
}