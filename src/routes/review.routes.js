import express from 'express'
import { createReview, getProductReviews } from '../controllers/review.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, createReview)
router.get('/product/:productId', getProductReviews)

export default router