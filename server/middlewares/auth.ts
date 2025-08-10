import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { errorHandler } from "../utils/customError";

// Verify JWT

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access Denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    (req as any).user = decoded;

    next();
  } catch (err) {
    console.log("err at authentication:", err);
    next(errorHandler(403, "Invalid token"));
  }
};

// Role-based Authorization
export const authorize = (requiredPermission: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).populate("roles");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isAdmin) {
      next(); // Admins have full access
      return;
    }

    const userPermissions = new Set<string>();
    user.roles.forEach((role: any) => {
      role.permissions.forEach((perm: string) => userPermissions.add(perm));
    });

    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some((perm) => userPermissions.has(perm))
      : userPermissions.has(requiredPermission);

    if (!hasPermission) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  };
};
