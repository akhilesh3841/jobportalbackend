import app from './app.js';
import cloudinary from "cloudinary";


  
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file




cloudinary.v2.config(({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

}))

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);      //yeh karne se undefined aayega to pehlek
})