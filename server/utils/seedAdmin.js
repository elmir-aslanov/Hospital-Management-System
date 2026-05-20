import User   from '../models/User.model.js';
import logger  from './logger.js';

const ADMIN = {
  fullName: 'Aslan Admin',
  email:    'admin@aslanmedical.az',
  password: 'Admin@1234',
  role:     'SUPER_ADMIN',
};

export const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
      logger.info('Admin seed: already exists, skipped');
      return;
    }
    await User.create(ADMIN);
    logger.info(`Admin seed: created → ${ADMIN.email} / ${ADMIN.password}`);
  } catch (err) {
    logger.error(`Admin seed failed: ${err.message}`);
  }
};
