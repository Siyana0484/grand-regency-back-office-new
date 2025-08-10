import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/customError";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import {
  emailSchema,
  loginSchema,
  newPasswordSchema,
} from "../utils/validator";
import Token from "../models/token.model";
import sendMail from "../utils/sendMail";

//log in
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // Validate the request body
    const { error } = loginSchema.validate(
      { email, password },
      { abortEarly: false }
    );

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    const user = await User.findOne({ email }).populate<{
      roles: { roleName: string; permissions: string[] }[];
    }>("roles", "roleName permissions");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      next(errorHandler(400, "Invalid credentials"));
      return;
    }

    const allRoles = {
      roles: [...new Set(user?.roles.map((role) => role?.roleName))], // Unique role names
      permissions: [
        ...new Set(user?.roles.flatMap((role) => role?.permissions)), // Unique permissions
      ],
    };

    const accessToken = jwt.sign(
      { id: user._id, roles: allRoles.roles, permission: allRoles.permissions },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id, roles: allRoles.roles, permission: allRoles.permissions },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "2d",
      }
    );

    // Save refresh token to the database
    await Token.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // secure: process.env.NODE_ENV === "production", // Secure in production
      // sameSite: "none",
    });

    res.json({
      success: true,
      message: "Login successful",
      username: user.name,
      accessToken,
    });
  } catch (error) {
    console.log("signup error:");
    next(errorHandler(500, "server error Login failed"));
  }
};

// logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.token;

    if (!refreshToken) {
      res.sendStatus(204);
      return;
    }
    await Token.deleteOne({ token: refreshToken });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "none",
    });
    res.sendStatus(204);
  } catch (error) {
    console.log("error at delete refresh token from db:", error);
    next(errorHandler(500, "server error, deleting RefreshToken failed"));
  }
};

//send reset mail
export const sendResetMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const { error } = emailSchema.validate({ email }, { abortEarly: false });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      next(errorHandler(404, "user not exist"));
      return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_TOKEN_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    await sendMail(email, token);

    res.status(200).json({
      success: true,
      message: "password reset link is send to email.",
    });
  } catch (error) {
    console.error("Error:", error);
    next(errorHandler(500, "Error in sendin reset link."));
  }
};

//new password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    const { error } = newPasswordSchema.validate({ password });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    const decoded: any = jwt.verify(
      token,
      process.env.RESET_PASSWORD_TOKEN_SECRET!
    );
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.save();
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      next(errorHandler(401, "Token has expired. Please request a new one."));
      return;
    } else if (error.name === "JsonWebTokenError") {
      next(errorHandler(401, "Invalid token. Please try again."));
      return;
    } else {
      next(
        errorHandler(
          500,
          "Error in changing password. Please request a new one."
        )
      );
      return;
    }
  }
};
