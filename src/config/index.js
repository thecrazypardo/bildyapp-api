// Configuración centralizada de la aplicación.
// Todas las variables de entorno se leen aquí una única vez (T1: --env-file=.env)

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,

  mongoUri: required('MONGO_URI'),

  jwt: {
    accessSecret: required('JWT_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d'
  },

  uploads: {
    dir: 'uploads',
    maxLogoSizeMb: Number(process.env.MAX_LOGO_SIZE_MB) || 5
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100
  }
};
