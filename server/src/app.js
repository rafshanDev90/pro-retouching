import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import { env, isProd } from './config/env.js';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/health.routes.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

/**
 * Allowed browser origins for CORS. CLIENT_URL accepts a comma-separated list
 * (e.g. "https://app.vercel.app,http://localhost:3000"). The deployed frontend
 * origins below are always allowed as a safety net, even if CLIENT_URL is
 * misconfigured or missing in the hosting environment.
 */
const BUILT_IN_ORIGINS = [
  'https://pro-retouching-chi.vercel.app/',
  'https://pro-retouching.vercel.app',
];

const allowedOrigins = [
  ...new Set([
    ...BUILT_IN_ORIGINS,
    ...env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean),
  ]),
];

const app = express();

// Behind a proxy (Vercel / nginx) so req.ip and secure cookies work correctly
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS: allowed origins get CORS headers, with credentials (cookies) enabled.
// Requests from any other origin receive no CORS headers at all.
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
});

app.use(corsMiddleware);

// Explicitly answer preflight requests with the same policy so they never fall
// through to a non-2xx response (which the browser reports as
// ERR_INVALID_HTTP_RESPONSE).
app.options('*', corsMiddleware);

// Body parsing with a sane limit (base64-encoded uploads live in later phases)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

// Strip `$`/`.` operators from user input to prevent NoSQL injection
app.use(mongoSanitize());

if (!isProd) app.use(morgan('dev'));

// Health is mounted before the DB gate so it answers even when MongoDB is
// unreachable — that is exactly when the operator needs it most.
app.use('/api/health', healthRoutes);

// Ensure the database is connected before any route runs. The connection is
// cached across invocations, so this is a no-op on warm serverless requests.
// It sits after CORS/OPTIONS so preflight requests never touch the database.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/api', apiLimiter, apiRoutes);

// 404 → central error handler → { success, message, data }
app.use(notFound);
app.use(errorHandler);

export default app;
