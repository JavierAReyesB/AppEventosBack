const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')
const userRoutes = require('./src/routes/userRoutes')
const eventRoutes = require('./src/routes/eventRoutes')
const reviewRoutes = require('./src/routes/reviewRoutes')
const fileService = require('./src/services/fileService')

const app = express()

// Conectar a la base de datos
connectDB()

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173', // Desarrollo local
  'https://app-eventos-front.vercel.app' // Producción
]

// Configurar CORS dinámico
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Usar CORS con las opciones configuradas
app.use(cors(corsOptions))

// ** Aquí es donde agregamos el middleware OPTIONS **
app.options('*', (req, res) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://app-eventos-front.vercel.app'
  )
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // Permite todas las solicitudes
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
  })
})

// Middleware para parsear JSON
app.use(express.json())

// Rutas de la API
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/reviews', reviewRoutes)

// Ruta para la subida de archivos
app.post('/upload', fileService.upload.single('image'), (req, res) => {
  res
    .status(200)
    .json({ message: 'Archivo subido correctamente', file: req.file })
})

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!')
})

// Iniciar el servidor
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
