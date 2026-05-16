import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

export default function OTPInput({ length = 6, onComplete, onResend, phone, loading = false, error }) {
  const [values, setValues] = useState(Array(length).fill(''))
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (timer === 0) { setCanResend(true); return }
    const t = setTimeout(() => setTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newValues = [...values]
    newValues[index] = value.slice(-1)
    setValues(newValues)
    if (value && index < length - 1) inputs.current[index + 1]?.focus()
    const joined = newValues.join('')
    if (joined.length === length) onComplete(joined)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newValues = Array(length).fill('')
    pasted.split('').forEach((char, i) => { newValues[i] = char })
    setValues(newValues)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    if (pasted.length === length) onComplete(pasted)
  }

  const handleResend = () => {
    setValues(Array(length).fill(''))
    setTimer(60)
    setCanResend(false)
    inputs.current[0]?.focus()
    onResend()
  }

  return (
    <div style={{ textAlign: 'center', fontFamily: FONT }}>

      <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '4px' }}>
        <strong style={{ color: '#0a1628' }}>{phone}</strong> nömrəsinə
      </p>
      <p style={{ fontSize: '13px', color: '#718096', marginBottom: '28px' }}>
        6 rəqəmli kod göndərildi
      </p>

      {/* OTP boxes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        {values.map((val, i) => (
          <motion.input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            whileFocus={{ scale: 1.06 }}
            autoFocus={i === 0}
            style={{
              width: '48px', height: '56px',
              textAlign: 'center',
              fontSize: '22px', fontWeight: 700,
              border: error
                ? '2px solid #EF4444'
                : val ? `2px solid ${TEAL}` : '2px solid #e2e8f0',
              borderRadius: '12px',
              outline: 'none',
              color: '#0a1628',
              background: val ? 'rgba(0,132,142,0.04)' : 'white',
              transition: 'border-color 0.2s',
              caretColor: TEAL,
              fontFamily: 'monospace',
              cursor: 'text',
            }}
          />
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '13px', color: '#EF4444', marginBottom: '16px' }}
        >
          {error}
        </motion.p>
      )}

      {/* Timer / Resend */}
      <div style={{ fontSize: '13px', color: '#718096', marginBottom: '24px', fontFamily: FONT }}>
        {canResend ? (
          <button
            onClick={handleResend}
            style={{
              background: 'none', border: 'none', color: TEAL,
              fontWeight: 700, cursor: 'pointer', fontSize: '13px',
              fontFamily: FONT, textDecoration: 'underline',
            }}
          >
            Kodu yenidən göndər
          </button>
        ) : (
          <span>
            Yenidən göndər:{' '}
            <strong style={{ color: '#0a1628' }}>0:{timer.toString().padStart(2, '0')}</strong>
          </span>
        )}
      </div>

      {/* Verify button */}
      <button
        onClick={() => {
          const joined = values.join('')
          if (joined.length === length) onComplete(joined)
        }}
        disabled={values.join('').length !== length || loading}
        style={{
          width: '100%', padding: '13px',
          background: values.join('').length === length ? TEAL : '#e2e8f0',
          color: values.join('').length === length ? 'white' : '#a0aec0',
          border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 700,
          cursor: values.join('').length === length ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s', fontFamily: FONT,
        }}
      >
        {loading ? 'Yoxlanılır...' : 'Təsdiqlə'}
      </button>
    </div>
  )
}
