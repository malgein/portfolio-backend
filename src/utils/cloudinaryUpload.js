import cloudinary from '../config/cloudinary.js'

export const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'portfolio-projects',
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId)
}
