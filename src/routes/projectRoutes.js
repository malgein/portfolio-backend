import express from 'express'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/projectController.js'
import { authorize, protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Lectura pública para mostrar los proyectos en el portafolio.
router.get('/', getProjects)
router.get('/:id', getProjectById)

// Escritura protegida: solamente tu usuario administrador.
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  createProject
)

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateProject
)

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProject
)

export default router
