const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > Date.now()
        },
        message: 'La fecha debe ser en el futuro.'
      }
    },
    location: { type: String, required: true },
    description: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    poster: { type: String },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Event', EventSchema)
