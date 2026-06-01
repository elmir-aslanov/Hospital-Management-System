import Setting from '../../models/Setting.model.js';

const DEFAULTS = {
  clinic_name:      { value: 'Aslan Medical Center',       group: 'clinic', label: 'Klinik adı' },
  clinic_address:   { value: 'Bakı, Azərbaycan',           group: 'clinic', label: 'Ünvan' },
  clinic_phone:     { value: '+994 50 836 36 94',           group: 'clinic', label: 'Telefon' },
  clinic_email:     { value: 'info@aslanmedical.az',        group: 'clinic', label: 'E-poçt' },
  clinic_website:   { value: 'https://aslanmedical.az',     group: 'clinic', label: 'Veb sayt' },
  work_hours:       { value: '08:00 - 20:00',               group: 'clinic', label: 'İş saatları' },
  social_twitter:   { value: 'https://twitter.com',           group: 'social', label: 'Twitter' },
  social_instagram: { value: 'https://instagram.com',         group: 'social', label: 'Instagram' },
  social_linkedin:  { value: 'https://linkedin.com',          group: 'social', label: 'LinkedIn' },
  social_facebook:  { value: 'https://facebook.com',          group: 'social', label: 'Facebook' },
  social_youtube:   { value: 'https://youtube.com',           group: 'social', label: 'YouTube' },
  social_whatsapp:  { value: 'https://wa.me/994508363694',    group: 'social', label: 'WhatsApp' },
};

export const getSettings = async (group) => {
  const filter = group ? { group } : {};
  const docs   = await Setting.find(filter);
  const result = {};

  for (const [key, def] of Object.entries(DEFAULTS)) {
    if (!group || def.group === group) {
      const found    = docs.find(d => d.key === key);
      result[key]    = found ? found.value : def.value;
    }
  }

  for (const doc of docs) {
    if (!(doc.key in result)) result[doc.key] = doc.value;
  }

  return result;
};

export const updateSettings = async (updates) => {
  const ops = Object.entries(updates).map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: { $set: { key, value, group: DEFAULTS[key]?.group || 'general', label: DEFAULTS[key]?.label || key } },
      upsert: true,
    },
  }));
  if (ops.length) await Setting.bulkWrite(ops);
  return getSettings();
};
