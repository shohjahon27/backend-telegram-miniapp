import express from 'express'
import { getProducts, getProduct, getVendorProducts, createProduct, updateProduct, deleteProduct, searchProducts } from '../controllers/product.controller.js'
import { verifyToken, requireVendor } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/search', searchProducts)
router.get('/vendor/:vendorId', getVendorProducts)
router.get('/:id', getProduct)
router.post('/', verifyToken, requireVendor, createProduct)
router.patch('/:id', verifyToken, requireVendor, updateProduct)
router.delete('/:id', verifyToken, requireVendor, deleteProduct)

export default router