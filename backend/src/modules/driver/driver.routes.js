import express from "express";
import { createDriverProfileSchema, updateDriverProfileSchema, updateStatusSchema } from "./driver.validation.js";
import { authenticate, authorizeRole } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/auth.validate.js";
import { createProfile, getProfile, getProfileCompletion, updateProfile, updateStatus } from "./driver.controller.js";

let router = express.Router();

router.post(
  "/register",
  authenticate,
  validate(createDriverProfileSchema),
  createProfile,
);

router.get(
    '/me/completion',
    authenticate,                // Middleware 1: Verify JWT token
    authorizeRole('DRIVER'),     // Middleware 2: Only DRIVER role allowed
    getProfileCompletion         // Controller function
);


router.patch(
    '/me/status',
    authenticate,                    // Middleware 1: Verify JWT token
    authorizeRole('DRIVER'),         // Middleware 2: Only DRIVER role allowed
    validate(updateStatusSchema),    // Middleware 3: Validate request body
    updateStatus                     // Controller function
);


router.patch(
    '/me',
    authenticate,                           // Middleware 1: Verify JWT token
    authorizeRole('DRIVER'),                // Middleware 2: Only DRIVER role allowed
    validate(updateDriverProfileSchema),    // Middleware 3: Validate request body
    updateProfile                          // Controller function
);


router.get(
    '/me',
    authenticate,                // Middleware 1: Verify JWT token
    authorizeRole('DRIVER'),     // Middleware 2: Only DRIVER role allowed
    getProfile                   // Controller function
);

export default router;
