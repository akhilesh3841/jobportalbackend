import express from 'express';
import { login, logout, register,getuser, updateProfile, forgetpassword, resetPassword } from '../controllers/userController.js';
import { isauthenticated } from '../middlewares/auth.js';

const router=express.Router();

router.post('/register',register);

router.post('/login',login);

router.post("/forgotpass",forgetpassword);
router.post("/resetpassword/:token",resetPassword);

router.get('/logout',isauthenticated,logout);
router.get('/getuser',isauthenticated,getuser);
router.put('/update/profile',isauthenticated,updateProfile);

export default router;

