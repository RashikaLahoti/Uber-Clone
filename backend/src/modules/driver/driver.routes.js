import express from 'express';
import { createDriverProfileSchema } from './driver.validation';

let router = express.Router();

router.post("/register", authenticate, validate(createDriverProfileSchema),     )

export default router;