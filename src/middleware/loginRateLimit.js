import rateLimit from 'express-rate-limit'

// Cuenta intentos fallidos por IP; permite hasta diez en una ventana de quince minutos.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many login attempts. Try again in 15 minutes.',
  },
})
