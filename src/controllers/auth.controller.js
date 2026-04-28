import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import { validateTelegramData } from '../utils/telegram.js'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

export const telegramAuth = async (req, res) => {
  try {
    const { initData, user } = req.body

    // Validate Telegram data
    let validatedUser = null
    if (initData) {
      validatedUser = validateTelegramData(initData)
    }

    // Fallback to provided user data for development
    const telegramUser = validatedUser || user
    if (!telegramUser?.id) {
      return res.status(400).json({ success: false, message: 'Invalid user data' })
    }

    let dbUser = await User.findOne({ telegramId: String(telegramUser.id) })

    if (!dbUser) {
      dbUser = await User.create({
        telegramId: String(telegramUser.id),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        phoneNumber: telegramUser.phone_number
      })
    } else {
      // Update user info
      dbUser.username = telegramUser.username || dbUser.username
      dbUser.firstName = telegramUser.first_name || dbUser.firstName
      dbUser.lastName = telegramUser.last_name || dbUser.lastName
      dbUser.photoUrl = telegramUser.photo_url || dbUser.photoUrl
      await dbUser.save()
    }

    // Check if user is admin
    const adminId = process.env.ADMIN_TELEGRAM_ID
    if (adminId && String(telegramUser.id) === adminId && dbUser.role !== 'admin') {
      dbUser.role = 'admin'
      await dbUser.save()
    }

    const token = generateToken(dbUser._id)

    res.json({
      success: true,
      token,
      user: {
        id: dbUser._id,
        telegramId: dbUser.telegramId,
        username: dbUser.username,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        photoUrl: dbUser.photoUrl,
        role: dbUser.role,
        vendorId: dbUser.vendorId
      }
    })
  } catch (err) {
    console.error('Auth error:', err)
    res.status(500).json({ success: false, message: 'Authentication failed' })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('vendorId')
    res.json({
      success: true,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        role: user.role,
        vendorId: user.vendorId
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}