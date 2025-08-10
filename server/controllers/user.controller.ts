import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import { errorHandler } from "../utils/customError";
import { editUserSchema, passwordSchema, userSchema } from "../utils/validator";
import bcrypt from "bcryptjs";
import Role from "../models/roles.model";
import successMail from "../utils/successMail";

// Get User Profile with Roles
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById((req as any).user.id).populate(
      "roles",
      "roleName"
    );
    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles.map((role) => (role as any).roleName), // Extract only role names
    };

    res.json({
      success: true,
      message: "profile fetched successfully",
      data: userData,
    });
  } catch (error) {
    console.log("error at get profile:", error);
    next(errorHandler(500, "server error get profile failed"));
  }
};

//add new user
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, roles, phone, password } = req.body;

    const { error } = userSchema.validate(
      { name, email, roles, phone, password },
      { abortEarly: false }
    );

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    // Check if all role IDs exist in the Role collection
    const validRoles = await Role.find({ _id: { $in: roles } }).select("_id");
    const validRoleIds = validRoles.map((role: any) => role._id.toString());

    const invalidRoles = roles.filter(
      (roleId: any) => !validRoleIds.includes(roleId)
    );

    if (invalidRoles.length > 0) {
      next(errorHandler(400, "Invalid roles"));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles,
      phone,
    });

    const newUser = await User.findById(user._id)
      .populate("roles", "roleName")
      .select("-password");

    res
      .status(201)
      .json({ success: true, message: "User created successfully", newUser });
  } catch (error: any) {
    console.log("userUpdate error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "email") {
        next(errorHandler(400, "Email already exists."));
        return;
      } else if (duplicateField === "phone") {
        next(errorHandler(400, "Phone number already exists."));
        return;
      }
    }
    next(errorHandler(500, "server error user update failed"));
  }
};

//edit a user
export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, roles, phone } = req.body;
    const { id } = req.params;

    if (!id) {
      return next(errorHandler(400, "User ID is required"));
    }

    const { error } = editUserSchema.validate(
      { name, email, roles, phone },
      { abortEarly: false }
    );

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        roles: roles.map((role: string) => new mongoose.Types.ObjectId(role)), // Ensure ObjectIds
        phone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(500, "User update failed"));
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.log("userUpdate error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "email") {
        next(errorHandler(400, "Email already exists."));
        return;
      } else if (duplicateField === "phone") {
        next(errorHandler(400, "Phone number already exists."));
        return;
      }
    }
    next(errorHandler(500, "server error user update failed"));
  }
};

//get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;
    const skip = (page - 1) * limit;

    // Fetch users where isAdmin is false
    const users = await User.find({ isAdmin: false })
      .populate("roles", "roleName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const filteredUsers = users.map(({ _id, name, email, phone, roles }) => ({
      _id,
      name,
      email,
      phone,
      roles,
    }));

    const allRoles = await Role.find({}, { roleName: 1 });

    const totalUsers = await User.countDocuments({ isAdmin: false });

    res.json({
      success: true,
      users: filteredUsers,
      allRoles,
      totalUsers,
    });
  } catch (error) {
    console.log("error at fetching users:", error);
    next(errorHandler(500, "server error fetching users failed"));
  }
};

//reset user password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { error } = passwordSchema.validate(
      { oldPassword, newPassword },
      { abortEarly: false }
    );

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    const user = await User.findById((req as any).user.id);
    if (!user) {
      next(errorHandler(404, "User not found"));
      return;
    }
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      next(errorHandler(400, "Icorrect Password"));
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();
    await successMail(user.email);
    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("error at reset password:", error);
    next(errorHandler(500, "server error at reset password"));
  }
};

//delete a user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(errorHandler(400, "user not found"));
    }
    // Delete the User
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("user delete error:", error);
    next(errorHandler(500, "server error user delete failed"));
  }
};
