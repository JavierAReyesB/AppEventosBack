const jwt = require('jsonwebtoken')

// Middleware para autenticar a los usuarios
exports.authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado.' })
  }

  if (!token.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'Formato de token inválido.' })
  }

  const bearerToken = token.split(' ')[1]

  // Verificación del token JWT
  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error al verificar token:', err) // Log para verificar si hubo algún error al validar el token
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'El token ha expirado. Por favor, inicia sesión nuevamente.'
        })
      }
      return res.status(403).json({ message: 'Token inválido.' })
    }

    req.user = user
    console.log('Usuario autenticado:', user) // Log para ver los datos del usuario autenticado
    next()
  })
}

// Middleware para verificar si el usuario es organizador o administrador
exports.organizerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'No estás autenticado.' })
  }

  // Permitir acceso a usuarios con rol de 'organizer' o 'admin'
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'No tienes permisos para acceder a esta ruta.' })
  }

  console.log('Usuario con permisos:', req.user) // Log para verificar el usuario con permisos
  next()
}
