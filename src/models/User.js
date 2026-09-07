// Importa Mongoose para definir el esquema y modelo de usuario.
import mongoose from 'mongoose'
// Importa bcrypt para cifrar y comparar contraseñas de forma segura.
import bcrypt from 'bcryptjs'

// Define los datos, reglas de validación y opciones de almacenamiento de un usuario.
const userSchema = new mongoose.Schema(
  {
    // Guarda el nombre mostrado del usuario administrador.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Guarda el correo, que debe ser único y se normaliza a minúsculas.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Guarda el hash de la contraseña; no se incluye por defecto en las consultas.
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    // Restringe el rol al único rol autorizado actualmente por la aplicación.
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  // Añade automáticamente las fechas de creación y actualización.
  { timestamps: true }
)

// Antes de guardar, cifra la contraseña solo si fue creada o modificada.
userSchema.pre('save', async function () {
  // Evita recalcular el hash al guardar cambios que no afectan la contraseña.
  if (!this.isModified('password')) return
  // Genera un hash bcrypt con un coste de 12 rondas y lo reemplaza en el documento.
  this.password = await bcrypt.hash(this.password, 12)
})

// Añade un método de instancia para comprobar una contraseña recibida frente al hash guardado.
userSchema.methods.comparePassword = function (candidatePassword) {
  // Devuelve la promesa booleana de comparación de bcrypt.
  return bcrypt.compare(candidatePassword, this.password)
}

// Compila el esquema como el modelo User asociado a la colección de MongoDB.
const User = mongoose.model('User', userSchema)

// Exporta el modelo para usarlo en autenticación y scripts administrativos.
export default User
