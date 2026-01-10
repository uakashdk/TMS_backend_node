import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/system-identites-domain-routes/authRoutes.js';
import companiesRoutes from "./routes/system-identites-domain-routes/companiesRoutes.js"
import cookieParser from 'cookie-parser';
import cors from "cors"
dotenv.config();

import { connectDB, sequelize } from './Config/Db.js';

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fleetlio/companies',companiesRoutes);

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
