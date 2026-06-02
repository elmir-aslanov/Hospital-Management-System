import User   from '../models/User.model.js';
import logger  from './logger.js';

export const seedAdmin = async () => {
  try {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
      logger.info('Admin seed: SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set, skipped');
      return;
    }

    const ADMIN = {
      fullName: process.env.SEED_ADMIN_FULL_NAME || 'Aslan Admin',
      email,
      password,
      role:     'SUPER_ADMIN',
    };

    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
      logger.info('Admin seed: already exists, skipped');
      return;
    }
    await User.create(ADMIN);
    logger.info(`Admin seed: created -> ${ADMIN.email}`);
  } catch (err) {
    logger.error(`Admin seed failed: ${err.message}`);
  }
};
