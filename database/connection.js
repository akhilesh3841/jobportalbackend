import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file




export const connection = async() => {
     await mongoose.connect(process.env.MONGO_URI, {
        dbName: "JOB_PORTAL",
    })
    .then(() => {
        console.log("Database connected successfully!");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
    });
};
