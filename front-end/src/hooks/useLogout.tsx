import axios from "../apis/axios";
import { useBookingStore } from "../stores/bookingStore";
import { usePermissionStore } from "../stores/permissionStore";
import { useProspectiveGuestStore } from "../stores/prospectiveGuestStore";
import { usePurchaseStore } from "../stores/purchaseStore";
import { useAuth } from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});
    usePermissionStore.persist.clearStorage();
    usePurchaseStore.persist.clearStorage();
    useProspectiveGuestStore.persist.clearStorage();
    useBookingStore.persist.clearStorage();
    try {
      await axios("/v1/auth", {
        withCredentials: true,
      });
    } catch (error) {
      console.log("logout error:", error);
    }
  };
  return logout;
};

export default useLogout;
