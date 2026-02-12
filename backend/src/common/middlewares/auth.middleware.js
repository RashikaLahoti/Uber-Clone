import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import {User} from "../../modules/model/user.model.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: User account is inactive",
      });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
