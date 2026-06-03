const messages = {
  az: {
    NOT_FOUND:            'Tapılmadı',
    UNAUTHORIZED:         'Giriş icazəsi yoxdur',
    FORBIDDEN:            'Bu əməliyyat üçün icazəniz yoxdur',
    VALIDATION_ERROR:     'Məlumatlar düzgün deyil',
    EMAIL_EXISTS:         'Bu e-poçt artıq qeydiyyatdadır',
    INVALID_CREDENTIALS:  'E-poçt və ya şifrə yanlışdır',
    OTP_EXPIRED:          'OTP müddəti bitib',
    OTP_INVALID:          'OTP yanlışdır',
    SERVER_ERROR:         'Server xətası',
    PATIENT_NOT_FOUND:    'Pasiyent tapılmadı',
    DOCTOR_NOT_FOUND:     'Həkim tapılmadı',
    APPOINTMENT_CONFLICT: 'Bu vaxt artıq doludur',
    TOKEN_EXPIRED:        'Sessiya müddəti bitib, yenidən daxil olun',
  },
  en: {
    NOT_FOUND:            'Not found',
    UNAUTHORIZED:         'Unauthorized',
    FORBIDDEN:            'You do not have permission for this action',
    VALIDATION_ERROR:     'Invalid data',
    EMAIL_EXISTS:         'This email is already registered',
    INVALID_CREDENTIALS:  'Invalid email or password',
    OTP_EXPIRED:          'OTP has expired',
    OTP_INVALID:          'Invalid OTP',
    SERVER_ERROR:         'Server error',
    PATIENT_NOT_FOUND:    'Patient not found',
    DOCTOR_NOT_FOUND:     'Doctor not found',
    APPOINTMENT_CONFLICT: 'This time slot is already booked',
    TOKEN_EXPIRED:        'Session expired, please login again',
  },
  ru: {
    NOT_FOUND:            'Не найдено',
    UNAUTHORIZED:         'Нет доступа',
    FORBIDDEN:            'У вас нет прав для этого действия',
    VALIDATION_ERROR:     'Неверные данные',
    EMAIL_EXISTS:         'Этот email уже зарегистрирован',
    INVALID_CREDENTIALS:  'Неверный email или пароль',
    OTP_EXPIRED:          'OTP истёк',
    OTP_INVALID:          'Неверный OTP',
    SERVER_ERROR:         'Ошибка сервера',
    PATIENT_NOT_FOUND:    'Пациент не найден',
    DOCTOR_NOT_FOUND:     'Врач не найден',
    APPOINTMENT_CONFLICT: 'Это время уже занято',
    TOKEN_EXPIRED:        'Сессия истекла, войдите снова',
  },
}

export const t = (key, lang = 'az') => {
  return messages[lang]?.[key] || messages.az[key] || key
}

export const getLang = (req) => {
  const lang = req?.headers?.['accept-language']?.split(',')?.[0]?.split('-')?.[0]?.toLowerCase()
  return ['az', 'en', 'ru'].includes(lang) ? lang : 'az'
}
