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


import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
})

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500)
    throw error
  }
}

export const getMe = async (req, res) => {
  res.json(serializeUser(req.user))
}

export const updateMe = async (req, res) => {
  try {
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

    if (name !== undefined) {
      const cleanName = name.trim()

      if (!cleanName) {
        return res.status(400).json({
          message: 'Name cannot be empty',
        })
      }

      user.name = cleanName
    }

    // =========================
    // ACTUALIZAR EMAIL
    // =========================

    if (email !== undefined) {
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

      user.email = cleanEmail
    }

    // =========================
    // ACTUALIZAR PASSWORD
    // =========================

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
      user.password = password
    }

    // Guardamos los cambios
    await user.save()

    // Generamos un nuevo token
    // después de actualizar los datos
    const token = generateToken(user)

    res.json({
      message: 'Profile updated successfully',
      token,
      user: serializeUser(user),
    })
  } catch (error) {
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
