import express, { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/dbConnection";
import authRoute from "./routes/auth.route";
import refreshRoute from "./routes/refresh.route";
import roleRoute from "./routes/role.route";
import userRoute from "./routes/user.route";
import bookingRoute from "./routes/booking.route";
import guestRoute from "./routes/guest.route";
import vendorRoute from "./routes/vendor.route";
import purchaseRoute from "./routes/purchase.route";
import prospectiveGuestRoute from "./routes/prospectiveGuest.route";
import meetingRoute from "./routes/meeting.route";
import documentRoute from "./routes/document.route";
import cookieParser from "cookie-parser";
import path from "path";

config({ path: path.resolve(__dirname, "../.env") });
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT) || 100,
});
const app = express();
app.use("/api/", apiLimiter);
app.use(morgan("dev"));
app.use(helmet());
const url = process.env.VITE_BACKEND_URL?.slice(0, -4);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", url ?? "", process.env.AWS ?? ""],
      imgSrc: ["'self'", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
    },
  })
);
const outDir = path.join(__dirname, "./../public/uploads");
app.use("/uploads", express.static(outDir));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/refresh", refreshRoute);
app.use("/api/v1/role", roleRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/guest", guestRoute);
app.use("/api/v1/vendor", vendorRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/prospective-guest", prospectiveGuestRoute);
app.use("/api/v1/meeting", meetingRoute);
app.use("/api/v1/booking", bookingRoute);
app.use("/api/v1/document", documentRoute);

const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "front-end", "dist")));
app.use("*", (req, res) => {
  res.sendFile(path.join(_dirname, "front-end", "dist", "index.html"));
});

// Catch-all route for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

// Error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const port = process.env.PORT || 5000;
app.listen(port, (err?: Error) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});
