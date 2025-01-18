import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [50, "Name must not exceed 50 characters"],
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    phone: {
        type: String, // Change to String to handle leading zeros in phone numbers
        required: true,
        minLength: [10, "Phone number must be at least 10 digits"],
        maxLength: [15, "Phone number must not exceed 15 digits"],
    },
    address: {
        type: String,
        required: true,
    },
    niches: {
        firstNiche: String,
        secondNiche: String,
        thirdNiche: String,
    },
    password: {
        type: String,
        required: true,
        select:false,
    },
    resume: {
        public_id: String,
        url: String,
    },
    coverletter: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        enum: ["Job Seeker", "Employer"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});






userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };
  

  
export const User = mongoose.model("User", userSchema);
