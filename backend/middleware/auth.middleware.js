import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async(req, res, next) =>{
    try {
        

        const authHeader = req.headers.authorization;
        console.log(authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized! No token provided!",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found!"
            });
        }

        req.user = user;
        next();


    } catch (error) {
        console.log(error.message);
        return res.status(401).json({
            success: false,
            message: "Unauthorized! Invalid or expired token!"
        });
    }
}

export default protect;