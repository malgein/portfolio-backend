// Importa Express para crear y configurar la aplicación HTTP.
import express from 'express'
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
// Convierte formularios URL-encoded, incluidos valores anidados, en req.body.
app.use(express.urlencoded({ extended: true }))

// Expone una ruta pública y ligera para comprobar que la API está activa.
app.get('/api/health', (req, res) => {
  // Devuelve una respuesta de estado satisfactoria.
  res.json({
    // Indica de forma programática que el servicio funciona.
    ok: true,
    // Aporta un mensaje legible para humanos.
    message: 'Portfolio API is running',
  })
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
