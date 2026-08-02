import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    network: process.env.SUI_NETWORK || 'testnet',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Mount claim and admin routes (Task 6-7)

app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Insurix backend running on port ${PORT}`);
});

export default app;
