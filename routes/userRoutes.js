import express from "express";
import { changePassword, editUsername, getProfile } from "../controller/userControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/edit-username',verifyToken, editUsername);
router.post('/change-password',verifyToken, changePassword);
router.get('/my-profile',verifyToken, getProfile);


export default router;