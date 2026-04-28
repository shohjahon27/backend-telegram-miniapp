import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: '📦' },
  description: String,
  image: String,
  productCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
})

export default mongoose.model('Category', categorySchema)