import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './src/routes/auth.routes.js'
import productRoutes from './src/routes/product.routes.js'
import vendorRoutes from './src/routes/vendor.routes.js'
import orderRoutes from './src/routes/order.routes.js'
import reviewRoutes from './src/routes/review.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import categoryRoutes from './src/routes/category.routes.js'
import { errorHandler } from './src/middleware/error.middleware.js'

dotenv.config()

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' }
})
app.use('/api/', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/categories', categoryRoutes)

// Error handling
app.use(errorHandler)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

export default app