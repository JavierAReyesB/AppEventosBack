const express = require('express')
const {
  register,
  login,
  getUserProfile,
  getAttendedEvents,
  getUpcomingEvents // Importamos la nueva función para eventos futuros
} = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const router = express.Router()

// Rutas de usuario
router.post('/register', register)
router.post('/login', login)
router.get('/:id', authMiddleware, getUserProfile)

// Nueva ruta para obtener los eventos asistidos (pasados)
router.get('/:id/attended-events', authMiddleware, getAttendedEvents)

// Nueva ruta para obtener los eventos futuros a los que el usuario está inscrito
router.get('/:id/upcoming-events', authMiddleware, getUpcomingEvents)

module.exports = router
