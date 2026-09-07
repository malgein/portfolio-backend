export const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  })
}

export const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message,
    })
  }

  if (err.message?.includes('Only JPG')) {
    return res.status(400).json({
      message: err.message,
    })
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  })
}
