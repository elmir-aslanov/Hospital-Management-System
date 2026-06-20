import usePageTitle from '../../hooks/usePageTitle'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { BASE } from '../../api/config.js'
import { fadeUp } from '../../utils/animations'

const FONT = "'Poppins', 'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

const ASSETS = {
  appStore: '/appstore.jpeg',
  finNew: '/yenisexsiyyetves.jpeg',
  finOld: '/kohnesexsiyyetvesiqesi.jpeg',
  googlePlay: '/google.jpeg',
  info: '/nidamodul.jpeg',
  insurance: '/icbaritibbisigorta.jpeg',
  logo: '/yenilogo.png',
  phone: '/mainmobile1.png',
  protocol: '/icbaritibbisigortaumunesi.jpeg',
  tabib: '/tabibenetice.jpeg',
}

const FIN_REGEX = /^[A-Za-z0-9]{5,8}$/

const FLAG_LABELS = { normal: 'Normal', low: 'Aşağı', high: 'Yüksək', critical: 'Kritik', pending: 'Gözləyir' }
const FLAG_COLORS = { normal: '#15803d', low: '#c2410c', high: '#c2410c', critical: '#b91c1c', pending: '#64748b' }
const FLAG_BG     = { normal: '#dcfce7', low: '#ffedd5', high: '#ffedd5', critical: '#fee2e2', pending: '#f1f5f9' }

function Spinner() {
  return <span className="enetice-spinner" aria-hidden="true" />
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('az-AZ', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function InfoButton({ label, onClick }) {
  return (
    <button
      type="button"
      className="enetice-info-button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <img src={ASSETS.info} alt="" />
    </button>
  )
}

function InfoModal({ type, onClose }) {
  const isFin = type === 'fin'

  return (
    <div className="enetice-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="enetice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enetice-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="enetice-modal-header">
          <h2 id="enetice-modal-title">{isFin ? 'FİN barədə məlumat' : 'PROTOKOL barədə məlumat'}</h2>
          <button type="button" aria-label="Bağla" onClick={onClose}>×</button>
        </header>

        <div className={isFin ? 'enetice-modal-body enetice-fin-gallery' : 'enetice-modal-body'}>
          {isFin ? (
            <>
              <img src={ASSETS.finNew} alt="Yeni şəxsiyyət vəsiqəsində FİN nümunəsi" />
              <img src={ASSETS.finOld} alt="Köhnə şəxsiyyət vəsiqəsində FİN nümunəsi" />
            </>
          ) : (
            <img className="enetice-protocol-image" src={ASSETS.protocol} alt="Protokol nömrəsi nümunəsi" />
          )}
        </div>
      </section>
    </div>
  )
}

export default function ENeticePage() {
  const { t } = useTranslation()
  usePageTitle('E-Nəticə', 'Laborator analiz nəticələrinizi onlayn yoxlayın.')

  const [searchMode, setSearchMode] = useState('fin')
  const [patientId, setPatientId] = useState('')
  const [protocol, setProtocol] = useState('')
  const [dateOfBirth, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [pending, setPending] = useState(false)
  const [modal, setModal] = useState(null)
  const [helpText, setHelpText] = useState('')

  // Optional admin-managed help text — hidden entirely when not configured,
  // so the page is visually unchanged unless an admin sets one.
  useEffect(() => {
    api.get('/settings', { params: { group: 'enetice' } })
      .then(({ data }) => setHelpText(data?.data?.enetice_help_text || ''))
      .catch(() => {})
  }, [])

  const hasRequiredFields = searchMode === 'fin'
    ? patientId.trim() && protocol.trim()
    : dateOfBirth && protocol.trim()
  const canSubmit = Boolean(hasRequiredFields) && !loading

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode)
    setError(null)
    setResult(null)
    setPending(false)
    if (mode === 'fin') {
      setDob('')
    } else {
      setPatientId('')
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setModal(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const openModal = (type) => {
    setModal(type)
  }

  const validateForm = () => {
    if (searchMode === 'fin') {
      if (!patientId.trim()) return 'FİN kod daxil edilməlidir'
      if (!FIN_REGEX.test(patientId.trim())) return 'FİN kod 5-8 simvol arası hərf və rəqəmdən ibarət olmalıdır'
    }
    if (searchMode === 'birth') {
      if (!dateOfBirth) return 'Doğum tarixi daxil edilməlidir'
      if (new Date(`${dateOfBirth}T00:00:00`).getTime() > Date.now()) return 'Doğum tarixi gələcəkdə ola bilməz'
    }
    const cleanProtocol = protocol.trim()
    if (!cleanProtocol) return 'Protokol nömrəsi daxil edilməlidir'
    // LAB-REQ-... is the request number issued at booking time, not the lab
    // protocol number issued at sample collection — catch the common mix-up
    // client-side instead of letting it round-trip to the backend.
    if (/^LAB-REQ-/i.test(cleanProtocol) || !/^LAB-\d{4}-\d{6}$/i.test(cleanProtocol)) {
      return t('labResult.protocolInvalid')
    }
    return ''
  }

  const buildPayload = () => {
    const payload = {
      protocolNo: protocol.trim(),
    }

    if (searchMode === 'fin') {
      payload.method = 'fin'
      payload.fin = patientId.trim().toUpperCase()
    } else {
      payload.method = 'birthDate'
      payload.birthDate = dateOfBirth
    }

    return payload
  }

  const handleSearch = async (event) => {
    event?.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setPending(false)

    try {
      const res = await api.post('/lab-results/verify', buildPayload())
      const data = res.data?.data || null
      if (!data) {
        setError('Nəticə tapılmadı. Məlumatları yoxlayıb yenidən cəhd edin.')
        return
      }
      setResult(data)
    } catch (err) {
      if (!err.response) {
        setError('Bağlantı xətası baş verdi')
      } else if (err.response.status >= 500) {
        setError('Server xətası baş verdi')
      } else {
        setError(err.response.data?.message || 'Məlumatları düzgün doldurun')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
    setPending(false)
    setSearchMode('fin')
    setPatientId('')
    setProtocol('')
    setDob('')
  }

  return (
    <div className="enetice-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes eneticeSpin {
          to { transform: rotate(360deg); }
        }

        .enetice-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: ${NAVY};
          font-family: ${FONT};
          padding: 16px 24px;
        }

        .enetice-shell {
          width: min(100%, 1360px);
          display: grid;
          grid-template-columns: minmax(390px, 450px) minmax(0, 760px);
          align-items: center;
          gap: clamp(54px, 5vw, 72px);
          justify-content: center;
        }

        .enetice-promo {
          height: min(680px, calc(100vh - 34px));
          min-height: 620px;
          border-radius: 30px;
          background: #ffffff;
          color: #0b1d34;
          border: 1px solid #e2e8f0;
          padding: 30px 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }

        .enetice-promo-top {
          width: 100%;
        }

        .enetice-back-row {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          margin-bottom: 20px;
        }

        .enetice-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          padding: 6px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: transparent;
          transition: color 0.15s ease, border-color 0.15s ease, transform 0.2s ease;
        }

        .enetice-back-link:hover {
          color: #1d8b95;
          border-color: #1d8b95;
          transform: scale(1.05);
        }

        .enetice-promo-copy {
          width: min(100%, 410px);
          text-align: center;
          margin: 0 auto;
        }

        .enetice-promo h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: 0;
        }

        .enetice-promo p {
          margin: 8px auto 0;
          max-width: 360px;
          color: #475569;
          font-size: 13.5px;
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: 0;
        }

        .enetice-phone-frame {
          position: relative;
          width: min(70%, 300px);
          height: 420px;
          margin: 10px auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          z-index: 1;
          overflow: hidden;
        }

        .enetice-phone-frame::before {
          content: '';
          position: absolute;
          width: 355px;
          height: 355px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 50%;
          box-shadow:
            0 0 0 26px rgba(255, 255, 255, 0.08),
            0 0 0 54px rgba(255, 255, 255, 0.055),
            0 0 0 82px rgba(255, 255, 255, 0.035);
          z-index: -1;
        }

        .enetice-phone-frame img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
        }

        .enetice-store-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .enetice-store-row img {
          height: 35px;
          width: auto;
          display: block;
          border-radius: 6px;
        }

        .enetice-form-panel {
          width: 100%;
          max-width: 760px;
          padding: 0;
        }

        .enetice-form-logo {
          height: 60px;
          max-width: 210px;
          width: auto;
          object-fit: contain;
          margin-bottom: 16px;
        }

        .enetice-form-panel h1 {
          margin: 0 0 7px;
          font-size: clamp(30px, 2vw, 34px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: 0;
          color: #0b1d34;
        }

        .enetice-subtitle {
          max-width: 560px;
          margin: 0 0 22px;
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 400;
        }

        .enetice-error {
          margin: 0 0 20px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          color: #991b1b;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 600;
        }

        .enetice-form {
          width: 100%;
        }

        .enetice-choice-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 42px;
          margin-bottom: 22px;
        }

        .enetice-choice {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #101828;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.25;
          cursor: pointer;
          user-select: none;
        }

        .enetice-choice input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .enetice-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #7b7f87;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .enetice-radio::after {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: transparent;
        }

        .enetice-choice.is-active .enetice-radio {
          border-color: #368ddc;
        }

        .enetice-choice.is-active .enetice-radio::after {
          background: #368ddc;
        }

        .enetice-field {
          margin-bottom: 16px;
          position: relative;
        }

        .enetice-field > label,
        .enetice-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          color: #0b1d34;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
        }

        .enetice-label-row label {
          margin: 0;
        }

        .enetice-input-wrap {
          position: relative;
        }

        .enetice-input {
          width: 100%;
          height: 52px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          color: ${NAVY};
          font: 500 15px/1.2 ${FONT};
          padding: 0 48px 0 16px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          box-sizing: border-box;
        }

        .enetice-input::placeholder {
          color: #cbd5e1;
          font-size: 15px;
          font-weight: 500;
        }

        .enetice-input:focus {
          border-color: #1d8b95;
          box-shadow: 0 0 0 3px rgba(29, 139, 149, 0.14);
        }

        .enetice-info-button {
          width: 22px;
          height: 22px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .enetice-input-wrap .enetice-info-button {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
        }

        .enetice-info-button img {
          width: 18px;
          height: 18px;
          object-fit: contain;
          display: block;
        }

        .enetice-date-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 0;
        }

        .enetice-date-grid .enetice-field {
          margin-bottom: 16px;
        }

        .enetice-tooltip {
          position: absolute;
          left: 0;
          bottom: calc(100% + 14px);
          z-index: 20;
          width: min(330px, calc(100vw - 48px));
          border: 1px solid #eef0f2;
          border-radius: 4px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(10, 22, 40, 0.12);
          padding: 16px 20px;
          color: #121826;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.18;
        }

        .enetice-tooltip::after {
          content: '';
          position: absolute;
          left: 46%;
          bottom: -13px;
          width: 24px;
          height: 24px;
          background: #ffffff;
          border-right: 1px solid #eef0f2;
          border-bottom: 1px solid #eef0f2;
          transform: rotate(45deg);
        }

        .enetice-date-error {
          margin: -10px 0 18px;
          color: #b42318;
          font-size: 14px;
          font-weight: 700;
        }

        .enetice-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .enetice-submit {
          width: min(100%, 220px);
          height: 52px;
          border: 0;
          border-radius: 11px;
          background: #9fd4f2;
          color: #ffffff;
          font: 700 15px/1 ${FONT};
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }

        .enetice-submit:not(:disabled) {
          background: #1d8b95;
          box-shadow: 0 10px 20px rgba(29, 139, 149, 0.18);
        }

        .enetice-submit:not(:disabled):hover {
          background: #0e8f96;
          transform: translateY(-1px) scale(1.02);
        }

        .enetice-submit:disabled {
          cursor: not-allowed;
        }

        .enetice-spinner {
          display: inline-block;
          width: 17px;
          height: 17px;
          margin-right: 9px;
          border: 2.5px solid rgba(255,255,255,0.46);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: eneticeSpin 0.75s linear infinite;
          vertical-align: -2px;
        }

        .enetice-partner-strip {
          margin-top: 26px;
          display: flex;
          align-items: center;
          gap: 44px;
          flex-wrap: wrap;
        }

        .enetice-partner-strip img {
          height: auto;
          object-fit: contain;
        }

        .enetice-partner-strip .insurance-logo {
          width: 138px;
        }

        .enetice-partner-strip .tabib-logo {
          width: 112px;
        }

        .enetice-result {
          margin-top: 22px;
          max-width: 720px;
        }

        .enetice-result-card {
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #f8fafc;
          padding: 18px;
          margin-bottom: 14px;
        }

        .enetice-result-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .enetice-result-name {
          color: ${NAVY};
          font-size: 19px;
          font-weight: 800;
          margin: 0 0 4px;
        }

        .enetice-result-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .enetice-result-badge {
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .enetice-result-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }

        .enetice-mini-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          padding: 13px 15px;
        }

        .enetice-mini-label {
          margin-bottom: 5px;
          color: #98a2b3;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .enetice-mini-value {
          color: ${NAVY};
          font-size: 14px;
          font-weight: 700;
          line-height: 1.35;
        }

        .enetice-result-table {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
        }

        .enetice-result-row {
          display: grid;
          grid-template-columns: minmax(140px, 1.4fr) minmax(80px, 0.8fr) minmax(70px, 0.6fr) minmax(110px, 0.9fr) minmax(80px, 0.7fr);
          gap: 12px;
          align-items: center;
          padding: 11px 13px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          font-size: 13px;
        }

        .enetice-result-row:last-child {
          border-bottom: 0;
        }

        .enetice-result-row.is-head {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .enetice-result-test {
          color: ${NAVY};
          font-weight: 800;
        }

        .enetice-result-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 14px;
          border-radius: 10px;
          background: #1d8b95;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          padding: 10px 14px;
        }

        .enetice-history {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          padding: 15px 17px;
        }

        .enetice-history-title {
          margin-bottom: 10px;
          color: #374151;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .enetice-history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .enetice-history-item {
          border-left: 3px solid ${TEAL};
          padding-left: 10px;
          color: #4b5563;
          font-size: 13px;
        }

        .enetice-reset {
          width: 100%;
          margin-top: 16px;
          border: 2px solid ${TEAL};
          border-radius: 10px;
          background: transparent;
          color: ${TEAL};
          cursor: pointer;
          font: 800 13.5px/1 ${FONT};
          padding: 12px;
          transition: transform 0.2s ease;
        }

        .enetice-reset:hover {
          transform: scale(1.02);
        }

        .enetice-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: rgba(9, 15, 31, 0.24);
          padding: 40px 18px;
        }

        .enetice-modal {
          width: min(100%, 430px);
          max-height: calc(100vh - 80px);
          overflow: auto;
          border-radius: 4px;
          background: #ffffff;
          box-shadow: 0 8px 22px rgba(9, 15, 31, 0.36);
        }

        .enetice-modal-header {
          height: 34px;
          background: #3799d9;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px 0 16px;
          box-sizing: border-box;
        }

        .enetice-modal-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0;
        }

        .enetice-modal-header button {
          width: 26px;
          height: 26px;
          border: 0;
          background: transparent;
          color: #ffffff;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
        }

        .enetice-modal-body {
          padding: 18px;
        }

        .enetice-fin-gallery {
          display: grid;
          gap: 18px;
        }

        .enetice-fin-gallery img,
        .enetice-protocol-image {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .enetice-protocol-image {
          max-width: 300px;
          margin: 0 auto;
        }

        @media (max-width: 1100px) {
          .enetice-page {
            align-items: flex-start;
            padding-top: 22px;
          }

          .enetice-shell {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .enetice-promo {
            height: auto;
            min-height: auto;
            padding: 30px 22px 26px;
          }

          .enetice-phone-frame {
            width: min(280px, 76%);
            max-width: 280px;
          }

          .enetice-form-panel {
            max-width: 100%;
          }
        }

        @media (max-width: 720px) {
          .enetice-page {
            padding: 14px;
          }

          .enetice-promo {
            border-radius: 24px;
          }

          .enetice-promo h2 {
            font-size: 22px;
          }

          .enetice-promo p {
            font-size: 13.5px;
          }

          .enetice-store-row img {
            height: 34px;
          }

          .enetice-form-logo {
            height: 48px;
            max-width: 170px;
            margin-bottom: 14px;
          }

          .enetice-form-panel h1 {
            font-size: 30px;
          }

          .enetice-subtitle {
            font-size: 14px;
            margin-bottom: 22px;
          }

          .enetice-choice-row,
          .enetice-date-grid,
          .enetice-actions,
          .enetice-result-meta {
            grid-template-columns: 1fr;
          }

          .enetice-choice-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .enetice-choice-row {
            gap: 14px;
          }

          .enetice-choice,
          .enetice-field > label,
          .enetice-label-row {
            font-size: 14px;
          }

          .enetice-input {
            height: 52px;
            font-size: 15px;
          }

          .enetice-actions {
            gap: 18px;
          }

          .enetice-tooltip {
            width: min(320px, calc(100vw - 40px));
            font-size: 14px;
            padding: 18px 20px;
          }

          .enetice-submit {
            width: 100%;
            height: 54px;
            font-size: 15.5px;
          }

          .enetice-partner-strip {
            justify-content: center;
            gap: 28px;
          }

          .enetice-result-header {
            flex-direction: column;
          }

          .enetice-result-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>

      <div className="enetice-shell">
        <motion.aside className="enetice-promo" aria-label="Aslan Medical mobil tətbiqi" variants={fadeUp} initial="hidden" animate="visible">
          <div className="enetice-promo-top">
            <div className="enetice-back-row">
              <a href="/" className="enetice-back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Ana səhifə
              </a>
            </div>
            <div className="enetice-promo-copy">
              <h2>Analiz nəticələriniz hər zaman əlinizin altında</h2>
              <p>Tətbiqdən istifadə edərək laborator analiz nəticələrinizi onlayn rejimdə rahat şəkildə əldə edə bilərsiniz.</p>
            </div>
          </div>

          <div className="enetice-phone-frame">
            <img src={ASSETS.phone} alt="Aslan Medical mobil tətbiq ekranı" />
          </div>

          <div className="enetice-store-row" aria-label="Mobil tətbiq keçidləri">
            <img src={ASSETS.googlePlay} alt="Google Play" />
            <img src={ASSETS.appStore} alt="App Store" />
          </div>
        </motion.aside>

        <motion.main className="enetice-form-panel" variants={fadeUp} initial="hidden" animate="visible" transition={{ ...fadeUp.visible.transition, delay: 0.1 }}>
          <img className="enetice-form-logo" src={ASSETS.logo} alt="Aslan Medical Center" />

          <h1>Laborator analiz nəticələri</h1>
          <p className="enetice-subtitle">Aşağıdakı xanaları dolduraraq analiz nəticələrinizi yoxlaya bilərsiniz</p>
          {helpText && <p className="enetice-subtitle">{helpText}</p>}

          {error && <div className="enetice-error">{error}</div>}

          <form className="enetice-form" onSubmit={handleSearch}>
            <div className="enetice-choice-row" role="radiogroup" aria-label="Axtarış metodu">
              <label className={`enetice-choice ${searchMode === 'fin' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="enetice-search-mode"
                  value="fin"
                  checked={searchMode === 'fin'}
                  onChange={() => handleSearchModeChange('fin')}
                />
                <span className="enetice-radio" aria-hidden="true" />
                <span>FİN və Protokol ilə axtarış et</span>
              </label>

              <label className={`enetice-choice ${searchMode === 'birth' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="enetice-search-mode"
                  value="birth"
                  checked={searchMode === 'birth'}
                  onChange={() => handleSearchModeChange('birth')}
                />
                <span className="enetice-radio" aria-hidden="true" />
                <span>Doğum tarixi və Protokol ilə axtarış et</span>
              </label>
            </div>

            {searchMode === 'fin' ? (
              <div className="enetice-field" data-info-root>
                <label htmlFor="enetice-fin">FİN</label>
                <div className="enetice-input-wrap">
                  <input
                    id="enetice-fin"
                    className="enetice-input"
                    type="text"
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                    placeholder="XXXXXXX"
                    autoComplete="off"
                  />
                  <InfoButton label="FİN barədə məlumat" onClick={() => openModal('fin')} />
                </div>
              </div>
            ) : (
              <div className="enetice-field">
                <label htmlFor="enetice-birth-date">Doğum tarixi</label>
                <input
                  id="enetice-birth-date"
                  className="enetice-input"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDob(event.target.value)}
                />
              </div>
            )}

            <div className="enetice-field" data-info-root>
              <label htmlFor="enetice-protocol">Protokol</label>
              <div className="enetice-input-wrap">
                <input
                  id="enetice-protocol"
                  className="enetice-input"
                  type="text"
                  value={protocol}
                  onChange={(event) => setProtocol(event.target.value)}
                  placeholder="XXXXXXXXXXXXX"
                  autoComplete="off"
                />
                <InfoButton label="Protokol barədə məlumat" onClick={() => openModal('protocol')} />
              </div>
            </div>

            <div className="enetice-actions">
              <button className="enetice-submit" type="submit" disabled={!canSubmit}>
                {loading ? <><Spinner />Yoxlanılır...</> : 'Nəticəni göstər'}
              </button>
            </div>
          </form>

          <div className="enetice-partner-strip">
            <img className="insurance-logo" src={ASSETS.insurance} alt="İcbari Tibbi Sığorta" />
            <img className="tabib-logo" src={ASSETS.tabib} alt="TƏBİB" />
          </div>

          {pending && (
            <div className="enetice-result">
              <div className="enetice-result-card">
                <p className="enetice-result-subtitle" style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                  Nəticə hələ hazır deyil
                </p>
              </div>
              <button className="enetice-reset" type="button" onClick={reset}>
                Yeni Sorğu
              </button>
            </div>
          )}

          {result && (
            <div className="enetice-result">
              <div className="enetice-result-card">
                <div className="enetice-result-header">
                  <div>
                    <h2 className="enetice-result-name">{result.patientFullName || 'Pasiyent'}</h2>
                    <p className="enetice-result-subtitle">{result.testName || 'Analiz nəticəsi tapıldı'}</p>
                  </div>
                  <span className="enetice-result-badge">Hazırdır</span>
                </div>

                <div className="enetice-result-meta">
                  <div className="enetice-mini-card">
                    <div className="enetice-mini-label">Protokol</div>
                    <div className="enetice-mini-value">{result.protocolNo || '—'}</div>
                  </div>
                  <div className="enetice-mini-card">
                    <div className="enetice-mini-label">{t('labResult.sampleDate')}</div>
                    <div className="enetice-mini-value">{formatDate(result.sampleDate)}</div>
                  </div>
                  <div className="enetice-mini-card">
                    <div className="enetice-mini-label">{t('labResult.resultDate')}</div>
                    <div className="enetice-mini-value">{formatDate(result.resultDate)}</div>
                  </div>
                  <div className="enetice-mini-card">
                    <div className="enetice-mini-label">Test kodu</div>
                    <div className="enetice-mini-value">{result.testCode || '—'}</div>
                  </div>
                </div>

                {Array.isArray(result.results) && result.results.length > 0 && (
                  <div className="enetice-result-table">
                    <div className="enetice-result-row is-head">
                      <span>Parametr</span>
                      <span>Nəticə</span>
                      <span>Vahid</span>
                      <span>Referans aralığı</span>
                      <span>Status</span>
                    </div>
                    {result.results.map((item, index) => (
                      <div className="enetice-result-row" key={`${item.parameterName || 'param'}-${index}`}>
                        <span className="enetice-result-test">{item.parameterName || 'Parametr'}</span>
                        <span>{item.value || '—'}</span>
                        <span>{item.unit || '—'}</span>
                        <span>{item.referenceRange || '—'}</span>
                        <span style={{
                          fontWeight: 700, padding: '2px 9px', borderRadius: 999, display: 'inline-block',
                          color: FLAG_COLORS[item.status] || FLAG_COLORS.normal,
                          background: FLAG_BG[item.status] || FLAG_BG.normal,
                        }}>
                          {FLAG_LABELS[item.status] || FLAG_LABELS.normal}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.generalConclusion && <p className="enetice-result-subtitle" style={{ marginTop: 12 }}>{result.generalConclusion}</p>}

                {result.id && result.accessToken && (
                  <a
                    className="enetice-result-link"
                    href={`${BASE}/api/v1/lab-results/${result.id}/pdf?accessToken=${encodeURIComponent(result.accessToken)}`}
                    target="_blank" rel="noreferrer"
                  >
                    PDF yüklə
                  </a>
                )}
              </div>

              <button className="enetice-reset" type="button" onClick={reset}>
                Yeni Sorğu
              </button>
            </div>
          )}
        </motion.main>
      </div>

      {modal && <InfoModal type={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
