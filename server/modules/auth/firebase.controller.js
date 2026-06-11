import { createRequire } from 'module';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError     from '../../utils/ApiError.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import User         from '../../models/User.model.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';
import { getRefreshCookieOptions } from './auth.cookies.js';

const require = createRequire(import.meta.url);

// Lazy-initialize Firebase Admin only when service account exists
let adminAuth = null;

function getAdminAuth() {
  if (adminAuth) return adminAuth;

  let serviceAccount;
  try {
    serviceAccount = require('../../firebase-service-account.json');
  } catch {
    throw new ApiError(503, 'Firebase Admin konfiqurasiya edilməyib. server/firebase-service-account.json faylını əlavə edin.');
  }

  // Dynamic import workaround for firebase-admin in ES modules
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin initialized ✅');
  }
  adminAuth = admin.auth();
  return adminAuth;
}

// POST /api/v1/auth/firebase-phone-login
export const firebasePhoneLoginHandler = asyncHandler(async (req, res) => {
  const { firebaseToken } = req.body;
  if (!firebaseToken) throw new ApiError(400, 'Firebase token tələb olunur.');

  const firebaseAdminAuth = getAdminAuth();
  const decoded = await firebaseAdminAuth.verifyIdToken(firebaseToken);

  if (!decoded.phone_number) {
    throw new ApiError(401, 'Telefon nömrəsi Firebase tərəfindən doğrulanmadı.');
  }

  const phone = decoded.phone_number;

  let user = await User.findOne({ phone, role: 'PATIENT' });

  if (!user) {
    const placeholderEmail = `firebase_${phone.replace('+', '')}@aslanmedical.internal`;
    user = new User({
      fullName: 'Pasiyent',
      email:    placeholderEmail,
      password: phone + Date.now().toString() + Math.random().toString(36),
      role:     'PATIENT',
      phone,
      isActive: true,
    });
    await user.save({ validateBeforeSave: false });
  }

  if (!user.isActive) throw new ApiError(403, 'Hesab deaktiv edilib.');

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .cookie('refreshToken', refreshToken, getRefreshCookieOptions())
    .status(200)
    .json(new ApiResponse(200, {
      accessToken,
      user: {
        id:       user._id,
        fullName: user.fullName,
        phone:    user.phone,
        role:     user.role,
      },
    }, 'Giriş uğurlu.'));
});
