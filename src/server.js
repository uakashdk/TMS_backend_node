import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB, sequelize } from './Config/Db.js';
import './modals/association.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = async () => {
  await connectDB();

  await sequelize.sync({ alter: true });
  console.log('✅ Tables created successfully');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
