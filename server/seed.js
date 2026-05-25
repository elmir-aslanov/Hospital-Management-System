import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

import User from './models/User.model.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    await User.deleteMany({})
    console.log('Users cleared')

    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@aslanmedical.az',
      password: 'Admin123!',
      role: 'ADMIN',
      isActive: true
    })

    console.log('')
    console.log('=== SEED TAMAMLANDI ===')
    console.log('Admin yaradıldı:')
    console.log('  Email:    admin@aslanmedical.az')
    console.log('  Şifrə:    Admin123!')
    console.log('  Rol:      ADMIN')
    console.log('  ID:      ', admin._id.toString())

  } catch (error) {
    console.error('Seed xətası:', error)
  } finally {
    await mongoose.connection.close()
    console.log('MongoDB bağlantısı bağlandı')
  }
}

seed()
