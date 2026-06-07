/**
 * Aslan Medical — unified toast/alert utility
 * Wraps sonner (already configured in App.jsx with richColors + closeButton).
 *
 * Usage:
 *   import { showSuccess, showError, showWarning, showInfo, getErrorMessage } from '../utils/alert'
 *
 *   showSuccess('Məlumatlar yadda saxlanıldı.')
 *   showError(getErrorMessage(err, 'Xəta baş verdi.'))
 *   showWarning('Bütün xanaları doldurun.')
 *   showInfo('Nəticə tapılmadı.')
 */
import { toast } from 'sonner'

const DEFAULTS = {
  success: { title: 'Uğurlu əməliyyat', duration: 4000 },
  error:   { title: 'Xəta baş verdi',   duration: 6000 },
  warning: { title: 'Diqqət',           duration: 5000 },
  info:    { title: 'Məlumat',           duration: 4500 },
}

/**
 * Generic alert — shows a titled toast with a description.
 * @param {{ type?: 'success'|'error'|'warning'|'info', title?: string, message: string, duration?: number }} opts
 */
export function showAlert({ type = 'info', title, message, duration } = {}) {
  const cfg  = DEFAULTS[type] || DEFAULTS.info
  const ttl  = title || cfg.title
  const opts = { description: message || undefined, duration: duration || cfg.duration }

  switch (type) {
    case 'success': toast.success(ttl, opts); break
    case 'error':   toast.error(ttl,   opts); break
    case 'warning': toast.warning(ttl, opts); break
    default:        toast.info(ttl,    opts); break
  }
}

/** Convenience wrappers — pass just the message (and optional title override). */
export const showSuccess = (message, title) => showAlert({ type: 'success', title, message })
export const showError   = (message, title) => showAlert({ type: 'error',   title, message })
export const showWarning = (message, title) => showAlert({ type: 'warning', title, message })
export const showInfo    = (message, title) => showAlert({ type: 'info',    title, message })

/**
 * Safely extracts a human-readable Azerbaijani error message from any error shape.
 *
 * Priority:
 *   error.response.data.message  (Axios/backend ApiError)
 *   error.response.data.error
 *   error.message                (unless it's a raw axios technical string)
 *   fallback
 *
 * @param {unknown} error
 * @param {string}  fallback
 * @returns {string}
 */
export function getErrorMessage(error, fallback = 'Əməliyyat zamanı xəta baş verdi.') {
  const serverMsg = error?.response?.data?.message || error?.response?.data?.error
  if (serverMsg) return serverMsg

  const clientMsg = error?.message
  // Skip raw Axios technical messages like "Request failed with status code 404"
  if (clientMsg && !/request failed|network error|timeout/i.test(clientMsg)) {
    return clientMsg
  }

  return fallback
}
