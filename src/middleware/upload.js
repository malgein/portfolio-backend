// Importa Multer, el middleware que procesa formularios multipart/form-data.
import multer from 'multer'

// Indica que los archivos se guardarán temporalmente como buffers en memoria.
const storage = multer.memoryStorage()

// Valida el tipo MIME de cada archivo antes de aceptarlo.
const fileFilter = (req, file, cb) => {
  // Enumera los tipos de imagen admitidos por la API.
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]

  // Rechaza el archivo si su tipo MIME no pertenece a la lista permitida.
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error('Only JPG, PNG, WEBP and GIF images are allowed')
    )
  }

  // Comunica a Multer que el archivo es válido.
  cb(null, true)
}

// Crea y exporta el middleware de subida con las reglas definidas.
export const upload = multer({
  // Usa el almacenamiento temporal en memoria.
  storage,
  // Aplica el filtro de tipos de archivo.
  fileFilter,
  // Establece límites para evitar cargas excesivas.
  limits: {
    // Limita cada imagen a cinco megabytes.
    fileSize: 5 * 1024 * 1024,
    // Solo se admite la imagen esperada en cada petición.
    files: 1,
    // Limita la cantidad de campos de texto del formulario.
    fields: 10,
    // Limita el total de componentes multipart (archivo y campos).
    parts: 11,
    // Limita los nombres y valores de los campos de texto.
    fieldNameSize: 100,
    fieldSize: 16 * 1024,
    // Limita la cantidad de cabeceras por parte multipart.
    headerPairs: 100,
  },
})




