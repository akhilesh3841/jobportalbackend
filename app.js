import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();
import {connection} from './database/connection.js';
import fileUpload from 'express-fileupload';
import userRouter from './routes/userRouter.js';
import jobRouter from './routes/jobRouter.js'
import applicationRouter from './routes/applicationRouter.js'

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file



config({ path: "./config/.env" });


app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:['GET', 'POST','DELETE', 'PUT'],
    credentials:true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './temp/', // Make sure this folder exists
}));

  


 app.use('/api/v1/users',userRouter);
 
 app.use('/api/v1/job',jobRouter);
 
 app.use('/api/v1/application',applicationRouter);

connection();
// app.use(middleware);




export default app;