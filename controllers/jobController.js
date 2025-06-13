
import {User} from "../models/userSchema.js"
import { Job } from "../models/jobSchema.js";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file



export const postJob = async (req, res) => {
  try {
    const {
      title,
      jobType,
      location,
      companyName,
      introduction,
      responsibilities,
      qualifications,
      offers,
      salary,
      hiringMultipleCandidates,
      personalWebsiteTitle,
      personalWebsiteUrl,
      jobNiche,
    } = req.body;

    // Required fields validation
    if (
      !title ||
      !jobType ||
      !location ||
      !companyName ||
      !introduction ||
      !responsibilities ||
      !qualifications ||
      !salary
    ) {
      return res.status(400).json({ message: "Please provide full job details." });
    }

    // Website title/url validation
    if (
      (personalWebsiteTitle && !personalWebsiteUrl) ||
      (!personalWebsiteTitle && personalWebsiteUrl)
    ) {
      return res.status(400).json({
        message: "Provide both the website URL and title, or leave both blank.",
      });
    }

    const postedBy = req.user._id;

    // Check if a job already exists with the same title, company, and location
    const existingJob = await Job.findOne({
      title,
      companyName,
      location,
      postedBy,  // optionally check postedBy if you want user-specific uniqueness
    });

    if (existingJob) {
      return res.status(409).json({
        message: "You have already posted a similar job.",
      });
    }

    // If not existing, create the job
    const job = await Job.create({
      title,
      jobType,
      location,
      companyName,
      introduction,
      responsibilities,
      qualifications,
      offers,
      salary,
      hiringMultipleCandidates,
      personalWebsite: {
        title: personalWebsiteTitle,
        url: personalWebsiteUrl,
      },
      jobNiche,
      postedBy,
    });

    res.status(201).json({
      message: "Job posted successfully.",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};





  export const getAllJobs = async (req, res) => {
    const { city, niche, searchKeyword } = req.query;
    const query = {};
    if (city) {
      query.location = city;
    }
    if (niche) {
      query.jobNiche = niche;
    }
    if (searchKeyword) {
      query.$or = [
        { title: { $regex: searchKeyword, $options: "i" } },
        { companyName: { $regex: searchKeyword, $options: "i" } },
        { introduction: { $regex: searchKeyword, $options: "i" } },
      ];
    }
    const jobs = await Job.find(query);
    res.status(200).json({
      data:jobs,
    });
  };
  
  
  export const getMyJobs = async (req, res) => {
    const myJobs = await Job.find({ postedBy: req.user._id });
    res.status(200).json({
      data:myJobs,
    });
  };



export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
          message: "Oops! Job not found.",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      message: "Job deleted.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Something went wrong.",
    });
  }
};
