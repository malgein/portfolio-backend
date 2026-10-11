// Importa Express para crear y configurar la aplicación HTTP.
import express from 'express'
// Permite comprobar el estado actual de la conexión de Mongoose.
import mongoose from 'mongoose'
// Importa el middleware que gestiona las políticas CORS.
import cors from 'cors'
// Importa las rutas relacionadas con autenticación y perfil.
import authRoutes from './routes/authRoutes.js'
// Importa las rutas que administran los proyectos del portafolio.
import projectRoutes from './routes/projectRoutes.js'
// Importa los middlewares para rutas inexistentes y errores centralizados.
import { errorHandler, notFound } from './middleware/errorHandler.js'

// Crea la instancia principal de la aplicación Express.
const app = express()

// Render está detrás de un proxy; permite que el limitador identifique la IP cliente.
app.set('trust proxy', 1)

// Lee los orígenes autorizados o usa el frontend local como valor por defecto.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  // Permite definir varios orígenes separados por comas en la variable de entorno.
  .split(',')
  // Elimina espacios accidentales de cada origen configurado.
  .map((origin) => origin.trim())

// Configura CORS antes de registrar las rutas de la API.
app.use(
  cors({
    // Decide dinámicamente si el origen de la petición puede acceder a la API.
    origin(origin, callback) {
      // Permite clientes sin Origin, como Postman.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // Rechaza los orígenes que no estén en la lista permitida.
      callback(new Error('Origin not allowed by CORS'))
    },
    // Permite enviar credenciales, como cookies de sesión, entre orígenes autorizados.
    credentials: true,
  })
)

// Convierte cuerpos JSON de hasta 1 MB en objetos disponibles en req.body.
app.use(express.json({ limit: '1mb' }))
// Convierte formularios URL-encoded con límites de tamaño, cantidad y anidamiento.
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
    parameterLimit: 100,
    depth: 5,
  })
)

// Comprueba la disponibilidad real de MongoDB, además de la respuesta de Express.
app.get('/api/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return res.status(503).json({ ok: false, database: 'unavailable' })
    }

    await mongoose.connection.db.admin().ping()
    return res.json({ ok: true, database: 'available' })
  } catch {
    return res.status(503).json({ ok: false, database: 'unavailable' })
  }
})

// Monta el conjunto de rutas de autenticación bajo el prefijo indicado.
app.use('/api/auth', authRoutes)
// Monta el conjunto de rutas de proyectos bajo el prefijo indicado.
app.use('/api/projects', projectRoutes)

// Responde 404 cuando ninguna ruta anterior atendió la petición.
app.use(notFound)
// Procesa de manera uniforme los errores enviados por Express.
app.use(errorHandler)

// Exporta la aplicación para iniciarla desde server.js o probarla aisladamente.
export default app
