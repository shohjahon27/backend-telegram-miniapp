import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  username: String,
  storeName: { type: String, required: true },
  description: String,
  logo: { type: String, default: 'https://via.placeholder.com/150' },
  banner: String,
  location: String,
  phone: String,
  email: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  rejectionReason: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Vendor', vendorSchema)