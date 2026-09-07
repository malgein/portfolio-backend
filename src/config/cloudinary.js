// Importa la versión 2 del SDK de Cloudinary y la renombra para usarla directamente.
import { v2 as cloudinary } from 'cloudinary'

// Configura el cliente con las credenciales definidas en las variables de entorno.
cloudinary.config({
  // Identifica la cuenta o espacio de Cloudinary.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // Identifica la clave pública de la API.
  api_key: process.env.CLOUDINARY_API_KEY,
  // Aporta el secreto con el que se firman las operaciones.
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Exporta el cliente ya configurado para reutilizarlo en toda la aplicación.
export default cloudinary
