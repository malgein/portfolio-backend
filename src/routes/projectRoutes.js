// Importa Express para crear un enrutador independiente.
import express from 'express'
// Importa los controladores que implementan cada operación sobre proyectos.
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/projectController.js'
// Importa los middlewares de autenticación y autorización por rol.
import { authorize, protect } from '../middleware/auth.js'
// Importa el middleware que recibe y valida la imagen subida.
import { upload } from '../middleware/upload.js'

// Crea el enrutador que se montará bajo /api/projects.
const router = express.Router()

// Lectura pública para mostrar los proyectos en el portafolio.
// Lista todos los proyectos disponibles.
router.get('/', getProjects)
// Devuelve el proyecto que corresponde al identificador de la URL.
router.get('/:id', getProjectById)

// Escritura protegida: solamente tu usuario administrador.
// Crea un proyecto; exige token de administrador e imagen en el campo "image".
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  createProject
)

// Actualiza total o parcialmente un proyecto existente bajo las mismas restricciones.
router.patch(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateProject
)

// Elimina un proyecto existente; solo puede hacerlo un administrador autenticado.
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProject
)

// Exporta el enrutador para registrarlo en la aplicación principal.
export default router
