const AUTH_STORAGE_KEYS = [
  'token',
  'user',
  'adminToken',
  'adminUser',
  'doctorToken',
  'doctorUser',
  'refreshToken',
];

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  window.dispatchEvent(new Event('storage'));
}

export function saveAccessSession(accessToken, user) {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('storage'));
}
