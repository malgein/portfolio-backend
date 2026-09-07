import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
