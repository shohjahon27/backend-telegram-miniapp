import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

export const createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body

    // Verify user purchased the product
    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.telegramId,
      status: 'delivered',
      'items.productId': productId
    })

    if (!order) {
      return res.status(403).json({ success: false, message: 'Can only review delivered orders' })
    }

    const review = await Review.create({
      orderId,
      productId,
      userId: req.user.telegramId,
      userName: req.user.firstName || req.user.username,
      rating,
      comment
    })

    // Update product rating
    const reviews = await Review.find({ productId })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    })

    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}