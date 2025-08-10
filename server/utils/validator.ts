import * as Joi from "joi";
import parsePhoneNumberFromString from "libphonenumber-js";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Ensures it's a valid email
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase") // At least one uppercase letter
    .pattern(/[a-z]/, "lowercase") // At least one lowercase letter
    .pattern(/[0-9]/, "number") // At least one number
    .pattern(/[@$!%*?&]/, "special") // At least one special character
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.name":
        "Password must contain at least one {#name} character",
      "any.required": "Password is required",
    }),
});

export const passwordSchema = Joi.object({
  oldPassword: Joi.string().min(8),
  newPassword: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase") // At least one uppercase letter
    .pattern(/[a-z]/, "lowercase") // At least one lowercase letter
    .pattern(/[0-9]/, "number") // At least one number
    .pattern(/[@$!%*?&]/, "special") // At least one special character
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.name":
        "Password must contain at least one {#name} character",
      "any.required": "Password is required",
    }),
});

export const userSchema = Joi.object({
  name: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .message("Username can only contain letters, numbers, and underscores")
    .min(3)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Must be at least 3 characters",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),

  roles: Joi.array().min(1).required().messages({
    "array.min": "At least one role must be selected",
  }),

  password: Joi.string()
    .min(8)
    .required()
    .pattern(/[A-Z]/, "upper")
    .pattern(/[a-z]/, "lower")
    .pattern(/[0-9]/, "number")
    .pattern(/[@$!%*?&]/, "special")
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.name": "Password must contain at least one {#name}",
    }),
});

export const editUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .message("Username can only contain letters, numbers, and underscores")
    .min(3)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Must be at least 3 characters",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),

  roles: Joi.array().min(1).required().messages({
    "array.min": "At least one role must be selected",
  }),
});

export const newPasswordSchema = Joi.object({
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/)
    .message("Password must contain at least one uppercase letter")
    .pattern(/[a-z]/)
    .message("Password must contain at least one lowercase letter")
    .pattern(/[0-9]/)
    .message("Password must contain at least one number")
    .pattern(/[@$!%*?&]/)
    .message(
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    )
    .messages({
      "string.empty": "Old password is required",
      "string.min": "Password must be at least 8 characters long",
    }),
});

export const emailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allows any top-level domain (TLD)
    .required()
    .messages({
      "string.email": "Enter a valid email address",
      "string.empty": "Email is required",
    }),
});

export const numberSchema = Joi.object({
  phoneNumber: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Ensure the number starts with '+'
      if (!value.startsWith("+")) {
        value = `+${value}`;
      }
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber || !phoneNumber.isValid()) {
        return helpers.error("string.invalid");
      }
      return value; // Return the valid value
    }, "Phone Number Validation")
    .messages({
      "string.invalid": "Enter a valid phone number",
      "string.empty": "Phone number is required",
    }),
});

//edit guest shema
export const editGuestSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Guest Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),

  phone: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Ensure the number starts with '+'
      if (!value.startsWith("+")) {
        value = `+${value}`;
      }
      const phone = parsePhoneNumberFromString(value);
      if (!phone || !phone.isValid()) {
        return helpers.error("string.invalid");
      }
      return value; // Return the valid value
    }, "Phone Number Validation")
    .messages({
      "string.invalid": "Enter a valid phone number",
      "string.empty": "Phone number is required",
    }),

  address: Joi.string().required().messages({
    "string.empty": "Guest Address is required",
  }),

  dob: Joi.date().iso().required().messages({
    "date.base": "Date of Birth is required",
  }),
});

//guest schema

export const guestSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    }),

  phone: Joi.string().required().messages({
    "string.empty": "Phone is required",
  }),

  dob: Joi.date().iso().max("now").required().messages({
    "date.base": "Date of Birth is required",
    "date.max": "Date cannot be in the future",
  }),

  address: Joi.string().required().messages({
    "string.empty": "Address is required",
  }),

  documents: Joi.array().min(1).required().messages({
    "array.min": "At least one document is required",
    "any.required": "Document is required",
  }),
});

//booking schema

export const bookingSchema = Joi.object({
  checkInDate: Joi.date().iso().required().messages({
    "date.iso": "Check-in date must be in ISO format (YYYY-MM-DD)",
    "any.required": "Check-in date is required",
  }),

  checkOutDate: Joi.date().iso().required().messages({
    "date.iso": "Check-out date must be in ISO format (YYYY-MM-DD)",
    "any.required": "Check-out date is required",
  }),

  grcNumber: Joi.string().required().messages({
    "any.required": "GRC number is required",
  }),

  roomNumber: Joi.string().required().messages({
    "any.required": "Room number is required",
  }),

  coStayers: Joi.array().items(
    Joi.object({
      name: Joi.string().required().messages({
        "any.required": "Co-stayer name is required",
      }),
      relation: Joi.string().required().messages({
        "any.required": "Relation is required",
      }),
      dob: Joi.date().iso().required().messages({
        "date.iso": "Date of birth must be in ISO format (YYYY-MM-DD)",
        "any.required": "Date of birth is required",
      }),
    })
  ),

  documents: Joi.array().items(Joi.string()),

  additionalPurchase: Joi.array().items(
    Joi.object({
      item: Joi.string().required().messages({
        "any.required": "Purchase item is required",
      }),
      cost: Joi.string().required().messages({
        "any.required": "Cost is required",
      }),
    })
  ),

  damageCost: Joi.array().items(
    Joi.object({
      item: Joi.string().required().messages({
        "any.required": "Damage item is required",
      }),
      cost: Joi.string().required().messages({
        "any.required": "Cost is required",
      }),
    })
  ),
});

//vendor schema

export const vendorSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    }),

  phone: Joi.string().required().messages({
    "string.empty": "Phone is required",
  }),

  address: Joi.string().required().messages({
    "string.empty": "Address is required",
  }),
  contactPerson: Joi.string().required().messages({
    "string.empty": "Contact Person is required",
  }),
  gstin: Joi.string().required().messages({
    "string.empty": "GSTIN number is required",
  }),
});

// purchase schema

//booking schema

export const purchaseSchema = Joi.object({
  purchaseDate: Joi.date().iso().required().messages({
    "date.iso": "Purchase Date must be in ISO format (YYYY-MM-DD)",
    "any.required": "Purchase date is required",
  }),

  item: Joi.string().required().messages({
    "any.required": "Purchase item is required",
  }),

  quantity: Joi.string().required().messages({
    "any.required": "Purchase quantity is required",
  }),
  invoiceNumber: Joi.string().required().messages({
    "any.required": "Invoice Number is required",
  }),
  warrantyPeriod: Joi.string().required().messages({
    "any.required": "Warranty period is required",
  }),
  value: Joi.string().required().messages({
    "any.required": "Purchase value is required",
  }),

  documents: Joi.array().items(Joi.string()),
});

// prospective guest schema

export const prospectiveGuestSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    }),
  phone: Joi.string().required().messages({
    "string.empty": "Phone is required",
  }),
  company: Joi.string().required().messages({
    "string.empty": "Company is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),
});

// meeting schema
export const meetingSchema = Joi.object({
  date: Joi.string().required().messages({
    "any.required": "Date is required",
    "string.empty": "Date is required",
  }),
  remarks: Joi.string().required().messages({
    "any.required": "Remarks are required",
    "string.empty": "Remarks are required",
  }),
  attendies: Joi.array()
    .items(
      Joi.string()
        .trim()
        .pattern(/^(?!\s*$).+/)
        .required()
        .messages({
          "any.required": "Attendee name is required",
          "string.empty": "Attendee name cannot be empty",
          "string.pattern.base": "Attendee name cannot be empty",
        })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one attendee is required",
      "any.required": "At least one attendee is required",
    }),
});
