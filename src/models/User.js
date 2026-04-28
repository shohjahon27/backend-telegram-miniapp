import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  photoUrl: String,
  phoneNumber: String,
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema)