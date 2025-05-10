import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRoutes from './routes/deviceRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', deviceRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
}).catch(err => console.error('MongoDB connection error:', err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on PORT: ${process.env.PORT}`)
);