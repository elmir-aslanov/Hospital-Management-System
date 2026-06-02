// ⚠️  DEVELOPMENT ONLY — Never run this in production.
// This file deletes all users and re-seeds the database.
import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

import User from './models/User.model.js'

if (process.env.NODE_ENV === 'production') {
  console.error('❌ SEED REJECTED: Cannot run seed in production environment.');
  process.exit(1);
}

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

    console.warn('⚠️  WARNING: About to delete all users. NODE_ENV =', process.env.NODE_ENV);
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
