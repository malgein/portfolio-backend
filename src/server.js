// Carga automáticamente las variables de entorno del archivo .env.
import 'dotenv/config'
// Importa la aplicación Express ya configurada.
import app from './app.js'
// Importa la función que establece la conexión con MongoDB.
import { connectDB } from './config/db.js'

// Usa el puerto indicado por el entorno o 5000 durante el desarrollo local.
const PORT = process.env.PORT || 5000

// Valida la configuración, conecta la base de datos e inicia el servidor HTTP.
const startServer = async () => {
  // Impide iniciar si no se ha configurado la URI de MongoDB.
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  // Impide iniciar si falta el secreto usado para firmar los JWT.
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  // Espera a la base de datos antes de aceptar peticiones.
  await connectDB()

  // Comienza a escuchar solicitudes HTTP en el puerto configurado.
  app.listen(PORT, () => {
    // Informa de la URL local disponible tras iniciar correctamente.
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

// Ejecuta el arranque y captura cualquier fallo no controlado durante ese proceso.
startServer().catch((error) => {
  // Registra solo el mensaje para una salida de consola clara.
  console.error(error.message)
  // Termina con código de error para avisar al sistema operativo o al despliegue.
  process.exit(1)
})
