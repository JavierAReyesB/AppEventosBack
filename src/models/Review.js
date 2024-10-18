const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Review', ReviewSchema)
