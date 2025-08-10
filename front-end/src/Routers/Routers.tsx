import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Login from "../pages/login";
import Layout from "../components/Layout";
import Guest from "../pages/Guest";
import ProspectiveGuest from "../pages/ProspectiveGuest";
import Setting from "../pages/Setting";
import Vendors from "../pages/Vendors";
import Documents from "../pages/Documents";
import Booking from "../pages/Booking";
import RequireAuth from "../components/RequireAuth";
import Profile from "../pages/Profile";
import PersistLogin from "../components/PersistLogin";
import RedirectIfAuthenticated from "../components/RedirectIfAuthenticated";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import NewPassword from "../components/NewPassword";
import BookingDetails from "../components/Guest/BookingDetails";
import Purchase from "../pages/Purchase";
import CreatePurchase from "../components/vendor/CreatePurchase";
import VendorCreation from "../components/vendor/VendorCreation";
import PurchaseForm from "../components/vendor/PurchaseForm";
import PurchaseDetails from "../components/vendor/PurchaseDetails";
import ProspectiveGuestDetails from "../components/prospectiveGuest/ProspectiveGuestDetails";
import CreateBooking from "../components/Guest/CreateBooking";
import GuestCreation from "../components/Guest/GuestCreation";
import BookingForm from "../components/Guest/BookingForm";

const Routers = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PersistLogin />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<NewPassword />} />
        </Route>
        <Route
          element={
            <RequireAuth
              allowedPermission={[
                "user:read",
                "role:read",
                "booking:read",
                "booking:read:single",
                "guest:read",
                "vendor:read",
                "purchase:read",
                "prospective-guest:read",
                "guest:files:read",
                "booking:files:read",
                "purchase:files:read",
              ]}
            />
          }
        >
          <Route path="/" element={<Layout />}>
            {/* guest and booking start */}

            <Route element={<RequireAuth allowedPermission={["guest:read"]} />}>
              <Route path="guests" element={<Guest />} />
            </Route>

            <Route
              element={<RequireAuth allowedPermission={["booking:create"]} />}
            >
              <Route path="create-booking" element={<CreateBooking />} />
              <Route path="guest-creation" element={<GuestCreation />} />
              <Route path="booking-form" element={<BookingForm />} />
            </Route>

            <Route
              element={<RequireAuth allowedPermission={["booking:read"]} />}
            >
              <Route path="bookings" element={<Booking />} />
            </Route>

            <Route
              element={
                <RequireAuth allowedPermission={["booking:read:single"]} />
              }
            >
              <Route path="booking-details" element={<BookingDetails />} />
            </Route>

            {/* guest and booking end */}

            {/* prospective guest and meetings start */}

            <Route
              element={
                <RequireAuth allowedPermission={["prospective-guest:read"]} />
              }
            >
              <Route path="prospective-guests" element={<ProspectiveGuest />} />
              <Route
                path="prospective-guest-details"
                element={<ProspectiveGuestDetails />}
              />
            </Route>

            {/* prospective guest and meetings end */}

            {/* settings start */}

            <Route
              element={
                <RequireAuth allowedPermission={["user:read", "role:read"]} />
              }
            >
              <Route path="settings" element={<Setting />} />
            </Route>

            {/* settings end */}

            {/* vendors and purchase start */}

            <Route
              element={<RequireAuth allowedPermission={["vendor:read"]} />}
            >
              <Route path="vendors" element={<Vendors />} />
            </Route>

            <Route
              element={<RequireAuth allowedPermission={["purchase:read"]} />}
            >
              <Route path="purchases" element={<Purchase />} />
              <Route path="purchase-details" element={<PurchaseDetails />} />
            </Route>

            <Route
              element={<RequireAuth allowedPermission={["purchase:create"]} />}
            >
              <Route path="create-purchase" element={<CreatePurchase />} />
              <Route path="vendor-creation" element={<VendorCreation />} />
              <Route path="purchase-form" element={<PurchaseForm />} />
            </Route>

            {/* vendors and purchase end */}

            {/* document start */}

            <Route
              element={
                <RequireAuth
                  allowedPermission={[
                    "booking:files:read",
                    "purchase:files:read",
                    "guest:files:read",
                  ]}
                />
              }
            >
              <Route path="documents" element={<Documents />} />
            </Route>

            {/* document end */}

            <Route path="profile" element={<Profile />} />

            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default Routers;
