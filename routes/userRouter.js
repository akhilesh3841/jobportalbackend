import express from 'express';
import { login, logout, register,getuser, updateProfile } from '../controllers/userController.js';
import { isauthenticated } from "../middlewares/auth.js";

const router=express.Router();

router.post('/register',register);

router.post('/login',login);

router.get('/logout',isauthenticated,logout);
router.get('/getuser',isauthenticated,getuser);
router.patch('/update/profile',isauthenticated,updateProfile);
export default router;

