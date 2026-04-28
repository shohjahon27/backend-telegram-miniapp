import Product from '../models/Product.js'
import Vendor from '../models/Vendor.js'

export const getProducts = async (req, res) => {
  try {
    const { q, category, vendorId, sort, minPrice, maxPrice, limit = 20, page = 1, featured, myProducts } = req.query

    const query = { active: true }

    if (q) query.$text = { $search: q }
    if (category) query.category = category
    if (vendorId) query.vendorId = vendorId
    if (featured === 'true') query.featured = true
    if (myProducts === 'true' && req.user?.vendorId) query.vendorId = req.user.vendorId
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    let sortOption = {}
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break
      case 'price_desc': sortOption = { price: -1 }; break
      case 'newest': sortOption = { createdAt: -1 }; break
      case 'rating': sortOption = { rating: -1 }; break
      default: sortOption = { featured: -1, createdAt: -1 }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(query)
    ])

    res.json({ success: true, products, total, pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId, active: true }).lean()
    res.json({ success: true, products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createProduct = async (req, res) => {
  try {
    if (!req.user.vendorId) {
      return res.status(403).json({ success: false, message: 'Not a vendor' })
    }

    const vendor = await Vendor.findById(req.user.vendorId)
    const product = await Product.create({
      ...req.body,
      vendorId: req.user.vendorId,
      vendorName: vendor.storeName
    })

    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user.vendorId },
      req.body,
      { new: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user.vendorId
    })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query
    const products = await Product.find(
      { $text: { $search: q }, active: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20).lean()

    res.json({ success: true, products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}