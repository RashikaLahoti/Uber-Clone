import express from 'express';
import { login, signup } from './auth.controllers.js';
import { validate } from '../../common/middlewares/auth.validate.js';
import { loginSchema, signUpSchema } from './auth.validation.js';

const router = express.Router();

router.post('/signup',validate(signUpSchema), signup)
router.post('/login',validate(loginSchema), login)


export default router;