import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

import User from './models/User.model.js'
import Doctor from './models/Doctor.model.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    await User.deleteMany({})
    await Doctor.deleteMany({})
    console.log('Users and doctors cleared')

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@hms.com',
      password: 'Admin123!',
      role: 'ADMIN',
      phone: '+994501000001',
      isActive: true
    })

    console.log('')
    console.log('=== SEED TAMAMLANDI ===')
    console.log('Admin yaradıldı:')
    console.log('  Email:    admin@hms.com')
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
