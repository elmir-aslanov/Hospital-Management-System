/**
 * Idempotent seed script — laboratory services.
 * Run once manually:  node server/seedServices.js
 * Safe to re-run: uses updateOne + upsert, never deletes existing records.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service from './models/Service.model.js';

const SERVICES = [
  {
    name:           'Ümumi qan analizi',
    slug:           'umumi-qan-analizi',
    category:       'blood',
    iconKey:        'droplets',
    description:    'Eritrositlər, leykositlər, trombositlər və hemoglobin daxil olmaqla tam qan formulasının müayinəsi.',
    resultDuration: '1 iş günü',
    department:     'Laboratoriya',
    order:          1,
    isActive:       true,
  },
  {
    name:           'Biokimyəvi analizlər',
    slug:           'biokimyevi-analizler',
    category:       'biochemistry',
    iconKey:        'flask',
    description:    'Qaraciyər fermentləri, böyrək funksiyası, qlükoza, xolesterol və elektrolit göstəricilərinin qiymətləndirilməsi.',
    resultDuration: '1 iş günü',
    department:     'Laboratoriya',
    order:          2,
    isActive:       true,
  },
  {
    name:           'Hormon analizləri',
    slug:           'hormon-analizleri',
    category:       'hormones',
    iconKey:        'activity',
    description:    'Qalxanabənzər vəz hormonları (TSH, T3, T4), cinsi hormonlar, kortizol və insulin səviyyələrinin ölçülməsi.',
    resultDuration: '1-2 iş günü',
    department:     'Laboratoriya',
    order:          3,
    isActive:       true,
  },
  {
    name:           'Sidik analizi',
    slug:           'sidik-analizi',
    category:       'urine',
    iconKey:        'droplets',
    description:    'Ümumi sidik analizi: rəng, şəffaflıq, pH, zülal, qlükoza, eritrositlər və leykositlər.',
    resultDuration: '1 iş günü',
    department:     'Laboratoriya',
    order:          4,
    isActive:       true,
  },
  {
    name:           'İmmunoloji testlər',
    slug:           'immunoloji-testler',
    category:       'immunology',
    iconKey:        'syringe',
    description:    'Hepatit B/C, HİV, allergen IgE, autoimmun göstəricilər və infeksion serologiya müayinələri.',
    resultDuration: '1-3 iş günü',
    department:     'Laboratoriya',
    order:          5,
    isActive:       true,
  },
  {
    name:           'Vitamin və mineral paneli',
    slug:           'vitamin-mineral-panel',
    category:       'vitamins',
    iconKey:        'zap',
    description:    'D vitamini, B12, folat turşusu, dəmir, sink və maqnezium səviyyələrinin kompleks müayinəsi.',
    resultDuration: '1-2 iş günü',
    department:     'Laboratoriya',
    order:          6,
    isActive:       true,
  },
];

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    let created = 0;
    let skipped = 0;

    for (const svc of SERVICES) {
      const result = await Service.updateOne(
        { slug: svc.slug },
        { $setOnInsert: svc },
        { upsert: true }
      );
      if (result.upsertedCount > 0) {
        console.log(`  ➕ Created: ${svc.name}`);
        created++;
      } else {
        console.log(`  ⏭  Already exists: ${svc.name}`);
        skipped++;
      }
    }

    console.log(`\n✅ Done — ${created} created, ${skipped} skipped.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
