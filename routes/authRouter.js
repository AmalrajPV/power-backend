import express, { response } from "express";
import { loginUser, registerUser, verifyUser } from "../controller/authControllers.js";

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/verify/:token', verifyUser);


export default router;