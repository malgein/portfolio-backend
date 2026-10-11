// Carga las variables de entorno necesarias para crear el administrador.
import 'dotenv/config'
// Importa Mongoose para cerrar explícitamente la conexión al finalizar el script.
import mongoose from 'mongoose'
// Importa la función compartida que conecta con MongoDB.
import { connectDB } from '../src/config/db.js'
// Importa el modelo con el que se creará el usuario administrador.
import User from '../src/models/User.js'

// Crea el administrador inicial solo si aún no existe en la base de datos.
const createAdmin = async () => {
  // Extrae de la configuración los datos necesarios para el usuario administrador.
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env'
    )
  }

  // Abre la conexión antes de consultar o escribir usuarios.
  await connectDB()

  // Busca un usuario previo con el correo normalizado para evitar duplicados.
  const existingUser = await User.findOne({
    email: ADMIN_EMAIL.toLowerCase().trim(),
  })

  // Sale sin modificar datos si el administrador ya existe.
  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  // Inserta el administrador; el middleware del modelo cifra su contraseña al guardar.
  await User.create({
    name: ADMIN_NAME || 'Portfolio Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  })

  console.log('Admin user created successfully')
}

// Ejecuta el proceso de creación.
createAdmin()
  .catch((error) => {
    // Muestra el motivo de un fallo y deja un código de salida no satisfactorio.
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    // Cierra la conexión aunque el usuario ya existiera o el proceso hubiera fallado.
    await mongoose.connection.close()
  })
