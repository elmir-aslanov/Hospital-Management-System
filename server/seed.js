import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

import User from './models/User.model.js'

const seed = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    const adminFullName = process.env.SEED_ADMIN_FULL_NAME || 'Admin'

    if (!adminEmail || !adminPassword) {
      console.log('Seed skipped: SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set')
      return
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    await User.deleteMany({})
    console.log('Users cleared')

    const admin = await User.create({
      fullName: adminFullName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      isActive: true
    })

    console.log('')
    console.log('=== SEED COMPLETED ===')
    console.log('Admin created:')
    console.log(`  Email:    ${adminEmail}`)
    console.log('  Password: [hidden]')
    console.log('  Role:     ADMIN')
    console.log('  ID:      ', admin._id.toString())

  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
  }
}

seed()
