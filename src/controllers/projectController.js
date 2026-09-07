// Importa el modelo de MongoDB que representa los proyectos.
import Project from '../models/Project.js'
// Importa las funciones que suben y eliminan imágenes en Cloudinary.
import {
  deleteCloudinaryImage,
  uploadBufferToCloudinary,
} from '../utils/cloudinaryUpload.js'

// Obtiene todos los proyectos para la vista pública del portafolio.
export const getProjects = async (req, res) => {
  try {
    // Consulta los proyectos y ordena primero los creados más recientemente.
    const projects = await Project.find().sort({ createdAt: -1 })
    // Devuelve la colección resultante como JSON.
    res.json(projects)
  } catch (error) {
    // Marca la respuesta como error interno y delega el detalle al manejador centralizado.
    res.status(500)
    throw error
  }
}

// Obtiene un proyecto concreto a partir del id incluido en la URL.
export const getProjectById = async (req, res) => {
  try {
    // Busca el documento cuyo identificador coincide con el parámetro de ruta.
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    // Devuelve el proyecto encontrado como JSON.
    res.json(project)
  } catch (error) {
    // Detecta un id que no tiene el formato ObjectId de MongoDB.
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    // Marca el resto de errores como internos antes de delegarlos.
    res.status(500)
    throw error
  }
}

// Crea un proyecto nuevo y sube su imagen a Cloudinary.
export const createProject = async (req, res) => {
  try {
    // Extrae los campos de texto enviados en el formulario.
    const { name, description, code } = req.body

    if (!name || !description || !code) {
      return res.status(400).json({
        message: 'name, description and code are required',
      })
    }

    // Exige la imagen procesada por el middleware Multer.
    if (!req.file) {
      return res.status(400).json({
        message: 'Project image is required',
      })
    }

    // Sube el buffer temporal y conserva sus metadatos para crear el proyecto.
    const uploadedImage = await uploadBufferToCloudinary(req.file.buffer)

    // Si la base de datos falla después de subir la imagen, se revierte la subida.
    try {
      // Crea el documento usando la URL segura y el id remoto de la imagen.
      const project = await Project.create({
        name,
        description,
        code,
        image: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,
      })

      // Responde con 201 Created y el proyecto recién persistido.
      res.status(201).json(project)
    } catch (dbError) {
      // Evita una imagen huérfana cuando no se pudo guardar el proyecto.
      await deleteCloudinaryImage(uploadedImage.public_id)
      // Reenvía el error para que lo procese el bloque externo.
      throw dbError
    }
  } catch (error) {
    // Marca cualquier fallo no respondido anteriormente como error interno.
    res.status(500)
    throw error
  }
}

// Actualiza los campos enviados de un proyecto y opcionalmente reemplaza su imagen.
export const updateProject = async (req, res) => {
  try {
    // Incluye el id privado de Cloudinary, necesario si se sustituye la imagen.
    const project = await Project.findById(req.params.id).select(
      '+imagePublicId'
    )

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    // Extrae los campos editables que pudieron llegar en la petición.
    const { name, description, code } = req.body

    // Actualiza el nombre solo si el cliente lo proporcionó.
    if (name !== undefined) project.name = name
    // Actualiza la descripción solo si el cliente la proporcionó.
    if (description !== undefined) project.description = description
    // Actualiza la referencia al código solo si el cliente la proporcionó.
    if (code !== undefined) project.code = code

    // Inicializa el registro de una posible imagen nueva para poder revertirla.
    let newUpload = null
    // Conserva el id de la imagen actual antes de cambiarlo.
    const oldPublicId = project.imagePublicId

    // Sube y asigna una imagen nueva si Multer recibió un archivo.
    if (req.file) {
      newUpload = await uploadBufferToCloudinary(req.file.buffer)
      project.image = newUpload.secure_url
      project.imagePublicId = newUpload.public_id
    }

    // Persiste los cambios y limpia la imagen anterior solo después de guardar con éxito.
    try {
      await project.save()

      // Elimina la imagen antigua cuando fue sustituida por una nueva.
      if (newUpload && oldPublicId) {
        await deleteCloudinaryImage(oldPublicId)
      }

      // Consulta de nuevo el proyecto sin el campo privado imagePublicId.
      const responseProject = await Project.findById(project._id)
      // Devuelve la versión pública actualizada del proyecto.
      res.json(responseProject)
    } catch (dbError) {
      // Elimina la nueva imagen si el guardado no llegó a completarse.
      if (newUpload) {
        await deleteCloudinaryImage(newUpload.public_id)
      }
      // Reenvía el error para que lo gestione el bloque externo.
      throw dbError
    }
  } catch (error) {
    // Responde 400 si el id recibido no puede convertirse a ObjectId.
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    // Marca cualquier otro error como interno y lo delega al manejador centralizado.
    res.status(500)
    throw error
  }
}

// Elimina un proyecto de MongoDB e intenta eliminar también su imagen remota.
export const deleteProject = async (req, res) => {
  try {
    // Recupera el proyecto junto con el id privado de su recurso en Cloudinary.
    const project = await Project.findById(req.params.id).select(
      '+imagePublicId'
    )

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    // Guarda el id de Cloudinary antes de borrar el documento.
    const publicId = project.imagePublicId

    // Elimina el proyecto de la base de datos.
    await project.deleteOne()

    // Intenta liberar la imagen remota sin deshacer una eliminación ya realizada en MongoDB.
    try {
      await deleteCloudinaryImage(publicId)
    } catch (cloudinaryError) {
      console.error(
        'Project deleted, but Cloudinary cleanup failed:',
        cloudinaryError.message
      )
    }

    // Confirma que la eliminación principal se completó correctamente.
    res.json({
      message: 'Project deleted successfully',
    })
  } catch (error) {
    // Responde 400 cuando el identificador no tiene un formato válido.
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    // Marca el resto de errores como internos y los delega al manejador centralizado.
    res.status(500)
    throw error
  }
}
