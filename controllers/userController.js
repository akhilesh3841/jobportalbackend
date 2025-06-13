
import {User} from "../models/userSchema.js"
import { v2 as cloudinary } from "cloudinary";

import bcrypt from "bcrypt";
import crypto from "crypto"
import nodemailer from "nodemailer"

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file






export const register = async (req, res) => {
  try {
    const { name, email, phone, address, password, role, coverletter } = req.body;

    if (!name || !email || !phone || !address || !password || !role) {
      return res.status(400).json({  message: "All fields are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({  message: "Email already exists." });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const userData = new User({
      name,
      email,
      phone,
      address,
      password: hashpassword,
      role,
      coverletter,
    });

    // Resume upload
    if (req.files?.resume) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          req.files.resume.tempFilePath,
          { folder: "Job_Seekers_Resume",
             resource_type: "raw"
           }
        );

        userData.resume = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      } catch (error) {
        console.log("Cloudinary Upload Error:", error);
        return res.status(500).json({
              message: "Resume upload failed.",
        });
      }
    }

    const saveuser = await userData.save();
    const token = await saveuser.getJWTToken();

  res.cookie("token", token, {
  expires: new Date(Date.now() + 8 * 360000000),
  httpOnly: true,
  secure: true,
  sameSite: "None"
});

    res.status(201).json({
      message: "User registered successfully.",
      data: saveuser,
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong.",
    });
  }
};




export const login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    // Step 1: Validation
    if (!role || !email || !password) {
      return res.status(400).json({
          message: "Role, email, and password are required.",
      });
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
          message: "Invalid email or password.",
      });
    }

    // Step 3: Match password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
          message: "Invalid email or password.",
      });
    }

    // Step 4: Role check
    if (user.role !== role) {
      return res.status(403).json({
          message: "Invalid user role.",
      });
    }

    // Step 5: Create token
    const token = await user.getJWTToken();

    // Step 6: Set cookie
  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  expires: new Date(Date.now() + 8 * 3600000)
});

    // Step 7: Send success response
    res.status(200).json({
      message: "Login successful.",
      data:user,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong during login.",
    });
  }
};



export const logout=async(req,res) =>{
  try {
    res.cookie("token",null,{
      expires:new Date(Date.now()),
      httpOnly:true,
    })
    res.status(200).json({
            message:"Logged out successfully"
        })
  } catch (error) {
      res.status(500).json({message:error.message});     
  }
}



export const getuser = async (req, res) => {
  try {
      const user = req.user;

         if(!user){
            return res.status(404).json({message:"User not found"});
        }
  res.status(200).json({
  data:user
  });
    
  } catch (error) {
         res.status(500).json({message:error.message});
        console.error(error);
  }
};



export const updateProfile = async (req, res) => {
  try {
    const loggedinuser = req.user;

    // Update allowed fields from req.body directly to the user object
    Object.keys(req.body).forEach((key) => {
      // Avoid overwriting sensitive fields like password or role unintentionally
      if (key !== "password" && key !== "role") {
        loggedinuser[key] = req.body[key];
      }
    });

    // Update nested niche fields
    loggedinuser.niches = {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    };

    // Handle resume upload
    if (req.files?.resume) {
      const resume = req.files.resume;
      const currentResumeId = loggedinuser.resume?.public_id;

      if (currentResumeId) {
        await cloudinary.uploader.destroy(currentResumeId);
      }

      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "Job_Seekers_Resume",
         resource_type: "raw"
      });

      loggedinuser.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }

    // Now save the updated user
    await loggedinuser.save();

    res.status(200).json({
      user: loggedinuser,
      message: "Profile updated.",
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      message: err.message || "Something went wrong.",
    });
  }
};




export const forgetpassword=async(req,res)=>{
    try {

        const {email}=req.body;

        if(!email){
            return res.status(400).json({
                message:"please provide an email"
            })
        }

        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({
                message:"account not found please create account first"
            })
        }
        
        const resetToken=crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires= Date.now() + 10 * 60 * 1000;
        await user.save();


        console.log("Raw token:", resetToken);
        console.log("Hashed token saved in DB:", user.resetPasswordToken);

        // 3. Send email (fake link for now)
        const resetLink = process.env.FRONTEND_URL+`/resetpassword/${resetToken}`; // replace with frontend link

        // Use nodemailer (for production, use a real SMTP service)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akhilesh4149yadav@gmail.com',
                pass: 'gych lseh dhne oydo' // Never use real password
            }
        });

        const mailOptions = {
            from: 'akhilesh4149yadav@gmail.com',
            to: user.email,
            subject: 'Reset your password',
            html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset link sent to your email' });


    } catch (error) {
          console.error('Error in forgetpassword:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        console.log("Token from URL:", token);

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Hash the token exactly the same way as in forgetpassword
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Hashed token:', tokenHash);

        // Find user with the hashed token and valid expiration time
        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Possible reasons:');
            console.log('1. Token not found in database');
            console.log('2. Token has expired');
            console.log('3. Hashing mismatch');
            
            // Additional debug: Check if token exists without expiration check
            const userWithTokenOnly = await User.findOne({ resetPasswordToken: tokenHash });
            if (userWithTokenOnly) {
                console.log('User found without expiration check, issue is likely expiration');
                console.log(`Token expires at: ${new Date(userWithTokenOnly.resetPasswordExpires)}`);
                console.log(`Current time is: ${new Date()}`);
            }
            
            return res.status(400).json({ message: 'Token is invalid or expired' });
        }

        // Update password and clear reset token fields
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};





