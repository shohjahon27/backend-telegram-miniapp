import express from 'express'
import { getDashboard, getVendors, approveVendor, rejectVendor, getTransactions } from '../controllers/admin.controller.js'
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(verifyToken, requireAdmin)

router.get('/dashboard', getDashboard)
router.get('/vendors', getVendors)
router.patch('/vendors/:id/approve', approveVendor)
router.patch('/vendors/:id/reject', rejectVendor)
router.get('/transactions', getTransactions)

export default router