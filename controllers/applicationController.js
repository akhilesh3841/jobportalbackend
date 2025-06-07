
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";




export const postApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, coverletter } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !coverletter) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const jobSeekerInfo = {
      id: req.user._id,
      name,
      email,
      phone,
      address,
      coverletter,
      role: "Job Seeker",
    };

    // Check job existence
    const jobDetails = await Job.findById(id);
    if (!jobDetails) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if already applied
    const isAlreadyApplied = await Application.findOne({
      "jobInfo.jobId": id,
      "jobSeekerInfo.id": req.user._id,
    });

    if (isAlreadyApplied) {
      return res.status(400).json({
        message: "You have already applied for this job.",
      });
    }

    // Resume handling
    if (req.files && req.files.resume) {
      const { resume } = req.files;
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          resume.tempFilePath,
          {
            folder: "Job_Seekers_Resume",
          }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
          return res.status(500).json({
                message: "Failed to upload resume to cloudinary.",
          });
        }

        jobSeekerInfo.resume = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      } catch (error) {
        return res.status(500).json({
            message: "Failed to upload resume.",
        });
      }
    } else {
      // If resume file not present in request, use existing resume
      if (!req.user.resume?.url) {
        return res.status(400).json({
            message: "Please upload your resume.",
        });
      }

      jobSeekerInfo.resume = {
        public_id: req.user.resume.public_id,
        url: req.user.resume.url,
      };
    }

    const employerInfo = {
      id: jobDetails.postedBy,
      role: "Employer",
    };

    const jobInfo = {
      jobId: id,
      jobTitle: jobDetails.title,
    };

    const application = await Application.create({
      jobSeekerInfo,
      employerInfo,
      jobInfo,
    });

    res.status(201).json({
      message: "Application submitted.",
      data:application,
    });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({
    
      message: error.message || "Something went wrong.",
    });
  }
};



export const employerGetAllApplication = async (req, res) => {
  try {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      data:applications,
    });
    
  } catch (error) {
    console.log(error);
  }
  }
;



export const jobSeekerGetAllApplication = async (req, res) => {
  try {
     const { _id } = req.user;
    const applications = await Application.find({
      "jobSeekerInfo.id": _id,
      "deletedBy.jobseeker": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.log(error)
  }
}
;


export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const { role } = req.user;

    switch (role) {
      case "Job Seeker":
        application.deletedBy.jobSeeker = true;
        await application.save();
        break;

      case "Employer":
        application.deletedBy.employer = true;
        await application.save();
        break;

      default:
        console.log("Default case for application delete function.");
        return res.status(400).json({
            message: "Invalid user role.",
        });
    }

    // If both Job Seeker and Employer have deleted
    if (
      application.deletedBy.employer === true &&
      application.deletedBy.jobSeeker === true
    ) {
      await application.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: "Application deleted.",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);
    res.status(500).json({
    
      message: "Something went wrong while deleting the application.",
    });
  }
};




