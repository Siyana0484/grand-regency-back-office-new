import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sendOtpApi } from "../apis/authApi";
import { Success } from "../helpers/popup";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState<number>(() => {
    const savedTime = localStorage.getItem("otpExpiryTime");
    return savedTime
      ? Math.max(0, Math.floor((Number(savedTime) - Date.now()) / 1000))
      : 0;
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            localStorage.removeItem("otpExpiryTime");
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const sendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError("");

    // Set the expiry time and start the timer before the API call
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    localStorage.setItem("otpExpiryTime", expiryTime.toString());
    setTimer(5 * 60); // Start the timer immediately

    const resp = await sendOtpApi(email);
    if (resp.success) {
      Success(resp.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 login-parent">
      <div className="absolute top-0 left-0 p-4">
        <img
          src="/images/logo.png"
          alt="Grand Regency Logo"
          className="w-32 xl:w-40 h-auto"
        />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Forgot Password
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-900">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 outline-none
                transition-all duration-200"
                placeholder="Enter your email"
                disabled={timer > 0}
              />
              {error && (
                <div className="text-sm text-red-500 mt-1">{error}</div>
              )}

              <button
                type="button"
                onClick={sendOTP}
                className={`w-full px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold cursor-pointer
                text-white rounded-lg transition-colors duration-200 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 ${
                  timer > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
                disabled={timer > 0}
              >
                {timer > 0
                  ? `Resend Link in ${Math.floor(timer / 60)}:${String(
                      timer % 60
                    ).padStart(2, "0")}`
                  : "Email Me a Reset Link"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-rose-500 hover:text-rose-600 
                transition-colors duration-200 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
