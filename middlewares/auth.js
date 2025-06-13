
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file




export const isauthenticated =async(req,res,next)=>{
    try {
    const {token}=req.cookies;
    if(!token) {
       return res.status(401).json({ message: "Please Login!" });
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
    const { _id }=decoded;

    const user=await User.findById(_id);
    if(!user) {
       return res.status(401).json({ message: "User not found" });
    }

    req.user=user;//attach user object to req
    next();
        
    } catch (error) {
     res.status(401).json({ message: "Authentication failed: " + error.message });   
    }
};

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `${req.user.role} is not authorized to access this resource.`,
      });
    }
    next();
  };
};
