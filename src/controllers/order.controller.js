import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Vendor from '../models/Vendor.js'

export const createOrder = async (req, res) => {
  try {
    const { vendorId, items, totalAmount, shippingAddress, phone, paymentMethod, notes } = req.body

    // Validate stock
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${item.name}` 
        })
      }
    }

    const vendor = await Vendor.findById(vendorId)

    const order = await Order.create({
      customerId: req.user.telegramId,
      customerName: req.user.firstName || req.user.username,
      customerUsername: req.user.username,
      vendorId,
      vendorName: vendor.storeName,
      vendorUsername: vendor.username,
      items: items.map(i => ({ ...i, image: i.image || '' })),
      totalAmount,
      shippingAddress,
      phone,
      paymentMethod,
      notes,
      timeline: [{ status: 'pending', note: 'Order placed' }]
    })

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, salesCount: item.quantity }
      })
    }

    // Update vendor stats
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: { totalOrders: 1, totalSales: totalAmount }
    })

    res.status(201).json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.telegramId })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [{ customerId: req.user.telegramId }, { vendorId: req.user.vendorId }]
    }).lean()

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getVendorOrders = async (req, res) => {
  try {
    if (!req.user.vendorId) {
      return res.status(403).json({ success: false, message: 'Not a vendor' })
    }
    const orders = await Order.find({ vendorId: req.user.vendorId })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.vendorId },
      { 
        status,
        $push: { timeline: { status, note: `Status updated to ${status}` } }
      },
      { new: true }
    )
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}