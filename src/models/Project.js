// Importa Mongoose para definir el esquema y modelo de los proyectos.
import mongoose from 'mongoose'

// Define la estructura, validaciones y opciones de persistencia de un proyecto.
const projectSchema = new mongoose.Schema(
  {
    // Almacena la URL segura desde la que se muestra la imagen del proyecto.
    image: {
      type: String,
      required: true,
      trim: true,
    },
    // Almacena el texto descriptivo del proyecto.
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Almacena el nombre que identifica al proyecto.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Almacena el código fuente del proyecto.
    code: {
      type: String,
      required: true,
      trim: true,
    },
    //url del proyecto
      url: {
      type: String,
      required: true,
      trim: true,
    },

    // Se guarda para poder borrar/reemplazar la imagen en Cloudinary.
    imagePublicId: {
      type: String,
      // comentar required para pruebas desde insomnia
      required: true,
      select: false,
    },
  },
  // Añade automáticamente las fechas de creación y última actualización.
  { timestamps: true }
)

// Compila el esquema como el modelo Project asociado a la colección de MongoDB.
const Project = mongoose.model('Project', projectSchema)

// Exporta el modelo para consultar y modificar proyectos desde los controladores.
export default Project
