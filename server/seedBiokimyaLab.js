/**
 * Idempotent seed — Biokimya PriceList test (VLCFA / yağ turşuları analizi).
 *
 * Run from the server/ directory:
 *   cd server && node ../server/seedBiokimyaLab.js
 *
 * Safe to re-run: upserts by serviceCode (no duplicates). The "Biokimya"
 * Service/direction itself is already seeded by seedLabDirections.js — this
 * script only adds/updates the test under it.
 */
import dns      from 'dns';
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Service   from './models/Service.model.js';
import PriceList from './models/PriceList.model.js';

const SERVICE_SLUG = 'biokimya';

const TEST = {
  name: 'Yağ turşuları (çox uzun zəncirli)',
  serviceCode: 'LAB-04-122',
  price: 185,
  slug: 'yag-tursulari-cox-uzun-zencirli',

  shortDescription:
    'Bu analiz qanda çox uzun zəncirli yağ turşularının səviyyəsinin qiymətləndirilməsi üçün istifadə olunur. ' +
    'Nəticələr orqanizmdə yağ turşularının metabolizmi barədə əlavə məlumat verir və həkim tərəfindən digər ' +
    'klinik göstəricilərlə birlikdə şərh edilir.',

  aboutIntro: 'Yağ turşularının analizi',
  aboutFeatures: [
    'Analiz haqqında: çox uzun zəncirli yağ turşularının (VLCFA) qanda səviyyəsi LC-MS/MS metodu ilə ölçülür.',
    'Analiz nə üçün istifadə olunur: orqanizmdə yağ turşusu metabolizmi ilə bağlı əlavə klinik məlumat verir.',
    'Analiz nə zaman təyin olunur: həkim tərəfindən müvafiq klinik şübhə və göstərişlər əsasında təyin olunur.',
  ],
  benefits: [],
  procedureSteps: [
    'Analizdən əvvəl ən azı 8 saat ac qalmaq tövsiyə olunur.',
    'Bu müddətdə qazsız su içmək mümkündür.',
    'Analizdən ən azı 30 dəqiqə əvvəl siqaret çəkməyin.',
    'Qəbul edilən dərmanlar barədə əvvəlcədən həkimə məlumat verin.',
    'Həkim göstərişi olmadan dərman qəbulunu dayandırmayın.',
  ],
  medicalNotice:
    'Analizin nəticəsi müstəqil diaqnoz hesab edilmir və həkim tərəfindən digər klinik məlumatlarla birlikdə ' +
    'qiymətləndirilməlidir.',

  technicalDetails: {
    department:        'Biokimya',
    method:             'LC-MS/MS',
    transport:          'Soyuq zəncir prinsipi qorunmaqla şaquli vəziyyətdə daşınmalıdır',
    turnaround:         '5 iş günü',
    sampleVolume:       '500 mkl',
    sampleType:         'Qan',
    rejectionCriteria:  'Hemolizli, lipemik və ikterik nümunələr',
    synonyms:           'VLCFA (Very Long Chain Fatty Acids)',
    preparation:        'Nümunə acqarına götürülməlidir',
    tube:               'Sarı qapaqlı tüb',
  },

  // Qualitative categories left empty — only the structured, parameter-level
  // referenceRanges below carry actual clinical numbers for this test.
  referenceRange: {
    mainText: '',
    categories: [],
    notice:
      'Referans intervalı parametr, yaş, cins və laboratoriya metoduna görə dəyişə bilər. Aşağıdakı dəyərlər ' +
      'yalnız bu laboratoriyanın istifadə etdiyi metoda aiddir.',
  },

  referenceRanges: [
    {
      parameterName: 'C26:0', ageGroup: 'Yetkin', gender: 'all', unit: 'µmol/L',
      minValue: '0.00', maxValue: '1.30', displayRange: '0.00–1.30', note: '',
    },
  ],

  resultParameterTemplate: [
    { parameterName: 'C26:0', unit: 'µmol/L', referenceRange: '0.00–1.30' },
  ],

  homeServiceAvailable: false,
  homeServiceDescription: '',
  selfRequestEnabled: true,
};

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) { console.error('❌  MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('✅  MongoDB connected\n');

  const svc = await Service.findOne({ slug: SERVICE_SLUG });
  if (!svc) {
    console.error(`❌  Service "${SERVICE_SLUG}" not found — run seedLabDirections.js first.`);
    process.exit(1);
  }
  console.log(`  🗂  Service: "${svc.name}"  (id=${svc._id})\n`);

  const doc = await PriceList.findOneAndUpdate(
    { serviceCode: TEST.serviceCode },
    {
      $set: {
        name:        TEST.name,
        serviceName: svc.name,
        serviceCode: TEST.serviceCode,
        category:    'lab',
        price:       TEST.price,
        currency:    'AZN',
        serviceSlug: SERVICE_SLUG,
        serviceId:   svc._id,
        isActive:    true,
        slug:        TEST.slug,
        shortDescription:        TEST.shortDescription,
        aboutIntro:               TEST.aboutIntro,
        aboutFeatures:            TEST.aboutFeatures,
        benefits:                 TEST.benefits,
        procedureSteps:           TEST.procedureSteps,
        medicalNotice:            TEST.medicalNotice,
        technicalDetails:         TEST.technicalDetails,
        referenceRange:           TEST.referenceRange,
        referenceRanges:          TEST.referenceRanges,
        resultParameterTemplate:  TEST.resultParameterTemplate,
        homeServiceAvailable:     TEST.homeServiceAvailable,
        homeServiceDescription:   TEST.homeServiceDescription,
        selfRequestEnabled:       TEST.selfRequestEnabled,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`  🧪  Test: "${doc.name}"  (${doc.serviceCode})  ${doc.price} AZN  slug=${doc.slug}`);

  console.log('\n✅  Done.');
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
