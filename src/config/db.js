const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error('La variable de entorno DB_URL no está definida.')
    }

    await mongoose.connect(process.env.DB_URL)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('Error connecting to MongoDB', error)
    process.exit(1)
  }
}

module.exports = connectDB
