// Importa Mongoose, que gestiona la conexión y los modelos de MongoDB.
import mongoose from 'mongoose'

// Conecta la aplicación a la base de datos configurada en el entorno.
export const connectDB = async () => {
  try {
    // Abre la conexión usando la URI de MongoDB.
    const connection = await mongoose.connect(process.env.MONGODB_URI)
    // Muestra el host conectado para facilitar el diagnóstico al iniciar.
    console.log(`MongoDB connected: ${connection.connection.host}`)
  } catch (error) {
    // Informa del motivo si la conexión no pudo establecerse.
    console.error(`MongoDB connection error: ${error.message}`)
    // Permite que server.js gestione el fallo de arranque de forma centralizada.
    throw error
  }
}
