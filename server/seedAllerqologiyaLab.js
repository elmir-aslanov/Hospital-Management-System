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
  { name: 'H1 Ev tozu', serviceCode: 'LAB-14-016', price: 26, slug: 'h1-ev-tozu' },
  {
    name: 'Fox Qida Həssaslığı Testi', serviceCode: 'LAB-14-008', price: 442,
    slug: 'fox-qida-hessasligi-testi',
    detail: {
      shortDescription:
        'Qida antigenlərinə qarşı IgG cavabını qiymətləndirən laborator immunoanaliz müayinəsi.',

      aboutIntro:
        'Fox Qida Həssaslığı Testi müxtəlif qida antigenlərinə qarşı yaranan spesifik IgG ' +
        'anticisimlərinin səviyyəsini laborator şəraitdə qiymətləndirən immunoanaliz müayinəsidir. ' +
        'Müayinə pasiyentin şikayətləri və qidalanma tarixçəsi ilə birlikdə həkimə əlavə məlumat təqdim edə bilər.',
      aboutFeatures: [
        'Müxtəlif qida qruplarına aid antigenlərə qarşı IgG cavabları qiymətləndirilir.',
        'Reaksiya səviyyələri laborator hesabatda kateqoriyalar üzrə göstərilir.',
        'Nəticələr həkim və ya dietoloq tərəfindən digər klinik məlumatlarla birlikdə şərh olunur.',
      ],
      benefits: [
        'Çoxsaylı qida antigenlərinin bir müayinə daxilində qiymətləndirilməsi',
        'Nəticələrin aydın və strukturlaşdırılmış hesabatda təqdim olunması',
        'Fərdi qidalanma yanaşmasının planlaşdırılmasına əlavə məlumat verməsi',
      ],
      procedureSteps: [
        'Venoz qandan serum nümunəsi götürülür.',
        'Nümunə nano-bead əsaslı immunoanaliz üsulu ilə işlənir.',
        'Nəticə 2 iş günü ərzində hazırlanır.',
        'Xüsusi hazırlıq tələb olunmur.',
      ],
      medicalNotice:
        'Bu test qida allergiyası və ya qida intoleransı üçün təkbaşına diaqnostik vasitə deyil. ' +
        'Nəticələr simptomlar, tibbi tarixçə və həkim müayinəsi ilə birlikdə qiymətləndirilməlidir. ' +
        'Nəfəs darlığı, dodaq və boğazda şişkinlik və ya kəskin allergik reaksiya zamanı təcili tibbi yardıma müraciət edin.',

      technicalDetails: {
        department:        'Allerqologiya',
        method:             'Nano-bead əsaslı immunoanaliz',
        transport:          'Soyuq zəncir qorunmaqla, şaquli vəziyyətdə',
        turnaround:         '2 iş günü',
        sampleVolume:       '300 mkl',
        sampleType:         'Serum',
        rejectionCriteria:  'Hemolizli, lipemik və uyğun olmayan nümunələr',
        synonyms:           'FOX testi, Food Explorer',
        preparation:        'Xüsusi hazırlıq tələb olunmur',
        tube:               'Sarı qapaqlı serum tübü',
      },

      referenceRange: {
        mainText:
          'Reaksiya səviyyələri laboratoriyanın istifadə etdiyi metod və hesablama sisteminə uyğun ' +
          'olaraq nəticə sənədində göstərilir.',
        categories: ['Normal', 'Aşağı', 'Orta', 'Yüksək'],
        notice:
          'Bu kateqoriyalar klinik diaqnoz hesab edilmir. Hər hansı qidanın rasiondan çıxarılması ' +
          'yalnız həkim və ya dietoloq məsləhəti ilə aparılmalıdır.',
      },

      homeServiceAvailable: true,
      homeServiceDescription:
        'Laborator müayinəsi üçün nümunənin ünvanınızda götürülməsini sifariş edə bilərsiniz. ' +
        'Aslan Medical Center-in mobil tibbi xidmət komandası uyğun ünvan və vaxt üzrə sizinlə əlaqə saxlayacaq.',
    },
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

  /* ── Upsert the two tests, keyed by serviceCode ───────────────────────── */
  const keepCodes = TESTS.map(t => t.serviceCode);

  for (const test of TESTS) {
    const set = {
      name:        test.name,
      serviceName: SERVICE.name,
      serviceCode: test.serviceCode,
      category:    'lab',
      price:       test.price,
      currency:    'AZN',
      serviceSlug: SERVICE.slug,
      serviceId:   svc._id,
      isActive:    true,
      slug:        test.slug,
    };
    if (test.detail) {
      set.shortDescription       = test.detail.shortDescription;
      set.aboutIntro              = test.detail.aboutIntro;
      set.aboutFeatures           = test.detail.aboutFeatures;
      set.benefits                = test.detail.benefits;
      set.procedureSteps          = test.detail.procedureSteps;
      set.medicalNotice           = test.detail.medicalNotice;
      set.technicalDetails        = test.detail.technicalDetails;
      set.referenceRange          = test.detail.referenceRange;
      set.homeServiceAvailable    = test.detail.homeServiceAvailable;
      set.homeServiceDescription  = test.detail.homeServiceDescription;
    }

    const doc = await PriceList.findOneAndUpdate(
      { serviceCode: test.serviceCode },
      { $set: set },
      { upsert: true, new: true, runValidators: true },
    );
    console.log(`  🧪  Test: "${doc.name}"  (${doc.serviceCode})  ${doc.price} AZN  slug=${doc.slug}`);
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
