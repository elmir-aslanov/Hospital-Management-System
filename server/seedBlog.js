// ⚠️  DEVELOPMENT ONLY — migrates the static blog posts (client/src/data/blogData.js)
// into the Blog collection, preserving slugs and local /public image paths.
import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

import Blog from './models/Blog.model.js'
import { blogPosts } from '../client/src/data/blogData.js'

if (process.env.NODE_ENV === 'production') {
  console.error('❌ SEED REJECTED: Cannot run seed in production environment.')
  process.exit(1)
}

// Maps the static post categories to the 12-category catalog used on the public blog page.
const CATEGORY_MAP = {
  'Laboratoriya': 'ilkin-tibbi-yardim',
  'Kardiologiya': 'urek-saglamligi',
  'Profilaktika': 'ilkin-tibbi-yardim',
  'Endokrinologiya': 'saglam-yasam',
  'Pediatriya': 'usaq-saglamligi',
  'Ginekologiya': 'qadin-saglamligi',
  'Dermatologiya': 'deri-baximi-ve-gozellik',
  'Qadın sağlamlığı': 'qadin-saglamligi',
  'Sağlam həyat': 'saglam-yasam',
  'Xərçəng Profilaktikası': 'ilkin-tibbi-yardim',
  'Sidik-Cinsiyyət Sağlamlığı': 'kisi-saglamligi',
  'Kişi Sağlamlığı': 'kisi-saglamligi',
}

const bodyToHtml = (body = []) => body.map(section => {
  let html = ''
  if (section.heading) html += `<h2>${section.heading}</h2>`
  if (section.paragraphs) html += section.paragraphs.map(p => `<p>${p}</p>`).join('')
  if (section.bullets) html += `<ul>${section.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
  return html
}).join('')

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  console.log('MongoDB connected')

  let created = 0, skipped = 0
  for (const post of blogPosts) {
    const exists = await Blog.findOne({ slug: post.slug })
    if (exists) { skipped++; continue }

    await Blog.create({
      title: post.title,
      slug: post.slug,
      content: bodyToHtml(post.body),
      excerpt: post.excerpt,
      coverImage: post.image,
      category: CATEGORY_MAP[post.category] || 'saglam-yasam',
      author: post.author || 'Aslan Medical Center',
      readTime: parseInt(post.readTime, 10) || undefined,
      status: 'published',
      publishedAt: new Date(post.publishedAt),
      views: post.views || 0,
    })
    created++
    console.log(`Seeded: ${post.slug}`)
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already existed).`)
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
