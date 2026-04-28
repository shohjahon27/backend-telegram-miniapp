import crypto from 'crypto'

export const validateTelegramData = (initData) => {
  if (!initData) return null

  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('
')

    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest()

    const checkHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (checkHash !== hash) {
      return null
    }

    const userData = params.get('user')
    if (!userData) return null

    return JSON.parse(userData)
  } catch (err) {
    console.error('Telegram validation error:', err)
    return null
  }
}