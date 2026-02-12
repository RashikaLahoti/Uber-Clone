import express from "express";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { getWelcome } from "./profile.controller.js";

const router = express.Router();

router.get('/:userId/welcome', authenticate, getWelcome);

export default router;