// Importa las funciones necesarias para verificar tokens JWT.
import jwt from 'jsonwebtoken'
// Importa el modelo con el que se recupera el usuario autenticado.
import User from '../models/User.js'

// Protege una ruta verificando que el cliente haya enviado un token válido.
export const protect = async (req, res, next) => {
  try {
    // Obtiene la cabecera donde debe llegar el token Bearer.
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required',
      })
    }

    // Extrae el token, omitiendo el prefijo "Bearer ".
    const token = authorization.split(' ')[1]
    // Verifica la firma y decodifica el contenido del JWT.
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Comprueba que el usuario del token todavía existe en la base de datos.
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      })
    }

    // Adjunta el usuario a la petición para los controladores y middlewares posteriores.
    req.user = user
    // Cede el control al siguiente middleware de la cadena.
    next()
  } catch (error) {
    // Un token malformado, caducado o con firma inválida recibe un 401 genérico.
    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}

// Crea un middleware que permite continuar únicamente a los roles indicados.
export const authorize = (...roles) => {
  // Devuelve el middleware para que Express lo ejecute después de protect.
  return (req, res, next) => {
    // Rechaza al usuario autenticado si su rol no está autorizado para esta acción.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You are not authorized to perform this action',
      })
    }

    // Cede el control cuando el rol sí tiene permiso.
    next()
  }
}
