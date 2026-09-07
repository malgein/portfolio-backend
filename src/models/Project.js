import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },

    // Se guarda para poder borrar/reemplazar la imagen en Cloudinary.
    imagePublicId: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
)

const Project = mongoose.model('Project', projectSchema)

export default Project
