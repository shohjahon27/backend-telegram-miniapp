import Vendor from '../models/Vendor.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'

export const getVendors = async (req, res) => {
  try {
    const { status, limit = 20 } = req.query
    const query = status ? { status } : { status: 'approved' }

    const vendors = await Vendor.find(query).limit(Number(limit)).lean()
    res.json({ success: true, vendors })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean()
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })
    res.json({ success: true, vendor })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createVendor = async (req, res) => {
  try {
    const existing = await Vendor.findOne({ ownerId: req.user.telegramId })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vendor application already exists' })
    }

    const vendor = await Vendor.create({
      ...req.body,
      ownerId: req.user.telegramId,
      username: req.user.username
    })

    res.status(201).json({ success: true, vendor })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getVendorStats = async (req, res) => {
  try {
    if (!req.user.vendorId) {
      return res.status(403).json({ success: false, message: 'Not a vendor' })
    }

    const [totalSales, totalOrders, totalProducts, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { vendorId: req.user.vendorId, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ vendorId: req.user.vendorId }),
      Product.countDocuments({ vendorId: req.user.vendorId }),
      Order.find({ vendorId: req.user.vendorId }).sort({ createdAt: -1 }).limit(5).lean()
    ])

    res.json({
      success: true,
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalCustomers: 0,
      recentOrders
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { ownerId: req.user.telegramId },
      req.body,
      { new: true }
    )
    res.json({ success: true, vendor })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}