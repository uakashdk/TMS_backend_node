import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/system-identites-domain-routes/authRoutes.js';
import companiesRoutes from "./routes/system-identites-domain-routes/companiesRoutes.js";
import DocumentRoutes from "./routes/system-identites-domain-routes/documentRoutes.js";
import AdminRoutes from "./routes/system-identites-domain-routes/AdminControllerRoutes.js";
import DriverRoutes from "./routes/operational-domain-routes/driver-module/DrivverRoutes.js";
import VehicleRoutes from "./routes/operational-domain-routes/vehicleModule/VehicleRoutes.js";
import PartyRoutes from "./routes/operational-domain-routes/party-module/partyControllerRoutes.js"
import cookieParser from 'cookie-parser';
import VehicleMappingDriverRoutes from "./routes/operational-domain-routes/vehicleModule/VehicleMappingDriverRoutes.js";
import cors from "cors"
dotenv.config();

import { connectDB, sequelize } from './Config/Db.js';

import path from "path";
import { fileURLToPath } from "url";

// Required for ES Modules


// ✅ Serve uploads folder

// ✅ Import models & associations
import './modals/association.js'; // associations registers relationships

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    credentials: true,               // ALLOW cookies
  })
);


app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/fleetlio/auth', authRoutes);
app.use('/api/v1/fleetlio/companies',companiesRoutes);
app.use('/api/v1/fleetlio/document',DocumentRoutes);
app.use('/api/v1/fleetlio/Admins',AdminRoutes);
app.use('/api/v1/fleetlio/driver',DriverRoutes);
app.use('/api/v1/fleetlio/vehicle',VehicleRoutes);
app.use("/api/v1/fleetlio/Vehiclemap",VehicleMappingDriverRoutes);
app.use("/api/v1/fleetlio/parties",PartyRoutes)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected');

    // Sync all models
    //  await sequelize.sync({ force: true, logging});
    console.log('✅ All tables created successfully');

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server failed to start:', err);
  }
};

startServer();
