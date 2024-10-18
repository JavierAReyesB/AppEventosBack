const express = require('express')
const cors = require('cors') // Importa cors
const connectDB = require('./src/config/db') // Conexión a la base de datos
const userRoutes = require('./src/routes/userRoutes')
const eventRoutes = require('./src/routes/eventRoutes')
const reviewRoutes = require('./src/routes/reviewRoutes')
const fileService = require('./src/services/fileService')

const app = express()

// Conectar a la base de datos
connectDB()

// Configurar CORS de forma global, antes de cualquier ruta
app.use(
  cors({
    origin: 'https://app-eventos-front.vercel.app', // Permitir solicitudes desde el frontend en Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Permitir cookies y encabezados de autenticación
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
  })
)

// Middleware para manejar preflight OPTIONS
app.options('*', cors()) // Esto se asegura de que todas las solicitudes OPTIONS sean manejadas correctamente

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
