const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()

// CORS config — allow frontend
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://querynest-1-c6h4.onrender.com' ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions))
app.use(express.json())

connectDB()

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/documents', require('./routes/documents'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`))
