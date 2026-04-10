import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import applicationRoutes from './routes/applications';
import aiRoutes from './routes/ai';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    // Only listen in non-Vercel environments
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err.message);
  });

export default app;
