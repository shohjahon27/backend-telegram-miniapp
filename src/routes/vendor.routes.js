import express from 'express'
import { getVendors, getVendor, createVendor, getVendorStats, updateVendor } from '../controllers/vendor.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getVendors)
router.get('/stats', verifyToken, getVendorStats)
router.get('/:id', getVendor)
router.post('/', verifyToken, createVendor)
router.patch('/', verifyToken, updateVendor)

export default router