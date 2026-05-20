import SiteDoctor from '../models/SiteDoctor.model.js';
import logger     from './logger.js';

const DOCTORS = [
  {
    name:       'Prof. Dr. Rauf Əliyev',
    specialty:  'Kardioloq',
    department: 'Kardiologiya',
    experience: 22,
    bio:        'Ürək-damar cərrahiyyəsi və invaziv kardioloji sahəsinin tanınmış mütəxəssisi. Avropada ixtisasartırma keçirmiş, 2000-dən çox müvəffəqiyyətli əməliyyatın müəllifi.',
    image:      '',
    isActive:   true,
    order:      1,
  },
  {
    name:       'Dr. Könül Hüseynova',
    specialty:  'Nevroloq',
    department: 'Nevrologiya',
    experience: 14,
    bio:        'İnsult reabilitasiyası və epilepsiya müalicəsi sahəsində beynəlxalq sertifikatlı həkim. Alman Nevrologi Cəmiyyətinin üzvü.',
    image:      '',
    isActive:   true,
    order:      2,
  },
  {
    name:       'Dr. Aytən Quliyeva',
    specialty:  'Pediatr',
    department: 'Pediatriya',
    experience: 11,
    bio:        'Uşaq sağlamlığı, inkişaf pediatriyası və aşılama üzrə ixtisaslaşmış həkim. Valideynlərə uşaq qidalanması və inkişafı barədə məsləhətlər verir.',
    image:      '',
    isActive:   true,
    order:      3,
  },
  {
    name:       'Prof. Dr. Tural Məmmədov',
    specialty:  'Cərrah',
    department: 'Ümumi Cərrahiyyə',
    experience: 18,
    bio:        'Laparoskopik, robotic cərrahiyyə və onkoloji cərrahiyyə sahəsinin aparıcı mütəxəssisi. Türkiyə və Almaniyada ixtisaslaşma keçirmiş.',
    image:      '',
    isActive:   true,
    order:      4,
  },
  {
    name:       'Dr. Samirə Babayeva',
    specialty:  'Dermatoloq',
    department: 'Dermatologiya',
    experience: 9,
    bio:        'Dəri xəstəlikləri, kosmetik dermatoloji prosedurlar və lazer terapiyası sahəsinin gənc mütəxəssisi. Dermatoskopi üzrə sertifikatlı.',
    image:      '',
    isActive:   true,
    order:      5,
  },
  {
    name:       'Dr. Elnur Musayev',
    specialty:  'Ortoped',
    department: 'Ortopediya və Travmatologiya',
    experience: 13,
    bio:        'Oynaq protezi, onurğa cərrahiyyəsi və idman travmaları sahəsinin mütəxəssisi. Artroskopik əməliyyatlar üzrə geniş təcrübəyə malikdir.',
    image:      '',
    isActive:   true,
    order:      6,
  },
  {
    name:       'Dr. Nigar Əhmədova',
    specialty:  'Göz həkimi',
    department: 'Oftalmologiya',
    experience: 8,
    bio:        'LASIK, katarakta əməliyyatları və şəkərli diabet göz fəsadlarının müalicəsi sahəsini əhatə edir. Müasir cərrahi avadanlıqlarla işləyir.',
    image:      '',
    isActive:   true,
    order:      7,
  },
  {
    name:       'Prof. Dr. Kamran Rzayev',
    specialty:  'Kardioloq',
    department: 'Kardiologiya',
    experience: 27,
    bio:        'Ürək çatışmazlığı, aritmiya və koronar xəstəliklərin müalicəsinin tanınmış professoru. 100-dən çox beynəlxalq elmi məqalənin müəllifi.',
    image:      '',
    isActive:   true,
    order:      8,
  },
];

export const seedSiteDoctors = async () => {
  try {
    // Deduplicate on restart
    for (const doc of DOCTORS) {
      const existing = await SiteDoctor.find({ name: doc.name, specialty: doc.specialty });
      if (existing.length > 1) {
        const [, ...dupes] = existing.map(d => d._id);
        await SiteDoctor.deleteMany({ _id: { $in: dupes } });
      }
    }
    // Upsert — safe on every startup
    for (const doc of DOCTORS) {
      await SiteDoctor.findOneAndUpdate(
        { name: doc.name, specialty: doc.specialty },
        { $setOnInsert: doc },
        { upsert: true },
      );
    }
    logger.info(`SiteDoctor seed: ${DOCTORS.length} doctors upserted`);
  } catch (err) {
    logger.error(`SiteDoctor seed failed: ${err.message}`);
  }
};
