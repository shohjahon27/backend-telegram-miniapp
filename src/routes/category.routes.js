import express from 'express'
import { getCategories, createCategory, seedCategories } from '../controllers/category.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getCategories)
router.post('/', verifyToken, requireAdmin, createCategory)
router.post('/seed', seedCategories)

export default router