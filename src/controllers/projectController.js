import Project from '../models/Project.js'
import {
  deleteCloudinaryImage,
  uploadBufferToCloudinary,
} from '../utils/cloudinaryUpload.js'

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500)
    throw error
  }
}

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    res.json(project)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    res.status(500)
    throw error
  }
}

export const createProject = async (req, res) => {
  try {
    const { name, description, code } = req.body

    if (!name || !description || !code) {
      return res.status(400).json({
        message: 'name, description and code are required',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Project image is required',
      })
    }

    const uploadedImage = await uploadBufferToCloudinary(req.file.buffer)

    try {
      const project = await Project.create({
        name,
        description,
        code,
        image: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,
      })

      res.status(201).json(project)
    } catch (dbError) {
      await deleteCloudinaryImage(uploadedImage.public_id)
      throw dbError
    }
  } catch (error) {
    res.status(500)
    throw error
  }
}

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select(
      '+imagePublicId'
    )

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    const { name, description, code } = req.body

    if (name !== undefined) project.name = name
    if (description !== undefined) project.description = description
    if (code !== undefined) project.code = code

    let newUpload = null
    const oldPublicId = project.imagePublicId

    if (req.file) {
      newUpload = await uploadBufferToCloudinary(req.file.buffer)
      project.image = newUpload.secure_url
      project.imagePublicId = newUpload.public_id
    }

    try {
      await project.save()

      if (newUpload && oldPublicId) {
        await deleteCloudinaryImage(oldPublicId)
      }

      const responseProject = await Project.findById(project._id)
      res.json(responseProject)
    } catch (dbError) {
      if (newUpload) {
        await deleteCloudinaryImage(newUpload.public_id)
      }
      throw dbError
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    res.status(500)
    throw error
  }
}

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select(
      '+imagePublicId'
    )

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    const publicId = project.imagePublicId

    await project.deleteOne()

    try {
      await deleteCloudinaryImage(publicId)
    } catch (cloudinaryError) {
      console.error(
        'Project deleted, but Cloudinary cleanup failed:',
        cloudinaryError.message
      )
    }

    res.json({
      message: 'Project deleted successfully',
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid project id',
      })
    }

    res.status(500)
    throw error
  }
}
