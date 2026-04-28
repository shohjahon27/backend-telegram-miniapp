import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'

export const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalOrders, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ])

    res.json({
      success: true,
      totalUsers,
      totalVendors,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentActivity: [
        { icon: '🛒', message: 'New order received', time: '2 min ago' },
        { icon: '🏪', message: 'New vendor registered', time: '15 min ago' },
        { icon: '⭐', message: 'New review posted', time: '1 hour ago' }
      ]
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getVendors = async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    const vendors = await Vendor.find({ status }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, vendors })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    )
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })

    await User.findOneAndUpdate(
      { telegramId: vendor.ownerId },
      { role: 'vendor', vendorId: vendor._id }
    )

    res.json({ success: true, vendor })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    )
    res.json({ success: true, vendor })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getTransactions = async (req, res) => {
  try {
    // Placeholder - integrate with actual payment provider
    const transactions = [
      { _id: '1', type: 'income', amount: 150, description: 'Order #ORD000001', createdAt: new Date() },
      { _id: '2', type: 'income', amount: 89.99, description: 'Order #ORD000002', createdAt: new Date() },
      { _id: '3', type: 'expense', amount: 12, description: 'Platform fee', createdAt: new Date() }
    ]
    res.json({ success: true, transactions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}