/**
 * Backward-compatible seed — approved Allerqologiya PriceList records.
 * Run: node server/seedAllergyPrices.js
 * Safe to re-run: upserts approved records and deactivates obsolete ones.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import PriceList from './models/PriceList.model.js';

const TESTS = [
  { name: 'H1 Ev tozu', serviceCode: 'LAB-14-016', price: 26, description: 'Dermatophagoides pteronyssinus (ev tozu gənəsi) allergeni spesifik IgE.' },
  { name: 'Fox Qida Həssaslığı Testi', serviceCode: 'LAB-14-008', price: 442, description: 'ALEX2 panelinə əsaslanan genişləndirilmiş qida həssaslığı testi.' },
  { name: 'Food Intolerance (Qida həssaslığı)', serviceCode: 'LAB-14-005', price: 320, description: 'IgG əsaslı qida dözümsüzlüyü paneli.' },
  { name: 'F9 Düyü', serviceCode: 'LAB-14-025', price: 26, description: 'Düyü allergeni (Oryza sativa) spesifik IgE.' },
];

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected\n');

    let created = 0, updated = 0;

    for (const t of TESTS) {
      const existing = await PriceList.findOne({ serviceCode: t.serviceCode });
      if (existing) {
        await PriceList.updateOne({ _id: existing._id }, {
          $set: {
            ...t,
            category: 'lab',
            currency: 'AZN',
            serviceSlug: 'allerqologiya',
            isActive: true,
          },
        });
        console.log(`  ✏️ Updated:  ${t.name}`);
        updated++;
        continue;
      }

      await PriceList.create({
        ...t,
        category:    'lab',
        currency:    'AZN',
        serviceSlug: 'allerqologiya',
        isActive:    true,
      });
      console.log(`  ➕ Created:  ${t.name}`);
      created++;
    }

    const approvedCodes = TESTS.map(test => test.serviceCode);
    const deactivated = await PriceList.updateMany({
      serviceSlug: 'allerqologiya',
      serviceCode: { $nin: approvedCodes },
      isActive: true,
    }, {
      $set: { isActive: false },
    });

    console.log(`\n✅ Done — ${created} created, ${updated} updated, ${deactivated.modifiedCount} deactivated.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
