/**
 * One-time script: deactivate 4 lab services, keep blood + biochemistry active.
 * Run: node server/deactivateServices.js   (from project root, inside server/ dir)
 * Safe to re-run (idempotent).
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service from './models/Service.model.js';

const DEACTIVATE_SLUGS = [
  'hormon-analizleri',
  'sidik-analizi',
  'immunoloji-testler',
  'vitamin-mineral-panel',
];

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    const result = await Service.updateMany(
      { slug: { $in: DEACTIVATE_SLUGS } },
      { $set: { isActive: false } }
    );
    console.log(`✅ Deactivated: ${result.modifiedCount} service(s)`);

    const active = await Service.find({ isActive: true }).select('name category').lean();
    console.log('\nCurrently active services:');
    active.forEach(s => console.log(`  ✅ ${s.name} (${s.category})`));
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
