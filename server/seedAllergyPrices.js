/**
 * Idempotent seed — Allerqologiya PriceList records.
 * Run: node server/seedAllergyPrices.js
 * Safe to re-run: uses serviceCode as unique key, never deletes.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import PriceList from './models/PriceList.model.js';

const TESTS = [
  { name: 'H1 Ev tozu',                serviceCode: 'LAB-AL-001', price: 28, description: 'Dermatophagoides pteronyssinus (ev tozu gənəsi) allergeni.' },
  { name: 'H2 Ev tozu gənəsi',         serviceCode: 'LAB-AL-002', price: 28, description: 'Dermatophagoides farinae allergeni.' },
  { name: 'Fox Qida Həssaslığı Testi', serviceCode: 'LAB-AL-003', price: 85, description: 'ALEX2 panelinə əsaslanan genişləndirilmiş qida həssaslığı testi.' },
  { name: 'Food Intolerance',          serviceCode: 'LAB-AL-004', price: 75, description: 'IgG əsaslı qida dözümsüzlüyü paneli.' },
  { name: 'F9 Düyü',                   serviceCode: 'LAB-AL-005', price: 22, description: 'Düyü allergeni (Oryza sativa) spesifik IgE.' },
  { name: 'F13 Fıstıq',               serviceCode: 'LAB-AL-006', price: 22, description: 'Fıstıq (Arachis hypogaea) spesifik IgE.' },
  { name: 'E1 Pişik tükü',            serviceCode: 'LAB-AL-007', price: 24, description: 'Pişik epiteli allergeni spesifik IgE.' },
  { name: 'E5 It tükü',               serviceCode: 'LAB-AL-008', price: 24, description: 'It epiteli allergeni spesifik IgE.' },
  { name: 'G6 Çovdar çiçəyi tozu',    serviceCode: 'LAB-AL-009', price: 24, description: 'Çovdar otu (Timothy grass) çiçəyi tozu IgE.' },
  { name: 'Ümumi IgE',                serviceCode: 'LAB-AL-010', price: 18, description: 'Serumdakı ümumi immunoglobulin E səviyyəsinin ölçülməsi.' },
  { name: 'Ari zəhəri allergeni',     serviceCode: 'LAB-AL-011', price: 32, description: 'Apis mellifera (bal arısı) zəhəri spesifik IgE.' },
  { name: 'Lateks allergeni',         serviceCode: 'LAB-AL-012', price: 30, description: 'Təbii lateks (Hevea brasiliensis) spesifik IgE.' },
];

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected\n');

    let created = 0, skipped = 0;

    for (const t of TESTS) {
      const existing = await PriceList.findOne({ serviceCode: t.serviceCode });
      if (existing) {
        // Update serviceSlug if missing
        if (!existing.serviceSlug) {
          await PriceList.updateOne({ _id: existing._id }, { $set: { serviceSlug: 'allerqologiya' } });
          console.log(`  🔗 Linked:   ${t.name}`);
        } else {
          console.log(`  ⏭  Exists:   ${t.name}`);
        }
        skipped++;
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

    console.log(`\n✅ Done — ${created} created, ${skipped} already existed.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
