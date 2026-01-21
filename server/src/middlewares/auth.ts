import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { has as tokenIsBlacklisted } from "../utils/tokenBlacklist";
import sendError from "../utils/errorResponse";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthedRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.header("authorization") || req.header("Authorization");
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (tokenIsBlacklisted(token))
        return sendError(
          res,
          401,
          "token_revoked",
          "Token revoked — please sign in again.",
        );
      if (!decoded || !decoded.id)
        return sendError(
          res,
          401,
          "invalid_token",
          "Invalid authentication token.",
        );
      const user = await User.findById(decoded.id).exec();
      if (!user)
        return sendError(
          res,
          401,
          "invalid_user",
          "User not found for provided token.",
        );
      req.user = user;
      return next();
    }

    // Fallback: support x-user-id header for convenience (dev/testing)
    const userId = req.header("x-user-id");
    if (userId) {
      const user = await User.findById(userId).exec();
      if (!user)
        return sendError(
          res,
          401,
          "invalid_user",
          "User not found for provided x-user-id header.",
        );
      req.user = user;
      return next();
    }

    return sendError(
      res,
      401,
      "missing_auth",
      "Authorization required (Bearer token or x-user-id header).",
    );
  } catch (err) {
    return sendError(
      res,
      401,
      "auth_failed",
      "Authentication failed — invalid or expired token.",
    );
  }
};

export const requireAdmin = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "missing_user" });
  if (user.isAdmin) return next();
  return res.status(403).json({ error: "admin_required" });
};

export const requireConfirmedContributor = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "missing_user" });
  // user must have at least one confirmed contribution
  const hasConfirmed = await (
    await import("../models/Contribution")
  ).default.exists({ contributor: user._id, confirmed: true });
  if (hasConfirmed) return next();
  return res.status(403).json({ error: "confirmed_contribution_required" });
};

export default authenticateJWT;
