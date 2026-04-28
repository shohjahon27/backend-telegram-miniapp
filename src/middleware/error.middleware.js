export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ success: false, message: 'Validation Error', errors: messages })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' })
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value' })
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
}