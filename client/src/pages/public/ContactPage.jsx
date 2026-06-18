import usePageTitle from '../../hooks/usePageTitle'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../api/axios'
import { useTranslation } from 'react-i18next'
import { fadeUp } from '../../utils/animations'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

const PENDING_KEY = 'amc_contact_pending'

const maskEmail = (email) => {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const parts = domain.split('.')
  const domainName = parts[0]
  const tld = parts.slice(1).join('.')
  const maskedLocal   = local.length <= 2  ? local[0] + '***'       : local.slice(0, 2) + '***'
  const maskedDomain  = domainName.length <= 2 ? domainName[0] + '***' : domainName.slice(0, 2) + '***'
  return `${maskedLocal}@${maskedDomain}.${tld}`
}

const readPending = () => {
  try { return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null') } catch { return null }
}

export default function ContactPage() {
  usePageTitle('Əlaqə', 'Aslan Medical Center ilə əlaqə saxlayın. Bakı, Azərbaycan.')
  const { t } = useTranslation()
  const { isMobile, isTablet } = useBreakpoint()
  const [searchParams] = useSearchParams()

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm]       = useState({ fullName: '', email: '', message: '', agreed: false })
  const [loading, setLoading] = useState(false)

  // ── Pending (verification email sent) state — sessionStorage-backed ─────────
  const [pending, setPendingState] = useState(readPending)

  const setPending = (p) => {
    if (p) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(p))
    } else {
      sessionStorage.removeItem(PENDING_KEY)
    }
    setPendingState(p)
  }

  // ── Success (verified) state ─────────────────────────────────────────────────
  const [verified, setVerified] = useState(false)

  // ── Resend countdown ─────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft]   = useState(0)
  const [resending, setResending]       = useState(false)

  // ── Edit-email sub-panel ──────────────────────────────────────────────────────
  const [editMode, setEditMode]         = useState(false)
  const [newEmail, setNewEmail]         = useState('')
  const [emailChanging, setEmailChanging] = useState(false)

  // ── Clinic settings ──────────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    clinic_phone:   '+994 50 836 36 94',
    clinic_address: 'Xətai ray., A. Cəlilov küçəsi, Bakı',
    work_hours:     'B.E – Cümə, 09:00 – 19:00',
  })

  // ── URL params: ?emailVerified=1 ──────────────────────────────────────────────
  const emailVerified = searchParams.get('emailVerified')
  const verifyReason  = searchParams.get('reason')

  // Remove query params after showing success / error banners (idempotent display)
  const cleanedParams = useRef(false)
  useEffect(() => {
    if (emailVerified && !cleanedParams.current) {
      cleanedParams.current = true
      if (emailVerified === '1') {
        setVerified(true)
        setPending(null)          // clear sessionStorage on successful verify
      }
      // Clean URL without re-render cycle
      const url = new URL(window.location.href)
      url.searchParams.delete('emailVerified')
      url.searchParams.delete('reason')
      window.history.replaceState({}, '', url.pathname + (url.search || ''))
    }
  }, [emailVerified])

  // ── Fetch clinic settings ─────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/settings?group=clinic').then(r => {
      const d = r.data?.data
      if (!d) return
      setSettings(s => ({
        ...s,
        clinic_phone:   d.clinic_phone   || s.clinic_phone,
        clinic_address: d.clinic_address || s.clinic_address,
        work_hours:     d.work_hours     || s.work_hours,
      }))
    }).catch(() => {})
  }, [])

  // ── 60-second countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!pending?.sentAt) { setSecondsLeft(0); return }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(pending.sentAt).getTime()) / 1000)
      setSecondsLeft(Math.max(0, 60 - elapsed))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [pending?.sentAt])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Submit new contact ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const name = form.fullName.trim()
    if (!name)                             { toast.warning(t('contact.fullNameError'));   return }
    if (name.split(/\s+/).length < 2)      { toast.warning(t('contact.fullNamePartsError')); return }
    if (!form.email.trim())                { toast.warning(t('contact.emailError'));      return }
    if (!form.message.trim())              { toast.warning('Mesaj daxil edin.');          return }
    if (!form.agreed)                      { toast.warning(t('contact.consentError'));    return }

    setLoading(true)
    try {
      const resp = await api.post('/contact', {
        fullName:        name,
        email:           form.email.trim(),
        message:         form.message.trim(),
        consentAccepted: true,
      })
      const d = resp.data?.data || {}
      setPending({
        contactId:       d.id,
        sentEmail:       d.email || form.email.trim(),
        sentAt:          d.sentAt || new Date().toISOString(),
        managementToken: d.managementToken || '',
        fullName:        name,
        message:         form.message.trim(),
      })
      setForm({ fullName: '', email: '', message: '', agreed: false })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend ────────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!pending?.sentEmail || secondsLeft > 0 || resending) return
    setResending(true)
    try {
      const resp = await api.post('/contact/resend-verification', { email: pending.sentEmail })
      const newSentAt = resp.data?.data?.sentAt || new Date().toISOString()
      setPending({ ...pending, sentAt: newSentAt })
      toast.success(t('contact.resendSent'))
    } catch (e) {
      const status   = e.response?.status
      const retryAfter = e.response?.data?.data?.retryAfter
      if (status === 429) {
        if (retryAfter) {
          setPending({ ...pending, sentAt: new Date(Date.now() - (60 - retryAfter) * 1000).toISOString() })
        }
        toast.warning(e.response?.data?.message || t('contact.resendLimitError'))
      } else {
        toast.error(e.response?.data?.message || 'Xəta baş verdi.')
      }
    } finally {
      setResending(false)
    }
  }

  // ── Edit email ────────────────────────────────────────────────────────────────
  const handleEditEmailOpen = () => {
    setNewEmail(pending?.sentEmail || '')
    setEditMode(true)
  }

  const handleEditEmailSubmit = async () => {
    if (!newEmail.trim())                     { toast.warning(t('contact.emailError'));        return }
    if (newEmail.trim() === pending?.sentEmail) { toast.warning(t('contact.editEmailSameError')); return }
    if (!pending?.contactId || !pending?.managementToken) {
      toast.error(t('contact.tokenExpiredError'))
      return
    }

    setEmailChanging(true)
    try {
      const resp = await api.patch(`/contact/${pending.contactId}/email`, {
        email:           newEmail.trim(),
        managementToken: pending.managementToken,
      })
      const d = resp.data?.data || {}
      const updatedPending = {
        ...pending,
        sentEmail: d.email || newEmail.trim(),
        sentAt:    d.sentAt || new Date().toISOString(),
      }
      setPending(updatedPending)
      setEditMode(false)
      toast.success(t('contact.editEmailSuccess'))
    } catch (e) {
      const status = e.response?.status
      if (status === 403) {
        toast.error(t('contact.tokenExpiredError'))
        setPending(null)
      } else {
        toast.error(e.response?.data?.message || 'Xəta baş verdi.')
      }
    } finally {
      setEmailChanging(false)
    }
  }

  // ── Back to form (discard pending) ────────────────────────────────────────────
  const handleBackToForm = () => {
    if (pending) {
      setForm(f => ({
        ...f,
        fullName: pending.fullName || '',
        message:  pending.message  || '',
      }))
    }
    setPending(null)
    setEditMode(false)
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', height: 38, padding: '0 40px 0 14px',
    border: '1px solid #d1d5db', borderRadius: 10,
    fontSize: 13.5, fontFamily: FONT, outline: 'none',
    boxSizing: 'border-box', background: 'white', color: '#1f2937',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: '#111827',
    display: 'block', marginBottom: 5, fontFamily: FONT,
  }

  const hoursLines = (settings.work_hours || '').split(/[,;]/).map(s => s.trim()).filter(Boolean)

  // ── Render pending panel ──────────────────────────────────────────────────────
  const renderPendingPanel = () => {
    if (editMode) {
      return (
        <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 12, padding: '22px 22px', fontFamily: FONT }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('contact.editEmailTitle')}</div>
          <label style={{ ...labelStyle, marginBottom: 6 }}>{t('contact.editEmailLabel')}</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder={t('contact.editEmailPlaceholder')}
              style={{ ...inputStyle, borderColor: '#7dd3fc' }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = '#7dd3fc'}
              onKeyDown={e => { if (e.key === 'Enter') handleEditEmailSubmit() }}
              autoFocus
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleEditEmailSubmit}
              disabled={emailChanging}
              style={{ flex: 1, height: 38, background: emailChanging ? '#9ca3af' : TEAL, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: emailChanging ? 'not-allowed' : 'pointer' }}
            >
              {emailChanging ? '...' : t('contact.editEmailSubmit')}
            </button>
            <button
              onClick={() => setEditMode(false)}
              disabled={emailChanging}
              style={{ flex: 1, height: 38, background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: 'pointer' }}
            >
              {t('contact.editEmailCancel')}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '22px 22px', fontFamily: FONT, lineHeight: 1.7 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <svg width="17" height="17" fill="none" stroke="#16a34a" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>{t('contact.verificationSentTitle')}</div>
            <div style={{ fontSize: 12.5, color: '#166534', marginTop: 2 }}>{t('contact.verificationSent')}</div>
          </div>
        </div>

        {/* Masked email */}
        {pending?.sentEmail && (
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>{t('contact.pendingMasked')}{' '}</span>
            <span style={{ fontWeight: 700, color: NAVY, fontFamily: 'monospace' }}>{maskEmail(pending.sentEmail)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Resend with countdown */}
          <button
            onClick={handleResend}
            disabled={secondsLeft > 0 || resending}
            style={{
              fontSize: 12.5, fontWeight: 600,
              color: secondsLeft > 0 ? '#9ca3af' : TEAL,
              background: 'white',
              border: `1px solid ${secondsLeft > 0 ? '#e5e7eb' : TEAL}`,
              borderRadius: 8, padding: '7px 16px',
              cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
              fontFamily: FONT, minWidth: 140,
              transition: 'all 0.2s',
            }}
          >
            {resending
              ? '...'
              : secondsLeft > 0
                ? t('contact.resendCooldown', { seconds: secondsLeft })
                : t('contact.resendReady')}
          </button>

          {/* Edit email */}
          {pending?.managementToken && (
            <button
              onClick={handleEditEmailOpen}
              style={{
                fontSize: 12.5, fontWeight: 600,
                color: '#6b7280', background: 'white',
                border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '7px 16px', cursor: 'pointer', fontFamily: FONT,
              }}
            >
              ✏ {t('contact.editEmail')}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Render success panel ──────────────────────────────────────────────────────
  const renderSuccessPanel = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '28px 28px', fontFamily: FONT }}
    >
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#15803d', marginBottom: 10, fontFamily: "'Raleway', sans-serif" }}>
        {t('contact.verifiedTitle')}
      </div>
      <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.7, margin: 0 }}>
        {t('contact.verifiedMessage')}
      </p>
    </motion.div>
  )

  return (
    <main style={{ background: '#eef2f7', fontFamily: FONT, paddingTop: 110 }}>

      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: isMobile ? '16px 16px 16px' : '0px 40px 16px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '420px 1fr',
        gap: 56, alignItems: 'center',
      }}>

        {/* LEFT — circular photo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <div style={{ width: '100%', maxWidth: 300, aspectRatio: '1 / 1', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 16px 56px rgba(0,0,0,0.15)', flexShrink: 0 }}>
            <img src="/contact.png" alt="Tibbi mütəxəssis"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'white', borderRadius: 14, padding: '12px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 190,
          }}>
            <img src="/yenilogo.png" alt="Aslan Medical"
              style={{ height: 36, maxWidth: 140, width: 'auto', objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: NAVY, letterSpacing: '0.1em', fontFamily: "'Raleway', sans-serif" }}>ASLAN</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: TEAL, letterSpacing: '0.18em', textTransform: 'uppercase' }}>MEDICAL CENTER</div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — form / pending / success */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          style={{ paddingTop: 8 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 900, color: NAVY, margin: '0 0 14px', lineHeight: 1.05, fontFamily: "'Raleway', sans-serif" }}>
            {t('contact.title')}
          </h1>

          {/* Verify error banners (shown before URL params cleaned) */}
          {emailVerified === '0' && !cleanedParams.current && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#b91c1c', fontSize: 13, fontFamily: FONT }}>
              {verifyReason === 'expired' ? t('contact.verifyExpired') :
               verifyReason === 'used'    ? t('contact.verifyUsed')    :
               t('contact.verifyInvalid')}
            </div>
          )}

          {/* SUCCESS panel */}
          {verified ? renderSuccessPanel() :

          /* PENDING panel */
          pending ? renderPendingPanel() :

          /* FORM */
          (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Full Name */}
              <div>
                <label style={labelStyle}>{t('contact.fullNameLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder={t('contact.fullNamePlaceholder')} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = TEAL}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>{t('contact.emailLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder={t('contact.emailPlaceholder')} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = TEAL}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>{t('contact.messageLabel')}</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder={t('contact.messagePlaceholder')} rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none', minHeight: 68 }}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>

              {/* Checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#6b7280', fontFamily: FONT, lineHeight: 1.5 }}>
                <input type="checkbox" checked={form.agreed} onChange={e => set('agreed', e.target.checked)}
                  style={{ width: 14, height: 14, marginTop: 2, accentColor: TEAL, cursor: 'pointer', flexShrink: 0 }} />
                <span>
                  <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.agree')}</a>
                  {' '}{t('contact.and')}{' '}
                  <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.privacyPolicy')}</a>
                  {' '}{t('contact.acceptText')}
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', height: 42, background: loading ? '#6b7280' : TEAL,
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 13.5, fontWeight: 700, fontFamily: FONT,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,132,142,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#006b74'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,132,142,0.4)' }}}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = TEAL; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,132,142,0.3)' }}}
              >
                {loading ? 'Göndərilir...' : (
                  <>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    {t('contact.sendButton')}
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Info cards */}
      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: isMobile ? '0 16px 24px' : '0 40px 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
        gap: 16,
      }}>

        {/* Phone */}
        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.callUs')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(settings.clinic_phone || '+994 50 836 36 94').split(/[,;]/).map(p => p.trim()).filter(Boolean).map(p => (
              <a key={p} href={`tel:${p.replace(/\s/g,'')}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563', fontSize: 13, textDecoration: 'none', fontFamily: "'Source Sans 3', sans-serif" }}>
                <svg width="12" height="12" fill="none" stroke="#00848e" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                {p}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Address */}
        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0.05 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.location')}</h3>
          <p style={{ color: '#4b5563', fontSize: 13, margin: 0, lineHeight: 1.65, fontFamily: "'Source Sans 3', sans-serif" }}>
            {(settings.clinic_address || 'Xətai ray., A. Cəlilov küçəsi, Bakı, Azərbaycan').split(',').map((seg, i, arr) => (
              <span key={i}>{seg.trim()}{i < arr.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        </motion.div>

        {/* Hours */}
        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.hours')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hoursLines.length > 0 ? (
              hoursLines.map((line, i) => {
                const [day, ...rest] = line.split('–')
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{day?.trim() || line}</span>
                    {rest.length > 0 && <span style={{ fontWeight: 700, color: '#111827' }}>{rest.join('–').trim()}</span>}
                  </div>
                )
              })
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>B.E – Cümə</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>09:00 – 19:00</span>
              </div>
            )}
          </div>
        </motion.div>

      </section>
    </main>
  )
}
