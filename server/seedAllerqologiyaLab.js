/**
 * Idempotent seed — Allerqologiya Service + 4 PriceList records.
 *
 * Run from the server/ directory:
 *   cd server && node ../server/seedAllerqologiyaLab.js
 *
 * Safe to re-run: upserts approved records and deactivates obsolete ones.
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

/* ── 2. PriceList records ────────────────────────────────────────────────── */
const TESTS = [
  {
    name:        'H1 Ev tozu',
    serviceCode: 'LAB-14-016',
    price:       26,
    description: 'Dermatophagoides pteronyssinus (ev tozu gənəsi) allergeni spesifik IgE.',
  },
  {
    name:        'Fox Qida Həssaslığı Testi',
    serviceCode: 'LAB-14-008',
    price:       442,
    description: 'ALEX2 panelinə əsaslanan genişləndirilmiş qida həssaslığı testi.',
  },
  {
    name:        'Food Intolerance (Qida həssaslığı)',
    serviceCode: 'LAB-14-005',
    price:       320,
    description: 'IgG əsaslı qida dözümsüzlüyü paneli.',
  },
  {
    name:        'F9 Düyü',
    serviceCode: 'LAB-14-025',
    price:       26,
    description: 'Düyü allergeni (Oryza sativa) spesifik IgE.',
  },
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

  /* ── Upsert PriceList records ─────────────────────────────────────────── */
  let created = 0, updated = 0;

  for (const t of TESTS) {
    const payload = {
      ...t,
      category:    'lab',
      currency:    'AZN',
      serviceSlug: SERVICE.slug,
      serviceId:   svc._id,
      isActive:    true,
    };

    const existing = await PriceList.findOne({ serviceCode: t.serviceCode });

    if (existing) {
      await PriceList.updateOne({ _id: existing._id }, { $set: payload });
      console.log(`  ✏️   Updated: ${t.name}  (${t.serviceCode})`);
      updated++;
    } else {
      await PriceList.create(payload);
      console.log(`  ➕  Created: ${t.name}  (${t.serviceCode})`);
      created++;
    }
  }

  const approvedCodes = TESTS.map(test => test.serviceCode);
  const deactivated = await PriceList.updateMany(
    {
      serviceSlug: SERVICE.slug,
      serviceCode: { $nin: approvedCodes },
      isActive: true,
    },
    { $set: { isActive: false } },
  );

  const activeRecords = await PriceList.find({
    serviceSlug: SERVICE.slug,
    isActive: true,
  })
    .select('name serviceCode price')
    .sort({ serviceCode: 1 })
    .lean();

  if (activeRecords.length !== TESTS.length) {
    throw new Error(`Expected ${TESTS.length} active records, found ${activeRecords.length}`);
  }

  console.log(`\n  Deactivated: ${deactivated.modifiedCount} obsolete record(s).`);
  console.log(`✅  Done — ${created} created, ${updated} updated, ${activeRecords.length} active.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
