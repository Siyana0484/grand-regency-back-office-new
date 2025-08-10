import { JwtPayload } from "jwt-decode";
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  username?: string;
  success?: boolean;
  message?: string;
}

// Define the type for the authentication state
export interface AuthState {
  username?: string;
  accessToken?: string;
}

export interface CustomJwtPayload extends JwtPayload {
  permission?: string[];
  roles?: string[];
}

// Booking types
interface AdditionalCost {
  item: string;
  cost: string;
}

export interface CoStayer {
  name: string;
  relation: string;
  dob: string;
}
export interface Booking {
  _id: string;
  guest: {
    name: string;
    dob: string;
    email: string;
    phone: string;
    address: string;
  };
  name?: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  grcNumber: string;
  coStayers: CoStayer[];
  additionalPurchase: AdditionalCost[];
  damageCost: AdditionalCost[];
  documents: string[];
  prospectiveGuest?: { _id: string; name: string };
}

export interface CreateBooking {
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  grcNumber: string;
  coStayers: CoStayer[];
  documents: string[];
}

export interface BookingFormValues {
  phone?: string;
  guestName?: string;
  grcNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  coStayers: CoStayer[];
  documents: File[];
}

//guest types
export interface GuestType {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  documents?: string[];
}

export interface GuestListType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  documents?: string[];
  prospectiveGuest?: boolean;
}

export interface GuestCreationType {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  documents: File[];
}

//user types

export interface UserType {
  name: string;
  phone: string;
  email: string;
  password: string;
  roles: string[];
}
export interface UpdateUserType {
  name: string;
  phone: string;
  email: string;
  roles: string[];
}

export interface UserListType {
  _id: string;
  name: string;
  phone: string;
  email: string;
  roles: { _id: string; roleName: string }[];
}

// purchases type

export interface Purchase {
  _id: string;
  vendor: {
    name: string;
    gstin: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  item: string;
  quantity: string;
  invoiceNumber: string;
  warrantyPeriod: string;
  value: string;
  gstin: string;
  purchaseDate: Date;
  documents: string[];
}

export interface CreatePurchase {
  item: string;
  quantity: string;
  invoiceNumber: string;
  warrantyPeriod: string;
  value: string;
  purchaseDate: string;
  documents: string[];
}

export interface PurchaseFormValues {
  phone?: string;
  vendorName?: string;
  item: string;
  quantity: string;
  invoiceNumber: string;
  warrantyPeriod: string;
  value: string;
  purchaseDate: string;
  documents: File[];
}

// vendor types

export interface VendorType {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  gstin: string;
}

export interface ProspectiveGuest {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  description: string;
}

//meetings
export interface Meeting {
  _id?: string;
  date: string;
  remarks: string;
  attendies: string[];
}
