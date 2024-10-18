const express = require('express')
const {
  createReview,
  getReviews,
  getReviewById,
  getReviewsByEvent,
  updateReview,
  deleteReview
} = require('../controllers/reviewController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/', authMiddleware, createReview)
router.get('/', getReviews)
router.get('/:id', getReviewById)
router.get('/event/:eventId', getReviewsByEvent)
router.put('/:id', authMiddleware, updateReview)
router.delete('/:id', authMiddleware, deleteReview)

module.exports = router
