import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Purchase } from "../types";

// Define the Zustand store
interface PurchaseStore {
  purchases: Purchase[];
  selectedPurchase: Purchase | null;
  setPurchases: (purchases: Purchase[]) => void;
  setSelectedPurchase: (purchase: Purchase | null) => void;
  updateSelectedPurchase: (updatePurchase: Purchase) => void;
}

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set) => ({
      purchases: [],
      selectedPurchase: null,

      setPurchases: (purchases) => set({ purchases }),
      setSelectedPurchase: (purchase) => set({ selectedPurchase: purchase }),

      updateSelectedPurchase: (updatePurchase) =>
        set((state) => ({
          selectedPurchase:
            state.selectedPurchase &&
            state.selectedPurchase._id === updatePurchase._id
              ? updatePurchase
              : state.selectedPurchase,
        })),
    }),
    {
      name: "purchase-storage", // LocalStorage key (optional)
    }
  )
);
