import { useRef, useState, useEffect } from 'react'

const TEAL = '#00848e'

export default function OTPInput({
  length = 6,
  onComplete,
  onResend,
  phone,
  email,
  loading = false,
  error,
}) {
  const [values, setValues]     = useState(Array(length).fill(''))
  const [timer, setTimer]       = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const t = setInterval(() => setTimer(p => {
      if (p <= 1) { setCanResend(true); clearInterval(t); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val && e.target.value !== '') return

    const newValues = [...values]

    if (val.length > 1) {
      // Paste into single box
      const chars = val.split('').slice(0, length - index)
      chars.forEach((char, i) => {
        if (index + i < length) newValues[index + i] = char
      })
      setValues(newValues)
      const nextIndex = Math.min(index + chars.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    } else {
      newValues[index] = val
      setValues(newValues)
      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const joined = newValues.join('')
    if (joined.length === length && !newValues.includes('')) {
      onComplete(joined)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValues = [...values]
      if (values[index]) {
        newValues[index] = ''
        setValues(newValues)
      } else if (index > 0) {
        newValues[index - 1] = ''
        setValues(newValues)
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0)           inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < length - 1)  inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const newValues = Array(length).fill('')
    pasted.split('').forEach((char, i) => { newValues[i] = char })
    setValues(newValues)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
    if (pasted.length === length) onComplete(pasted)
  }

  const handleResend = () => {
    setValues(Array(length).fill(''))
    setTimer(60)
    setCanResend(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
    onResend()
  }

  const destination = phone || email || ''
  const filled = values.filter(v => v).length

  return (
    <div>
      <p style={{ fontSize: '14px', color: '#4a5568', textAlign: 'center', marginBottom: '4px' }}>
        <strong style={{ color: '#0a1628' }}>{destination}</strong>
      </p>
      <p style={{ fontSize: '13px', color: '#718096', textAlign: 'center', marginBottom: '24px' }}>
        ünvanına 6 rəqəmli kod göndərildi
      </p>

      {/* 6 input boxes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {Array(length).fill(0).map((_, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={values[i]}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onClick={() => inputRefs.current[i]?.select()}
            onFocus={e => {
              e.target.style.borderColor = TEAL
              e.target.style.boxShadow = '0 0 0 3px rgba(0,132,142,0.1)'
              e.target.select()
            }}
            onBlur={e => {
              if (!values[i]) e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = 'none'
            }}
            style={{
              width: '46px',
              height: '54px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'monospace',
              border: error
                ? '2px solid #EF4444'
                : values[i] ? `2px solid ${TEAL}` : '2px solid #e2e8f0',
              borderRadius: '12px',
              outline: 'none',
              color: '#0a1628',
              background: values[i] ? 'rgba(0,132,142,0.05)' : '#ffffff',
              transition: 'border-color 0.15s, background 0.15s',
              caretColor: TEAL,
              cursor: 'text',
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: '13px', color: '#EF4444', textAlign: 'center', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      {/* Timer / Resend */}
      <p style={{ fontSize: '13px', color: '#718096', textAlign: 'center', marginBottom: '20px' }}>
        {canResend ? (
          <button onClick={handleResend} style={{
            background: 'none', border: 'none', color: TEAL,
            fontWeight: 700, cursor: 'pointer', fontSize: '13px',
            fontFamily: 'inherit', textDecoration: 'underline',
          }}>
            Kodu yenidən göndər
          </button>
        ) : (
          <>Yenidən göndər: <strong style={{ color: '#0a1628' }}>0:{timer.toString().padStart(2, '0')}</strong></>
        )}
      </p>

      {/* Verify button */}
      <button
        onClick={() => { const j = values.join(''); if (j.length === length) onComplete(j); }}
        disabled={filled !== length || loading}
        style={{
          width: '100%', padding: '13px',
          background: filled === length ? TEAL : '#e2e8f0',
          color:      filled === length ? 'white' : '#a0aec0',
          border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 700,
          cursor: filled === length ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}
      >
        {loading ? 'Yoxlanılır...' : 'Təsdiqlə'}
      </button>
    </div>
  )
}
