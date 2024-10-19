require('dotenv').config()

const express = require('express')
const cors = require('cors') // Importa CORS
const connectDB = require('./src/config/db')
const userRoutes = require('./src/routes/userRoutes')
const eventRoutes = require('./src/routes/eventRoutes')
const reviewRoutes = require('./src/routes/reviewRoutes')
const fileService = require('./src/services/fileService')

const app = express()

// Conectar a la base de datos
connectDB()

// Configurar CORS
app.use(
  cors({
    origin: 'http://localhost:5173', // Permitir solicitudes desde el frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    credentials: true // Si envías cookies o encabezados específicos
  })
)

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
