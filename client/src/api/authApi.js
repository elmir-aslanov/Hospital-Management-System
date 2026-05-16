import api from './axios';

/**
 * Request an OTP code to be sent to the given phone or email.
 *
 * @param {{ phone?: string, email?: string, type: 'phone'|'email' }} payload
 * @returns {Promise<{ devCode?: string, expiresInSeconds: number }>}
 */
export const requestOtp = async (payload) => {
  const { data } = await api.post('/auth/request-otp', payload);
  // data.data contains { devCode?, expiresInSeconds }
  return data.data ?? {};
};

/**
 * Verify the OTP code submitted by the user.
 *
 * @param {{ phone?: string, email?: string, code: string, type: 'phone'|'email' }} payload
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export const verifyOtp = async (payload) => {
  const { data } = await api.post('/auth/verify-otp', payload);
  return data.data; // { accessToken, refreshToken, user }
};
