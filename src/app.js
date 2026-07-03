import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { userRouter } from './routes/user.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { sanitizeInput } from './middleware/sanitize.js';

export const app = express();

// --- Seguridad (T6) ---
app.use(helmet());
app.use(cors());

app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas peticiones, inténtalo más tarde' }
    }
  })
);

// --- Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitización contra inyección NoSQL (debe ir tras los parsers de body)
app.use(sanitizeInput);

// --- Archivos estáticos (logos subidos) ---
app.use(`/${config.uploads.dir}`, express.static(config.uploads.dir));

// --- Rutas ---
app.get('/health', (_req, res) => res.json({ ok: true, service: 'bildyapp-api' }));
app.use('/api/user', userRouter);

// --- Manejo de errores (siempre al final) ---
app.use(notFoundHandler);
app.use(errorHandler);
