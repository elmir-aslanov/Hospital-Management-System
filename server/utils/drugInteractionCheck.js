import Patient from '../models/Patient.model.js';

// Drug family mappings: if patient is allergic to the key, block all values
const DRUG_FAMILIES = {
  penicillin:     ['amoxicillin', 'ampicillin', 'penicillin', 'oxacillin', 'dicloxacillin', 'piperacillin'],
  sulfa:          ['sulfamethoxazole', 'trimethoprim', 'bactrim', 'sulfadiazine', 'sulfasalazine'],
  cephalosporin:  ['cephalexin', 'cefazolin', 'ceftriaxone', 'cefuroxime', 'cefdinir', 'cefepime'],
  nsaid:          ['ibuprofen', 'naproxen', 'aspirin', 'diclofenac', 'ketoprofen', 'meloxicam', 'celecoxib'],
};

const normalize = (str) => str.toLowerCase().trim();

/**
 * Check if any medication conflicts with the patient's known allergies.
 * @param {string} patientId - MongoDB ObjectId of the Patient document
 * @param {Array<{ name: string }>} medications
 * @returns {Promise<{ safe: boolean, conflicts: Array }>}
 */
const checkDrugAllergies = async (patientId, medications) => {
  const patient = await Patient.findById(patientId).select('allergies');
  if (!patient || !patient.allergies?.length) {
    return { safe: true, conflicts: [] };
  }

  const allergies = patient.allergies.map(normalize);
  const conflicts = [];

  for (const med of medications) {
    const medName = normalize(med.name);

    // Direct name match
    if (allergies.some((a) => medName.includes(a) || a.includes(medName))) {
      conflicts.push({ medication: med.name, allergyMatch: med.name });
      continue;
    }

    // Drug family match: check if patient's allergy maps to a drug family that includes this med
    let familyConflict = null;
    for (const [familyKey, familyMembers] of Object.entries(DRUG_FAMILIES)) {
      const medInFamily  = familyMembers.some((m) => medName.includes(m) || m.includes(medName));
      const allergyMatch = allergies.find((a) => a.includes(familyKey) || familyKey.includes(a) ||
        familyMembers.some((m) => a.includes(m) || m.includes(a)));

      if (medInFamily && allergyMatch) {
        familyConflict = { medication: med.name, allergyMatch: `${allergyMatch} (${familyKey} family)` };
        break;
      }
    }

    if (familyConflict) conflicts.push(familyConflict);
  }

  return { safe: conflicts.length === 0, conflicts };
};

export default checkDrugAllergies;

/**
 * Check for known drug-drug interactions.
 * Stub — returns no interactions. Extend with a real DB/API when available.
 * @param {string[]} drugNames
 * @returns {Promise<{ hasInteraction: boolean, details: string | null }>}
 */
export const checkDrugInteractions = async (drugNames) => {
  return { hasInteraction: false, details: null };
};
