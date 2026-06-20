/**
 * Idempotent seed — active laboratory direction service records.
 * Run: node server/seedLabDirections.js   (from inside server/ dir)
 * Safe to re-run: upserts approved directions and removes retired directions.
 * Also deactivates the two older generic lab records.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service from './models/Service.model.js';

const DEACTIVATE_SLUGS = [
  'umumi-qan-analizi',
  'biokimyevi-analizler',
];

const RETIRED_SLUGS = [
  'digital-patologiya',
  'derman-monitorinqi',
  'flow',
  'hematologiya',
];

const SERVICES = [
  {
    name:           'Allerqologiya',
    slug:           'allerqologiya',
    category:       'allergy',
    iconKey:        'molecule',
    description:    'Allergenlərə qarşı immun cavabların analizi.',
    resultDuration: '1-2 iş günü',
    department:     'Laboratoriya',
    order:          1,
    isActive:       true,
  },
  {
    name:           'Biokimya',
    slug:           'biokimya',
    category:       'biochemistry',
    iconKey:        'flask',
    description:    'Orqanizmin biokimyəvi göstəricilərinin qiymətləndirilməsi.',
    resultDuration: '1 iş günü',
    department:     'Laboratoriya',
    order:          2,
    isActive:       true,
  },
];

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected\n');

    const retired = await Service.deleteMany({ slug: { $in: RETIRED_SLUGS } });
    console.log(`🗑  Removed ${retired.deletedCount} retired direction record(s)\n`);

    // Deactivate old generic records
    const deact = await Service.updateMany(
      { slug: { $in: DEACTIVATE_SLUGS } },
      { $set: { isActive: false } }
    );
    console.log(`⏹  Deactivated ${deact.modifiedCount} old record(s)\n`);

    // Upsert approved lab direction records
    let created = 0;
    let skipped = 0;
    for (const svc of SERVICES) {
      const r = await Service.updateOne(
        { slug: svc.slug },
        { $setOnInsert: svc },
        { upsert: true }
      );
      if (r.upsertedCount > 0) { console.log(`  ➕ Created:  ${svc.name}`); created++; }
      else                      { console.log(`  ⏭  Exists:   ${svc.name}`); skipped++; }
    }

    console.log(`\n✅ Done — ${created} created, ${skipped} already existed.`);

    const active = await Service.find({ isActive: true }).sort({ order: 1 }).select('name category order').lean();
    console.log('\nActive services now:');
    active.forEach(s => console.log(`  [${s.order}] ${s.name} (${s.category})`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
