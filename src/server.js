import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

// ✅ DB
import { connectDB } from "./Config/Db.js";

// ✅ Routes
import authRoutes from "./routes/system-identites-domain-routes/authRoutes.js";
import companiesRoutes from "./routes/system-identites-domain-routes/companiesRoutes.js";
import DocumentRoutes from "./routes/system-identites-domain-routes/documentRoutes.js";
import AdminRoutes from "./routes/system-identites-domain-routes/AdminControllerRoutes.js";
import DriverRoutes from "./routes/operational-domain-routes/driver-module/DrivverRoutes.js";
import VehicleRoutes from "./routes/operational-domain-routes/vehicleModule/VehicleRoutes.js";
import VehicleMappingDriverRoutes from "./routes/operational-domain-routes/vehicleModule/VehicleMappingDriverRoutes.js";
import PartyRoutes from "./routes/operational-domain-routes/party-module/partyControllerRoutes.js";
import RouteRoutes from "./routes/operational-domain-routes/route-module/RouteMasterRoutes.js";
import JobRoutes from "./routes/operational-domain-routes/job-module/jobControllerRoutes.js";
import TripRoutes from "./routes/operational-domain-routes/trip-module/tripControllerRoutes.js";
import PartyAdvanceRoutes from "./routes/operational-domain-routes/Party-Advance/partyAdvanceRoutes.js";
import RateContractRoutes from "./routes/finance-domain-routes/rate-contract-module/RateContractRoutes.js";
import PaymentSnapsRoutes from "./routes/finance-domain-routes/payment-snaps-module/PaymentSnapRoutes.js";
import RolesPermissionRoutes from "./routes/system-identites-domain-routes/RoleControllerRoutes.js";

// ✅ Associations (IMPORTANT)
import "./modals/association.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ✅ Routes
app.use("/api/v1/fleetlio/auth", authRoutes);
app.use("/api/v1/fleetlio/companies", companiesRoutes);
app.use("/api/v1/fleetlio/document", DocumentRoutes);
app.use("/api/v1/fleetlio/admins", AdminRoutes);
app.use("/api/v1/fleetlio/driver", DriverRoutes);
app.use("/api/v1/fleetlio/vehicle", VehicleRoutes);
app.use("/api/v1/fleetlio/vehicle-map", VehicleMappingDriverRoutes);
app.use("/api/v1/fleetlio/parties", PartyRoutes);
app.use("/api/v1/fleetlio/routes", RouteRoutes);
app.use("/api/v1/fleetlio/jobs", JobRoutes);
app.use("/api/v1/fleetlio/trips", TripRoutes);
app.use("/api/v1/fleetlio/party-advance", PartyAdvanceRoutes);
app.use("/api/v1/fleetlio/rate-contract", RateContractRoutes);
app.use("/api/v1/fleetlio/payment-snaps", PaymentSnapsRoutes);
app.use("/api/v1/fleetlio/roles", RolesPermissionRoutes);

// ✅ Static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Start Server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");

    // ❌ NEVER USE THIS AGAIN
    // await sequelize.sync({ force: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
  }
};

startServer();