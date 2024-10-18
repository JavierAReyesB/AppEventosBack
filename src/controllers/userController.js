const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Event = require('../models/Event') // Importamos el modelo de Evento si es necesario

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'El correo electrónico ya está registrado.' })
    }

    const user = new User({ name, email, password })
    await user.save()

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.status(200).json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener el perfil del usuario
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener los eventos asistidos por el usuario (pasados)
exports.getAttendedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('attendedEvents') // Populamos los eventos asistidos

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Filtramos los eventos pasados (asistidos) basado en la fecha
    const pastEvents = user.attendedEvents.filter(
      (event) => new Date(event.date) < new Date()
    )

    res.status(200).json(pastEvents)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener los eventos futuros a los que el usuario está inscrito
exports.getUpcomingEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('attendedEvents') // Populamos los eventos asistidos

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Filtramos los eventos futuros basado en la fecha
    const upcomingEvents = user.attendedEvents.filter(
      (event) => new Date(event.date) >= new Date()
    )

    res.status(200).json(upcomingEvents)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}
