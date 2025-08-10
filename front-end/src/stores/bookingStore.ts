import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Booking } from "../types";

// Define the Zustand store
interface BookingStore {
  bookings: Booking[];
  selectedBooking: Booking | null;
  setBookings: (bookings: Booking[]) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  updateSelectedBooking: (updatedBooking: Booking) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      bookings: [],
      selectedBooking: null,

      setBookings: (bookings) => set({ bookings }),

      setSelectedBooking: (booking) => set({ selectedBooking: booking }),

      updateSelectedBooking: (updatedBooking) =>
        set((state) => ({
          selectedBooking:
            state.selectedBooking &&
            state.selectedBooking._id === updatedBooking._id
              ? updatedBooking
              : state.selectedBooking,
        })),
    }),
    {
      name: "booking-storage",
    }
  )
);
