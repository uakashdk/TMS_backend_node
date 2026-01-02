import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
import { connectDB } from './Config/Db.js';

app.use(express.json());
// Connect to the database
connectDB();
// Define a simple route
app.get('/', (req, res) => {
  res.send('Transport Management System API is running');
}); 
// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
