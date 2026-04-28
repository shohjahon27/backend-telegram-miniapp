import Category from '../models/Category.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ order: 1 }).lean()
    res.json({ success: true, categories })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    res.status(201).json({ success: true, category })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const seedCategories = async (req, res) => {
  try {
    const defaults = [
      { name: 'Electronics', icon: '💻', description: 'Gadgets and devices' },
      { name: 'Fashion', icon: '👕', description: 'Clothing and accessories' },
      { name: 'Home', icon: '🏠', description: 'Home and living' },
      { name: 'Beauty', icon: '💄', description: 'Beauty and personal care' },
      { name: 'Sports', icon: '⚽', description: 'Sports and outdoors' },
      { name: 'Books', icon: '📚', description: 'Books and media' },
      { name: 'Food', icon: '🍕', description: 'Food and beverages' },
      { name: 'Toys', icon: '🧸', description: 'Toys and games' }
    ]

    await Category.deleteMany({})
    await Category.insertMany(defaults)
    res.json({ success: true, message: 'Categories seeded' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}