const Review = require('../models/Review')
const Event = require('../models/Event')
const User = require('../models/User')

exports.createReview = async (req, res) => {
  try {
    const { content, rating, event } = req.body

    const eventExists = await Event.findById(event)
    if (!eventExists) {
      return res.status(404).json({ message: 'El evento no existe.' })
    }

    const userExists = await User.findById(req.user.id)
    if (!userExists) {
      return res.status(404).json({ message: 'El usuario no existe.' })
    }

    if (!eventExists.attendees.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: 'Debes asistir al evento para dejar una reseña.' })
    }

    const review = new Review({
      content,
      rating,
      event,
      user: req.user.id
    })
    await review.save()
    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('event user')
    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getReviewsByEvent = async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId }).populate(
      'user',
      'name'
    )
    if (!reviews || reviews.length === 0) {
      // Retornar un array vacío con status 200
      return res.status(200).json([])
    }
    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('event user')
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' })
    }
    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' })
    }

    if (review.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para modificar esta reseña.' })
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.status(200).json(updatedReview)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' })
    }

    // Permitir eliminar si el usuario es el creador de la reseña o si es administrador
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar esta reseña.' })
    }

    await Review.findByIdAndDelete(req.params.id)
    res.status(204).json()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
