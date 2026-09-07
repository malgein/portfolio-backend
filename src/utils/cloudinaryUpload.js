// Importa el cliente de Cloudinary ya configurado con sus credenciales.
import cloudinary from '../config/cloudinary.js'

// Sube a Cloudinary una imagen que Multer mantiene temporalmente en memoria.
export const uploadBufferToCloudinary = (buffer) => {
  // Convierte la API basada en callbacks de Cloudinary en una promesa esperable con await.
  return new Promise((resolve, reject) => {
    // Crea un stream de subida con las opciones de almacenamiento y optimización.
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Guarda la imagen en la carpeta configurada o en la carpeta predeterminada.
        folder: process.env.CLOUDINARY_FOLDER || 'portfolio-projects',
        // Declara explícitamente que el recurso recibido es una imagen.
        resource_type: 'image',
        // Solicita a Cloudinary optimizaciones automáticas al servir el recurso.
        transformation: [
          {
            // Ajusta la calidad de forma automática según el contexto de entrega.
            quality: 'auto',
            // Entrega el formato más adecuado para el navegador que lo solicita.
            fetch_format: 'auto',
          },
        ],
      },
      // Resuelve con el resultado de subida o rechaza la promesa si Cloudinary devuelve un error.
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    // Envía todo el buffer al stream y señala que no se escribirán más datos.
    uploadStream.end(buffer)
  })
}

// Elimina de Cloudinary una imagen a partir de su identificador público.
export const deleteCloudinaryImage = async (publicId) => {
  // No intenta borrar nada si el proyecto no tiene una imagen asociada.
  if (!publicId) return
  // Solicita la eliminación remota del recurso.
  await cloudinary.uploader.destroy(publicId)
}
