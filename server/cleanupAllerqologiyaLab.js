/**
 * One-shot cleanup — keeps ONLY the 4 specified Allerqologiya records active.
 * Other records are retained for audit history and marked inactive.
 *
 * Run once from the project root:
 *   cd server && node ../server/cleanupAllerqologiyaLab.js
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import PriceList from './models/PriceList.model.js';

const KEEP_CODES = ['LAB-14-016', 'LAB-14-008', 'LAB-14-005', 'LAB-14-025'];

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) { console.error('❌  MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('✅  MongoDB connected\n');

  const result = await PriceList.updateMany({
    serviceSlug: 'allerqologiya',
    serviceCode: { $nin: KEEP_CODES },
    isActive: true,
  }, {
    $set: { isActive: false },
  });

  console.log(`Deactivated ${result.modifiedCount} unwanted record(s).\n`);

  const remaining = await PriceList.find({
    serviceSlug: 'allerqologiya',
    isActive: true,
  })
    .select('name serviceCode price isActive')
    .lean();

  console.log(`Active allerqologiya records (${remaining.length}):`);
  remaining.forEach(r =>
    console.log(`   ${r.isActive ? '✅' : '⚠️ '} ${r.name}  (${r.serviceCode})  ${r.price} AZN`),
  );

  if (remaining.length !== 4) {
    console.warn('\n⚠️   Expected 4 records. Run seedAllerqologiyaLab.js to create any missing ones.');
  } else {
    console.log('\n✅  Exactly 4 records — all good.');
  }

  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌  Cleanup failed:', err.message);
  process.exit(1);
});
