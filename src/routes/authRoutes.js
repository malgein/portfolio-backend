// import express from 'express'
// import { getMe, login } from '../controllers/authController.js'
// import { protect } from '../middleware/auth.js'

// const router = express.Router()

// router.post('/login', login)
// router.get('/me', protect, getMe)

// export default router

import express from 'express'

import {
  getMe,
  login,
  updateMe,
} from '../controllers/authController.js'

import { protect } from '../middleware/auth.js'

const router = express.Router()

// =========================
// LOGIN
// =========================

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

router
  .route('/me')
  .get(protect, getMe)
  .patch(protect, updateMe)

export default router