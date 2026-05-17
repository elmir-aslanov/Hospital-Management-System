import { useState } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase/config'

export function useFirebasePhone() {
  const [confirmation, setConfirmation] = useState(null)
  const [loading, setLoading] = useState(false)

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear() } catch (e) {}
      window.recaptchaVerifier = null
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible', callback: () => {} }
    )
  }

  const sendSmsOTP = async (phoneNumber) => {
    setLoading(true)
    try {
      setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
      setConfirmation(result)
      setLoading(false)
      return { success: true }
    } catch (err) {
      console.error('Firebase SMS error:', err)
      setLoading(false)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      return { success: false, error: err.message }
    }
  }

  const verifySmsOTP = async (otp) => {
    if (!confirmation) return { success: false, error: 'Kod göndərilməyib.' }
    setLoading(true)
    try {
      const result = await confirmation.confirm(otp)
      const firebaseToken = await result.user.getIdToken()
      setLoading(false)
      return { success: true, firebaseToken, phone: result.user.phoneNumber }
    } catch (err) {
      setLoading(false)
      return { success: false, error: 'OTP yanlışdır.' }
    }
  }

  return { sendSmsOTP, verifySmsOTP, loading }
}
