// Carga automáticamente las variables de entorno del archivo .env.
import 'dotenv/config'
// Permite cerrar la conexión de Mongoose durante el apagado ordenado.
import mongoose from 'mongoose'
// Importa la aplicación Express ya configurada.
import app from './app.js'
// Importa la función que establece la conexión con MongoDB.
import { connectDB } from './config/db.js'
import { getJWTSecret } from './config/jwtSecret.js'

// Usa el puerto indicado por el entorno o 5000 durante el desarrollo local.
const PORT = process.env.PORT || 5000
let server

// Valida la configuración, conecta la base de datos e inicia el servidor HTTP.
const startServer = async () => {
  // Impide iniciar si no se ha configurado la URI de MongoDB.
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  // Rechaza secretos JWT ausentes, de ejemplo, cortos o claramente predecibles.
  getJWTSecret()

  // Espera a la base de datos antes de aceptar peticiones.
  await connectDB()

  // Evita abrir el servidor si llegó una señal durante la conexión inicial.
  if (shuttingDown) return

  // Comienza a escuchar solicitudes HTTP en el puerto configurado.
  server = app.listen(PORT, () => {
    // Informa de la URL local disponible tras iniciar correctamente.
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

// Deja de aceptar peticiones, espera las activas y después cierra MongoDB.
let shuttingDown = false
const shutdown = async (signal) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}; shutting down gracefully`)

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out')
    process.exit(1)
  }, 10000)
  forceExitTimer.unref()

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }

    await mongoose.disconnect()
    clearTimeout(forceExitTimer)
    console.log('HTTP server and MongoDB connection closed')
  } catch (error) {
    clearTimeout(forceExitTimer)
    console.error(`Error during shutdown: ${error.message}`)
    process.exitCode = 1
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Ejecuta el arranque y captura cualquier fallo no controlado durante ese proceso.
startServer().catch((error) => {
  // Registra solo el mensaje para una salida de consola clara.
  console.error(error.message)
  // Termina con código de error para avisar al sistema operativo o al despliegue.
  process.exit(1)
})
