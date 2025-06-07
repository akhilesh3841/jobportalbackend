import express from "express";
import { isauthenticated, isAuthorized } from "../middlewares/auth.js";
import { postJob,getAllJobs, getMyJobs, deleteJob} from "../controllers/jobController.js";

const router = express.Router();

router.post("/post", isauthenticated , isAuthorized("Employer"), postJob);

router.get("/getall", getAllJobs);
router.get("/getmyjobs", isauthenticated, isAuthorized("Employer"),getMyJobs);

router.delete("/delete/:id", isauthenticated, isAuthorized("Employer"), deleteJob);





export default router;