import { NextFunction, Request, Response } from "express";
import Role from "../models/roles.model";
import { errorHandler } from "../utils/customError";
import User from "../models/user.model";

// Create Role (Admin Only)
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleName, permissions } = req.body;
    const casedRoleName = roleName.toUpperCase();
    const existingRole = await Role.findOne({ roleName: casedRoleName });
    if (existingRole) {
      next(errorHandler(400, "Role already exists"));
      return;
    }

    const role = new Role({ roleName, permissions });
    await role.save();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      newRole: role,
    });
  } catch (error) {
    console.log("error at creating roles:", error);
    next(errorHandler(500, "server error, creating roles failed"));
  }
};

// Get All Roles
export const getRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    console.log("error at getting roles:", error);
    next(errorHandler(500, "server error, get roles failed"));
  }
};

//Assign permissions to roles
export const assignRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { permissions } = req.body;

    const { id } = req.params;

    const role = await Role.findById(id);

    if (!role) {
      next(errorHandler(404, "Role not found"));
      return;
    }

    role.permissions = permissions;

    await role.save();

    res
      .status(200)
      .json({ success: true, message: "permission assigned successfully" });
  } catch (error) {
    console.log('error:',error)
    next(errorHandler(500, "server error at assign user role"));
  }
};

// Delete Role (Admin Only)
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if the role exists
    const role = await Role.findById(id);
    if (!role) {
      next(errorHandler(404, "Role not found"));
      return;
    }

    // Remove the role from all users who had it
    await User.updateMany(
      { roles: id },
      { $pull: { roles: id } } // Removes the role from users' roles array
    );

    // Delete the role
    await Role.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.log("error at role deletion:", error);
    next(errorHandler(500, "delete error ,role deletion failed"));
  }
};
