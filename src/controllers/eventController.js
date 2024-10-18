const Event = require('../models/Event')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')

// Crear evento - Solo organizadores y administradores pueden crear eventos
exports.createEvent = [
  body('title').notEmpty().withMessage('El título es obligatorio.'),
  body('date')
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601.')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('La fecha del evento no puede estar en el pasado.')
      }
      return true
    }),
  body('location').notEmpty().withMessage('La ubicación es obligatoria.'),
  body('description').notEmpty().withMessage('La descripción es obligatoria.'),

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userRole = req.user.role
    if (userRole !== 'organizer' && userRole !== 'admin') {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para crear eventos.' })
    }

    try {
      const { title, date, location, description } = req.body

      console.log('Datos del formulario:', req.body)
      console.log('Archivo subido:', req.file)

      const event = new Event({
        title,
        date,
        location,
        description,
        poster: req.file ? req.file.path : null,
        organizer: req.user.id
      })

      await event.save()
      res.status(201).json(event)
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear el evento',
        error: error.message || error
      })
    }
  }
]

// Obtener todos los eventos
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('attendees', 'name email')
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener un evento por ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email')
      .populate('organizer', 'name email')
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' })
    }
    res.status(200).json(event)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar evento
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' })
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar este evento.'
      })
    }

    if (req.body.date && new Date(req.body.date) < new Date()) {
      return res
        .status(400)
        .json({ message: 'No puedes actualizar la fecha a una en el pasado.' })
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, poster: req.file ? req.file.path : undefined },
      { new: true }
    )
    res.status(200).json(updatedEvent)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Eliminar evento
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado.' })
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar este evento.'
      })
    }

    await Event.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Evento eliminado con éxito.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Confirmar asistencia a un evento
exports.attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' })
    }

    if (new Date(event.date) < new Date()) {
      return res
        .status(400)
        .json({ message: 'No puedes asistir a un evento que ya ha terminado.' })
    }

    if (event.attendees.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: 'Ya estás registrado como asistente.' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Añadir el usuario al array de asistentes del evento
    event.attendees.push(req.user.id)
    await event.save()

    // Añadir el evento al array de eventos asistidos por el usuario
    user.attendedEvents.push(event._id)
    await user.save()

    res.status(200).json({ message: 'Asistencia confirmada con éxito', event })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
