import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema({
  jobSeekerInfo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    resume: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["Job Seeker"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Accepted", "Rejected"],
      default: "Applied",
    },
  },

  employerInfo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer"],
      required: true,
    },
  },

  jobInfo: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
  },

  deletedBy: {
    jobSeeker: {
      type: Boolean,
      default: false,
    },
    employer: {
      type: Boolean,
      default: false,
    },
  },
});

export const Application = mongoose.model("Application", applicationSchema);
