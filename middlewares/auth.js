import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const isauthenticated =catchAsyncErrors(async(req,resizeBy,next)=>{
    const {token}=req.cookies;
    if(!token) {
        return next(new ErrorHandler("You are not authenticated", 401));
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user=await User.findById(decoded.id);
    next();
});

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler("You are not authorized to access this resource", 403));
        }
        next(); // Move inside and only execute if user is authorized
    };
};
