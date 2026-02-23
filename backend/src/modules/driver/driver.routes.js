import express from "express";
import { createDriverProfileSchema } from "./driver.validation.js";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/auth.validate.js";
import { createProfile } from "./driver.controller.js";

let router = express.Router();

router.post(
  "/register",
  authenticate,
  validate(createDriverProfileSchema),
  createProfile,
);

export default router;
