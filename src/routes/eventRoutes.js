const express = require('express')
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  attendEvent
} = require('../controllers/eventController')
const {
  authMiddleware,
  organizerMiddleware
} = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/uploadMiddleware')

const router = express.Router()

router.get('/', getEvents)
router.get('/:id', getEventById)

router.post(
  '/',
  authMiddleware,
  organizerMiddleware,
  upload.single('poster'),
  createEvent
)

router.put(
  '/:id',
  authMiddleware,
  organizerMiddleware,
  upload.single('poster'),
  updateEvent
)

router.delete('/:id', authMiddleware, organizerMiddleware, deleteEvent)

router.post('/:id/attend', authMiddleware, attendEvent)

module.exports = router
