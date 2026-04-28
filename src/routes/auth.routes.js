import express from 'express'
import { telegramAuth, getMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/telegram', telegramAuth)
router.get('/me', verifyToken, getMe)

export default router