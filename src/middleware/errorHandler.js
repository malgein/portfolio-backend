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

  // Devuelve 413 para límites de tamaño y cantidad; otros errores Multer son 400.
  if (err.name === 'MulterError') {
    const payloadLimitCodes = [
      'LIMIT_FILE_SIZE',
      'LIMIT_FIELD_VALUE',
      'LIMIT_PART_COUNT',
      'LIMIT_FIELD_COUNT',
    ]
    const statusCode = payloadLimitCodes.includes(err.code) ? 413 : 400
    return res.status(statusCode).json({
      message: err.message,
    })
  }

  // Convierte el error personalizado del filtro de tipos de imagen en un 400.
  if (err.message?.includes('Only JPG')) {
    return res.status(400).json({
      message: err.message,
    })
  }

  // Conserva el código HTTP que pueda adjuntar Cloudinary u otro proveedor.
  const providerStatusCode = err.http_code ?? err.statusCode ?? err.status
  const statusCode = Number.isInteger(providerStatusCode) &&
    providerStatusCode >= 400 &&
    providerStatusCode <= 599
    ? providerStatusCode
    : res.statusCode === 200
      ? 500
      : res.statusCode

  // Evita exponer mensajes internos del proveedor cuando ocurre un error 5xx.
  const message = statusCode >= 500
    ? 'Internal server error'
    : err.message || 'Request failed'

  // Envía una respuesta JSON uniforme al cliente.
  res.status(statusCode).json({
    message,
  })
}
