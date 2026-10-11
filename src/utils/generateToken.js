// Importa la librería que crea y firma tokens JWT.
import jwt from 'jsonwebtoken'
import { getJWTSecret } from '../config/jwtSecret.js'

// Genera un token con los datos mínimos necesarios para identificar y autorizar al usuario.
export const generateToken = (user) => {
  // Firma el payload y devuelve el JWT resultante.
  return jwt.sign(
    // Incluye el identificador y rol que los middlewares necesitarán después.
    {
      id: user._id,
      role: user.role,
    },
    // Usa el secreto privado configurado en el entorno para firmar el token.
    getJWTSecret(),
    // Configura metadatos del token.
    {
      // Define la caducidad configurada o siete días por defecto.
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  )
}
