/**
 * Idempotent seed — Allerqologiya Service + its two active lab tests.
 *
 * Run from the server/ directory:
 *   cd server && node ../server/seedAllerqologiyaLab.js
 *
 * Safe to re-run: upserts by serviceCode (no duplicates), and deactivates
 * any other Allerqologiya PriceList record so only the two below stay active.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service   from './models/Service.model.js';
import PriceList from './models/PriceList.model.js';

/* ── 1. Allerqologiya Service record ─────────────────────────────────────── */
const SERVICE = {
  name:        'Allerqologiya',
  slug:        'allerqologiya',
  description: 'Allergenlərə qarşı immun cavabların analizi.',
  category:    'lab',
  order:       10,
  isActive:    true,
};

/* ── 2. The only two tests that should be active for this direction ──────── */
const TESTS = [
  { name: 'H1 Ev tozu',                  serviceCode: 'LAB-14-016', price: 26 },
  { name: 'Fox Qida Həssaslığı Testi',   serviceCode: 'LAB-14-008', price: 442 },
];

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

  /* ── Upsert the two tests, keyed by serviceCode ───────────────────────── */
  const keepCodes = TESTS.map(t => t.serviceCode);

  for (const test of TESTS) {
    const doc = await PriceList.findOneAndUpdate(
      { serviceCode: test.serviceCode },
      {
        $set: {
          name:        test.name,
          serviceName: SERVICE.name,
          serviceCode: test.serviceCode,
          category:    'lab',
          price:       test.price,
          currency:    'AZN',
          serviceSlug: SERVICE.slug,
          serviceId:   svc._id,
          isActive:    true,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    console.log(`  🧪  Test: "${doc.name}"  (${doc.serviceCode})  ${doc.price} AZN`);
  }

  /* ── Deactivate any other Allerqologiya test (no leftovers, no duplicates) */
  const deactivated = await PriceList.updateMany(
    { serviceSlug: SERVICE.slug, serviceCode: { $nin: keepCodes }, isActive: true },
    { $set: { isActive: false } },
  );
  if (deactivated.modifiedCount > 0) {
    console.log(`\n  🚫  Deactivated ${deactivated.modifiedCount} other Allerqologiya record(s).`);
  }

  console.log('\n✅  Done — exactly 2 active Allerqologiya tests.');
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
