import * as Yup from "yup";
import { validatePhoneNumber } from "../helpers/validatePhoneNumber";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

export const userSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .min(3, "Must be at least 3 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  roles: Yup.array().min(1, "At least one role must be selected"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

export const roleSchema = Yup.object().shape({
  name: Yup.string().trim().required("Role name is required"),
  permissions: Yup.array()
    .min(1, "At least one permission must be selected")
    .required(),
});

export const passwordSchema = Yup.object({
  oldPassword: Yup.string()
    .required("old password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
  newPassword: Yup.string()
    .required("new password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

export const editUserSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .min(3, "Must be at least 3 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  roles: Yup.array()
    .min(1, "At least one role must be selected")
    .of(
      Yup.object().shape({
        roleName: Yup.string().required(),
      })
    ),
});

export const newPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("old password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Password must match."),
});

//booking schema
export const bookingSchema = Yup.object({
  grcNumber: Yup.string().required("GRC number is required"),
  roomNumber: Yup.string().required("Room number is required"),
  checkInDate: Yup.date().required("Check-in date is required"),
  checkOutDate: Yup.date()
    .required("Check-out date is required")
    .min(Yup.ref("checkInDate"), "Check-out date must be after check-in date"),
  coStayers: Yup.array().of(
    Yup.object({
      name: Yup.string()
        .required("Name is required")
        .matches(/^[^\s.]/, "Name cannot start with a space or dot")
        .matches(
          /^[A-Za-z .]+$/,
          "Name can only contain letters, spaces, and dots"
        )
        .matches(/^[^0-9]+$/, "Name cannot contain numbers"),
      dob: Yup.date().required("Date of birth is required"),
      relation: Yup.string().required("Relation is required"),
    })
  ),
  documents: Yup.array()
    .min(1, "At least one document is required")
    .required("document is required"),
});

//phone schema

export const phoneSchema = Yup.object({
  phoneNumber: Yup.string()
    .test("valid-phone", "Invalid phone number", (value) =>
      validatePhoneNumber(value!)
    )
    .required("Phone number is required"),
});

//guest schema

export const guestSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\s.]/, "Name cannot start with a space or dot")
    .matches(/^[A-Za-z .]+$/, "Name can only contain letters, spaces, and dots")
    .matches(/^[^0-9]+$/, "Name cannot contain numbers"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  dob: Yup.date()
    .required("Date of Birth is required")
    .max(new Date(), "Date cannot be in the future"),
  address: Yup.string().required("Address is required"),
  documents: Yup.array()
    .min(1, "At least one document is required")
    .required("document is required"),
});

export const editGuestSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\s.]/, "Name cannot start with a space or dot")
    .matches(/^[A-Za-z .]+$/, "Name can only contain letters, spaces, and dots")
    .matches(/^[^0-9]+$/, "Name cannot contain numbers"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .test("valid-phone", "Invalid phone number", (value) =>
      validatePhoneNumber(value!)
    )
    .required("Phone number is required"),
  address: Yup.string().required("Guest Address is required"),
  dob: Yup.date().required("Date of Birth is required"),
  documents: Yup.array()
    .min(1, "At least one document is required")
    .required("document is required"),
});

// additional cost schema

export const additionalCostSchema = Yup.object({
  item: Yup.string().trim().required("Item name is required"),
  cost: Yup.number()
    .typeError("Cost must be a number")
    .positive("Cost must be positive")
    .required("Cost is required"),
});

// vendor schema

export const vendorSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\s.]/, "Name cannot start with a space or dot")
    .matches(/^[A-Za-z .]+$/, "Name can only contain letters, spaces, and dots")
    .matches(/^[^0-9]+$/, "Name cannot contain numbers"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  address: Yup.string().required("Address is required"),
  contactPerson: Yup.string().required("Contacted Person name is required"),
  gstin: Yup.string()
    .required("GSTIN number is required")
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format"
    ),
});

// purchase schema
export const purchaseSchema = Yup.object({
  item: Yup.string().required("Item is required"),
  quantity: Yup.string().required("Quantity is required"),
  invoiceNumber: Yup.string().required("Invoice Number is required"),
  warrantyPeriod: Yup.string().required("Warranty Period is required"),
  value: Yup.string().required("Quantity is required"),
  purchaseDate: Yup.date().required("Purchase date is required"),
  documents: Yup.array()
    .min(1, "At least one document is required")
    .required("document is required"),
});

// prospective guest schema

export const prospectiveGuestSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\s.]/, "Name cannot start with a space or dot")
    .matches(/^[A-Za-z .]+$/, "Name can only contain letters, spaces, and dots")
    .matches(/^[^0-9]+$/, "Name cannot contain numbers"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  company: Yup.string().required("Company is required"),
  description: Yup.string().required("Description is required"),
});

// meeting schema

export const meetingSchema = Yup.object().shape({
  date: Yup.string().required("Date is required"),
  remarks: Yup.string().required("Remarks are required"),
  attendies: Yup.array()
    .of(
      Yup.string()
        .trim()
        .matches(/^(?!\s*$).+/, "Attendee name cannot be empty")
        .required("Attendee name is required")
    )
    .min(1, "At least one attendee is required"),
});
