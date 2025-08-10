import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PermissionStore {
  permissions: string[];
  user: { name: string; roles: string[] };
  setPermissions: (permissions: string[]) => void;
  setRoles: (user: { name: string; roles: string[] }) => void;
  hasPermission: (permission: string) => boolean;
}

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      permissions: [],
      user: { name: "", roles: [] },

      setPermissions: (permissions) => set({ permissions }),
      setRoles: (user) => set({ user }),

      hasPermission: (permission) => get().permissions.includes(permission),
    }),
    {
      name: "permission-store", // Key for localStorage
    }
  )
);
