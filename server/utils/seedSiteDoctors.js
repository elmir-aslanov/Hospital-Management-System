import SiteDoctor from '../models/SiteDoctor.model.js';
import logger     from './logger.js';

const DOCTORS = [
  {
    name:       'Dr. Elmir Aslanov',
    specialty:  'Kardioloq',
    department: 'Kardiologiya',
    experience: 12,
    bio:        'Ürək-damar xəstəliklərinin diaqnostika və müalicəsi sahəsində 12 illik təcrübəyə malik mütəxəssis həkim.',
    image:      '',
    order:      1,
  },
  {
    name:       'Dr. Leyla Məmmədova',
    specialty:  'Nevroloq',
    department: 'Nevrologiya',
    experience: 9,
    bio:        'Sinir sistemi xəstəliklərinin müalicəsi üzrə ixtisaslaşmış, beynəlxalq sertifikatlı həkim.',
    image:      '',
    order:      2,
  },
  {
    name:       'Dr. Aysel Əliyeva',
    specialty:  'Pediatr',
    department: 'Pediatriya',
    experience: 7,
    bio:        'Uşaq sağlamlığı və inkişafı sahəsində dərin bilik və fərdi yanaşma ilə xidmət göstərən həkim.',
    image:      '',
    order:      3,
  },
  {
    name:       'Dr. Murad Hüseynov',
    specialty:  'Cərrah',
    department: 'Cərrahiyyə',
    experience: 15,
    bio:        'Laparoskopik və ümumi cərrahiyyə sahəsinin aparıcı mütəxəssisi, 15 illik klinik təcrübə.',
    image:      '',
    order:      4,
  },
];

export const seedSiteDoctors = async () => {
  try {
    // Remove duplicate records that may have been inserted during concurrent restarts
    for (const doc of DOCTORS) {
      const existing = await SiteDoctor.find({ name: doc.name, specialty: doc.specialty });
      if (existing.length > 1) {
        // Keep the first, delete the rest
        const [, ...dupes] = existing.map(d => d._id);
        await SiteDoctor.deleteMany({ _id: { $in: dupes } });
      }
    }
    // Upsert each seed record — safe to run on every startup
    for (const doc of DOCTORS) {
      await SiteDoctor.findOneAndUpdate(
        { name: doc.name, specialty: doc.specialty },
        { $setOnInsert: doc },
        { upsert: true },
      );
    }
    logger.info('SiteDoctor seed: done');
  } catch (err) {
    logger.error(`SiteDoctor seed failed: ${err.message}`);
  }
};
