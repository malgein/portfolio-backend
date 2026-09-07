import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())

app.use(
  cors({
    origin(origin, callback) {
      // Permite clientes sin Origin, como Postman.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Portfolio API is running',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
