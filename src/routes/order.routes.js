import express from 'express'
import { createOrder, getMyOrders, getOrder, getVendorOrders, updateOrderStatus } from '../controllers/order.controller.js'
import { verifyToken, requireVendor } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, createOrder)
router.get('/my', verifyToken, getMyOrders)
router.get('/vendor', verifyToken, requireVendor, getVendorOrders)
router.get('/:id', verifyToken, getOrder)
router.patch('/:id/status', verifyToken, requireVendor, updateOrderStatus)

export default router