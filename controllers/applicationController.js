
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file


export const postApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const jobSeekerInfo = {
      id: req.user._id,
      name,
      email,
      phone,
      address,
      role: "Job Seeker",
    };

    // Fetch job details
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

    // ✅ Resume Handling
    if (req.files && req.files.resume) {
      const { resume } = req.files;

      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          resume.tempFilePath,
          { folder: "Job_Seekers_Resume" }
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
      // If not uploading new resume, use from user DB
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

    // ✅ Employer Info
    const employerInfo = {
      id: jobDetails.postedBy,
      role: "Employer",
    };

    // ✅ Job Info (consistent field names!)
    const jobInfo = {
      jobId: id,
      jobTitle: jobDetails.title,
      companyName: jobDetails.companyName,
      location: jobDetails.location,
      salary: jobDetails.salary,
      jobType: jobDetails.jobType,
    };

    // ✅ Create application
    const application = await Application.create({
      jobSeekerInfo,
      employerInfo,
      jobInfo,
      status: "Applied",
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong.",
    });
  }
};


export const acceptedorRejected = async (req, res) => {
  try {
    const { status, jobid, touserid } = req.params;
    const allowedStatus = ["Accepted", "Rejected"];

    // Check if status is valid
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status not allowed!" });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(jobid) ||
      !mongoose.Types.ObjectId.isValid(touserid)
    ) {
      return res.status(400).json({ message: "Invalid Job ID or User ID." });
    }

    // Update only the status using findOneAndUpdate to avoid validation errors
    const updatedApplication = await Application.findOneAndUpdate(
      {
        "jobInfo.jobId": jobid,
        "jobSeekerInfo.id": touserid,
      },
      {
        $set: {
          "jobSeekerInfo.status": status,
        },
      },
      {
        new: true, // return the updated document
      }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully.`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error in acceptedOrRejected:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const employerGetAllApplication = async (req, res) => {
  try {
    const employerId = req.user._id;

    const applications = await Application.find({
      "employerInfo.id": employerId,
      "jobSeekerInfo.status": "Applied"
    })
    .populate("jobSeekerInfo.id", "name email")
    .populate("jobInfo.jobId", "title jobType location companyName salary");

    res.status(200).json({
      message: "All applications fetched successfully.",
      data: applications,
    });

  } catch (error) {
    console.error("Error in employerGetAllApplication:", error);
    res.status(500).json({
      message: "Failed to fetch applications.",
      error: error.message,
    });
  }
};





export const jobSeekerGetAllApplication = async (req, res) => {
  try {
    const id = req.user._id;

    const applications = await Application.find({
      "jobSeekerInfo.id": id,
    })
      .populate("jobSeekerInfo.id", "name email") // populate job seeker info
      .populate("jobInfo.jobId", "title jobType location companyName salary"); // correct select syntax

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
