import parsePhoneNumberFromString from "libphonenumber-js";

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false; // Ensure phone is not empty
  const parsedPhone = parsePhoneNumberFromString("+" + phone); // Add "+"
  return parsedPhone ? parsedPhone.isValid() : false;
};
