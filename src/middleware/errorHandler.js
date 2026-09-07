// Responde cuando ninguna ruta anterior coincidió con la petición entrante.
export const notFound = (req, res) => {
  // Devuelve el código HTTP para recurso o ruta no encontrada.
  res.status(404).json({
    // Incluye la URL original para que el cliente pueda identificar el fallo.
    message: `Route not found: ${req.originalUrl}`,
  })
}

// Centraliza los errores enviados mediante throw o next(error) en Express.
export const errorHandler = (err, req, res, next) => {
  // Registra el error completo en el servidor para facilitar su diagnóstico.
  console.error(err)

  // Convierte los errores propios de Multer, como un archivo demasiado grande, en un 400.
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message,
    })
  }

  // Convierte el error personalizado del filtro de tipos de imagen en un 400.
  if (err.message?.includes('Only JPG')) {
    return res.status(400).json({
      message: err.message,
    })
  }

  // Conserva un estado de error ya asignado; si no existe, usa 500.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Envía una respuesta JSON uniforme al cliente.
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  })
}
