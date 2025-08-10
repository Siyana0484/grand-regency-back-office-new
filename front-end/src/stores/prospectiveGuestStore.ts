import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProspectiveGuest } from "../types";

// Define the Zustand store
interface ProspectiveGuestStore {
  prospectiveGuests: ProspectiveGuest[];
  selectedProspectiveGuest: ProspectiveGuest | null;
  setProspectiveGuests: (prospectiveGuests: ProspectiveGuest[]) => void;
  setSelectedProspectiveGuest: (
    prospectiveGuest: ProspectiveGuest | null
  ) => void;
  updateSelectedProspectiveGuest: (
    updateProspectiveGuest: ProspectiveGuest
  ) => void;
}

export const useProspectiveGuestStore = create<ProspectiveGuestStore>()(
  persist(
    (set) => ({
      prospectiveGuests: [],
      selectedProspectiveGuest: null,

      setProspectiveGuests: (prospectiveGuests) => set({ prospectiveGuests }),
      setSelectedProspectiveGuest: (prospectiveGuest) =>
        set({ selectedProspectiveGuest: prospectiveGuest }),

      updateSelectedProspectiveGuest: (updateProspectiveGuest) =>
        set((state) => ({
          selectedProspectiveGuest:
            state.selectedProspectiveGuest &&
            state.selectedProspectiveGuest._id === updateProspectiveGuest._id
              ? updateProspectiveGuest
              : state.selectedProspectiveGuest,
        })),
    }),
    {
      name: "prospective-guest-storage", // LocalStorage key (optional)
    }
  )
);
