import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { env, isProd } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { logger } from './utils/logger';

const app = express();

// --- Security ---
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- Body Parsers ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Session ---
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProd,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/v1', routes);

// --- 404 Catch-all ---
app.use(notFoundHandler);

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
