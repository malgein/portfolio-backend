// import User from '../models/User.js'
// import { generateToken } from '../utils/generateToken.js'

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     if (!email || !password) {
//       return res.status(400).json({
//         message: 'Email and password are required',
//       })
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//     }).select('+password')

//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({
//         message: 'Invalid email or password',
//       })
//     }

//     const token = generateToken(user)

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     })
//   } catch (error) {
//     res.status(500)
//     throw error
//   }
// }

// export const getMe = async (req, res) => {
//   res.json({
//     id: req.user._id,
//     name: req.user.name,
//     email: req.user.email,
//     role: req.user.role,
//   })
// }


// Importa el modelo con el que se consulta y actualiza al usuario.
import User from '../models/User.js'
// Importa la función que firma los JWT de sesión.
import { generateToken } from '../utils/generateToken.js'

// Selecciona únicamente los datos seguros que pueden exponerse en una respuesta HTTP.
const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
})

// Valida credenciales y crea una sesión basada en un token JWT.
export const login = async (req, res) => {
  try {
    // Extrae el correo y contraseña enviados por el cliente.
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    // Busca al usuario por correo normalizado e incluye su contraseña para compararla.
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    // Firma un token que identifica al usuario y su rol.
    const token = generateToken(user)

    // Devuelve el token y los datos públicos del usuario autenticado.
    res.json({
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    // Marca los errores inesperados para el manejador centralizado.
    res.status(500)
    throw error
  }
}

// Devuelve el perfil del usuario que el middleware protect adjuntó a la petición.
export const getMe = async (req, res) => {
  // Serializa el usuario para no incluir campos sensibles.
  res.json(serializeUser(req.user))
}

// Actualiza los datos permitidos del perfil autenticado.
export const updateMe = async (req, res) => {
  try {
    // Extrae los campos que el usuario puede modificar y su contraseña actual de verificación.
    const {
      name,
      email,
      currentPassword,
      password,
    } = req.body

    // Verificamos que al menos un campo haya sido enviado
    if (
      name === undefined &&
      email === undefined &&
      password === undefined
    ) {
      return res.status(400).json({
        message:
          'Send at least one field to update: name, email or password',
      })
    }

    // Buscamos el usuario incluyendo el password
    // porque necesitamos comprobarlo si quiere cambiarlo
    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    // =========================
    // ACTUALIZAR NOMBRE
    // =========================

    // Procesa un nuevo nombre solo si se proporcionó explícitamente.
    if (name !== undefined) {
      // Quita espacios innecesarios del nombre recibido.
      const cleanName = name.trim()

      if (!cleanName) {
        return res.status(400).json({
          message: 'Name cannot be empty',
        })
      }

      // Asigna el nombre validado al documento en memoria.
      user.name = cleanName
    }

    // =========================
    // ACTUALIZAR EMAIL
    // =========================

    // Procesa un nuevo correo solo si se proporcionó explícitamente.
    if (email !== undefined) {
      // Normaliza el correo eliminando espacios y usando minúsculas.
      const cleanEmail = email.toLowerCase().trim()

      if (!cleanEmail) {
        return res.status(400).json({
          message: 'Email cannot be empty',
        })
      }

      // Comprobamos que otro usuario no tenga ese email
      const emailAlreadyExists = await User.findOne({
        email: cleanEmail,
        _id: { $ne: user._id },
      })

      if (emailAlreadyExists) {
        return res.status(409).json({
          message: 'Email is already in use',
        })
      }

      // Asigna el correo validado al documento en memoria.
      user.email = cleanEmail
    }

    // =========================
    // ACTUALIZAR PASSWORD
    // =========================

    // Procesa el cambio de contraseña solo si se proporcionó una nueva.
    if (password !== undefined) {
      // Para cambiar el password exigimos
      // el password actual
      if (!currentPassword) {
        return res.status(400).json({
          message:
            'Current password is required to set a new password',
        })
      }

      // Comprobamos que el password actual sea correcto
      // Compara la contraseña actual indicada con el hash almacenado.
      const currentPasswordIsValid =
        await user.comparePassword(currentPassword)

      if (!currentPasswordIsValid) {
        return res.status(401).json({
          message: 'Current password is incorrect',
        })
      }

      // Password mínimo de 8 caracteres
      if (password.length < 8) {
        return res.status(400).json({
          message:
            'New password must contain at least 8 characters',
        })
      }

      // Evitamos que utilice el mismo password
      if (password === currentPassword) {
        return res.status(400).json({
          message:
            'New password must be different from the current password',
        })
      }

      // El modelo User se encarga de encriptarlo
      // mediante su middleware pre('save')
      // Asigna la contraseña en claro; el middleware pre-save la cifrará al guardar.
      user.password = password
    }

    // Guardamos los cambios
    // Guarda de una vez todas las modificaciones validadas.
    await user.save()

    // Generamos un nuevo token
    // después de actualizar los datos
    // Renueva el token para reflejar los datos y el momento de sesión actuales.
    const token = generateToken(user)

    // Devuelve la confirmación, el nuevo token y el perfil seguro.
    res.json({
      message: 'Profile updated successfully',
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    // Trata el índice único de MongoDB como un conflicto comprensible para el cliente.
    // Error de email duplicado de MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email is already in use',
      })
    }

    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      })
    }

    res.status(500)
    throw error
  }
}
