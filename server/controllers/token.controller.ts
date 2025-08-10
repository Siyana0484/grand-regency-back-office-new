import { NextFunction, Request, Response } from "express";

import { errorHandler } from "../utils/customError";
import Token from "../models/token.model";
import jwt from "jsonwebtoken";

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.token;
    if (!refreshToken) {
      next(errorHandler(401, "unauthorized"));
      return;
    }

    const foundToken = await Token.findOne({ token: refreshToken });
    if (!foundToken) {
      next(errorHandler(403, "forbidden"));
      return;
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    if (!decoded || foundToken.userId?.toString() !== decoded.id) {
      next(errorHandler(403, "forbidden"));
      return;
    }
    const accessToken = jwt.sign(
      {
        id: decoded.id,
        roles: decoded.roles,
        permission: decoded.permission,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    res.status(200).json({ accessToken });
  } catch (error) {
    console.log("error at RefereshToken:", error);
    next(errorHandler(500, "server error, handling RefreshToken failed"));
  }
};
