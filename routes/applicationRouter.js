import express from "express";
import { isauthenticated,isAuthorized } from "../middlewares/auth.js";
import {
  postApplication,jobSeekerGetAllApplication,employerGetAllApplication,
  acceptedorRejected} from "../controllers/applicationController.js";

const router = express.Router();

router.post( "/post/:id",isauthenticated,isAuthorized("Job Seeker"),postApplication);




router.get( "/employer/getall",isauthenticated,isAuthorized("Employer"),employerGetAllApplication);

router.get(
  "/jobseeker/getall",
  isauthenticated,
  isAuthorized("Job Seeker"),
  jobSeekerGetAllApplication
);

router.post("/review/:status/:jobid/:touserid",isauthenticated,isAuthorized("Employer"),acceptedorRejected);


export default router;