import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../src/types/auth";
import { verifyJwt } from "../src/modules/auth";

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or invalid authorization",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  const payload = verifyJwt(token);

  if (!payload) {
    res.status(401).json({
      error: "Invalid or expired token",
      code: "UNAUTHORIZED",
    });
    return;
  }

  req.ownerId = payload.ownerId;
  next();
}