import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number
})

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [{ type: String }],
  category: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: String,
  stock: { type: Number, default: 0 },
  variants: [variantSchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

productSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('Product', productSchema)