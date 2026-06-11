const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const VALID_SAME_SITE = new Set(['strict', 'lax', 'none']);

function getSameSite() {
  const configured = process.env.COOKIE_SAMESITE?.toLowerCase();
  if (VALID_SAME_SITE.has(configured)) return configured;
  return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: getSameSite(),
    maxAge: REFRESH_TOKEN_MAX_AGE,
  };
}

export function getClearRefreshCookieOptions() {
  const { maxAge, ...options } = getRefreshCookieOptions();
  return options;
}
