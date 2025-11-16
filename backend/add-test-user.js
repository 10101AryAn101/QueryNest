const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

const User = require('./src/models/User')

async function addTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' })
    if (existingUser) {
      console.log('Test user already exists!')
      await mongoose.disconnect()
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create new user
    const user = new User({
      email: 'test@example.com',
      passwordHash: hashedPassword
    })

    await user.save()
    console.log('Test user created successfully!')
    console.log('Email: test@example.com')
    console.log('Password: password123')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

addTestUser()
