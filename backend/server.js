import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import analyzeRoute from "./routes/analyzeRoute.js";
import authRoute from "./routes/authRoute.js";
import reportRoute from "./routes/reportRoute.js";
import { initDB } from './models/db.js';

dotenv.config();

const app = express();

// Basic security
app.set('trust proxy', true);
app.use(helmet());
app.use(morgan('dev'));

// Rate limiter for API
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Initialize simple JSON DB
initDB().catch(err => console.error('DB init error', err));

// Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/auth', authRoute);
app.use('/api/reports', reportRoute);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'page-pulse-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req,res)=>{
  res.json({
    success: true,
    message: 'Page Pulse Backend Running',
    health: '/health',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});
