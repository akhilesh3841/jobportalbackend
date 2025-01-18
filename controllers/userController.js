import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler  from "../middlewares/error.js";
import {User} from "../models/userSchema.js"
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcrypt";



export const register=catchAsyncErrors(async(req,res,next)=>{
    try {
        const {name,email,phone,address,password,role,firstNiche,secondNiche,thirdNiche,coverletter}=req.body;
        //user se request kiye ki data bhejo

        if(!name||!email||!phone||!address||!password||!role){
            return next(new ErrorHandler("all fields required",400));
        }  //yadi ek bhi data missing hai to sabhi field bharo
    

        //yadi sara fieild bhar diya to aage bhadoo



    
        if(role=="Job Seeker" &&(!firstNiche || !secondNiche ||!thirdNiche) ){
            return next(new ErrorHandler("Please provide your preferred niches.",400));
        }//check karo ki tum Job Seeker ho ki nhi
    


        const userExists=await User.findOne({email});
        if(userExists){
            return next(new ErrorHandler("email already exists",400))
        }//check karo jo email register kar rhe ho wo pehlese nhi hai na



        const hashpassword=await bcrypt.hash(password,10);



        //yadi nhi hai to datauserka store karo

    
        const userData={
            name,
            email,
            phone,
            address,
            password: hashpassword,
            role,
            niches:{
                firstNiche,
                secondNiche,
                thirdNiche,
            },
            coverletter,
        }
        if (req.files && req.files.resume) {
            const { resume } = req.files;
            if (resume) {
              try {
                const cloudinaryResponse = await cloudinary.uploader.upload(
                  resume.tempFilePath,
                  { folder:"Job_Seekers_Resume"}
                );
                if (!cloudinaryResponse || cloudinaryResponse.error) {
                  return next(
                    new ErrorHandler("Failed to upload resume to cloud.", 500)
                  );
                }
                userData.resume = {
                  public_id: cloudinaryResponse.public_id,
                  url: cloudinaryResponse.secure_url,
                };
              } catch (error) {
                return next(new ErrorHandler("Failed to upload resume", 500));
              }
            }
          }
          
        //creating a new instnace of user model
        const user=await User.create(userData);

        sendToken(user, 201, res, "User Registered.");
    } catch (error) {
        next(error);
    }
})


export const login = catchAsyncErrors(async (req, res, next) => {
  const { role, email, password } = req.body;
  
  // Check if required fields are present
  if (!role || !email || !password) {
      return next(new ErrorHandler("Role, email, and password are required", 400));
  }

  // Find the user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
  }

  // Compare provided password with hashed password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
  }
  if (user.role!==role) {
    return next(new ErrorHandler("Invalid user role", 400));
}


  // Generate token and send response
  sendToken(user, 200, res, "Login successful.");
});


export const logout=catchAsyncErrors(async(req,res,next) =>{
  res.status(200).cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    }).json({
      success:true,
      message:"Logged out successfully"
    })

})



export const getuser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
  };
  const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

  if (
    req.user.role === "Job Seeker" &&
    (!firstNiche || !secondNiche || !thirdNiche)
  ) {
    return next(
      new ErrorHandler("Please provide your all preferred job niches.", 400)
    );
  }
  if (req.files) {
    const resume = req.files.resume;
    if (resume) {
      const currentResumeId = req.user.resume.public_id;
      if (currentResumeId) {
        await cloudinary.uploader.destroy(currentResumeId);
      }
      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "Job_Seekers_Resume",
      });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
    message: "Profile updated.",
  });
});
