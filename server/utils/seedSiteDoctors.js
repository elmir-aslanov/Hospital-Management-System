import logger from './logger.js';

const DOCTORS = [];

export const seedSiteDoctors = async () => {
  if (DOCTORS.length === 0) {
    logger.info('SiteDoctor seed: skipped (using real Doctor data)');
    return;
  }
};
