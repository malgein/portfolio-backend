// import express from 'express'
// import { getMe, login } from '../controllers/authController.js'
// import { protect } from '../middleware/auth.js'

// const router = express.Router()

// router.post('/login', login)
// router.get('/me', protect, getMe)

// export default router

// Importa Express para crear un enrutador independiente.
import express from 'express'

// Importa los controladores de inicio de sesión y gestión del perfil.
import {
  getMe,
  login,
  updateMe,
} from '../controllers/authController.js'

// Importa el middleware que exige un JWT válido.
import { protect } from '../middleware/auth.js'

// Crea el enrutador que se montará bajo /api/auth.
const router = express.Router()

// =========================
// LOGIN
// =========================

// Recibe credenciales y devuelve un token para iniciar sesión.
router.post('/login', login)

// =========================
// DATOS DEL USUARIO
// =========================
//
// GET  /api/auth/me
// PATCH /api/auth/me
//
// Ambas rutas necesitan estar autenticadas
// mediante el middleware protect.
//

// Agrupa los métodos HTTP que comparten la misma ruta de perfil.
router
  .route('/me')
  .get(protect, getMe)
  .patch(protect, updateMe)

// Exporta el enrutador para registrarlo en la aplicación principal.
export default router
