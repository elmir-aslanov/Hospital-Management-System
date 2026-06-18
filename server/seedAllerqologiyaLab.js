/**
 * Idempotent seed — Allerqologiya Service record.
 *
 * Run from the server/ directory:
 *   cd server && node ../server/seedAllerqologiyaLab.js
 *
 * Safe to re-run: preserves the direction without creating laboratory tests.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service from './models/Service.model.js';

/* ── 1. Allerqologiya Service record ─────────────────────────────────────── */
const SERVICE = {
  name:        'Allerqologiya',
  slug:        'allerqologiya',
  description: 'Allergenlərə qarşı immun cavabların analizi.',
  category:    'lab',
  order:       10,
  isActive:    true,
};

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) { console.error('❌  MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('✅  MongoDB connected\n');

  /* ── Upsert Service ───────────────────────────────────────────────────── */
  const svc = await Service.findOneAndUpdate(
    { slug: SERVICE.slug },
    { $set: SERVICE },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`  🗂  Service: "${svc.name}"  (id=${svc._id})\n`);

  console.log('✅  Done — direction preserved; tests are managed through the admin panel.');
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
