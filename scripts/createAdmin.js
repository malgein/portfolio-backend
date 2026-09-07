import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import User from '../src/models/User.js'

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env'
    )
  }

  await connectDB()

  const existingUser = await User.findOne({
    email: ADMIN_EMAIL.toLowerCase().trim(),
  })

  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  await User.create({
    name: ADMIN_NAME || 'Portfolio Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  })

  console.log('Admin user created successfully')
}

createAdmin()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
