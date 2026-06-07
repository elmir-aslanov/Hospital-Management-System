import usePageTitle from '../../hooks/usePageTitle'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useTranslation } from 'react-i18next'

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
  logo: '/logo.png',
  phone: '/mainmobile.jpeg',
  protocol: '/icbaritibbisigortaumunesi.jpeg',
  tabib: '/tabibenetice.jpeg',
}

const START_DATE_HINT = 'Laboratoriya nəticələrinin siyahılanacağı başlanğıc tarixini daxil edin. Tarix aralığı 30 günü keçməməlidir.'
const END_DATE_HINT = 'Laboratoriya nəticələrinin siyahılanacağı son tarixi daxil edin. Tarix aralığı 30 günü keçməməlidir.'

function Spinner() {
  return <span className="enetice-spinner" aria-hidden="true" />
}

function getDateRangeError(startDate, endDate) {
  if (!startDate || !endDate) return ''

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  if (end < start) return 'Son tarix başlanğıc tarixindən əvvəl ola bilməz.'

  const dayDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (dayDiff > 30) return 'Tarix aralığı 30 günü keçməməlidir.'

  return ''
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
  usePageTitle('E-Nəticə', 'Laborator analiz nəticələrinizi onlayn yoxlayın.')

  const { t } = useTranslation()
  const [searchMode, setSearchMode] = useState('fin')
  const [patientId, setPatientId] = useState('')
  const [protocol, setProtocol] = useState('')
  const [dateOfBirth, setDob] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [modal, setModal] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const dateRangeError = getDateRangeError(startDate, endDate)
  const hasRequiredFields = searchMode === 'fin'
    ? patientId.trim() && protocol.trim()
    : dateOfBirth && protocol.trim()
  const canSubmit = Boolean(hasRequiredFields) && !dateRangeError && !loading

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setModal(null)
        setTooltip(null)
      }
    }

    function handleDocumentClick(event) {
      const target = event.target
      const isInsideInfoControl = target instanceof Element && target.closest('[data-info-root]')
      if (!isInsideInfoControl) setTooltip(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  const openModal = (type) => {
    setTooltip(null)
    setModal(type)
  }

  const handleSearch = async (event) => {
    event?.preventDefault()

    if (searchMode === 'fin' && !patientId.trim()) {
      setError('FİN daxil edin')
      return
    }

    if (searchMode === 'birth' && !dateOfBirth) {
      setError('Doğum tarixini daxil edin')
      return
    }

    if (!protocol.trim()) {
      setError('Protokol nömrəsini daxil edin')
      return
    }

    if (dateRangeError) {
      setError(dateRangeError)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = {
        searchMode,
        protocol: protocol.trim(),
        ...(patientId.trim() ? { patientId: patientId.trim().toUpperCase() } : {}),
        ...(dateOfBirth ? { birthDate: dateOfBirth } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      }

      const res = await api.get('/patients/search-public', { params })
      setResult(res.data?.data || res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Məlumat tapılmadı. Daxil etdiyiniz məlumatları yoxlayın.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
    setSearchMode('fin')
    setPatientId('')
    setProtocol('')
    setDob('')
    setStartDate('')
    setEndDate('')
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
          grid-template-columns: minmax(420px, 470px) minmax(0, 760px);
          align-items: center;
          gap: clamp(54px, 5vw, 72px);
          justify-content: center;
        }

        .enetice-promo {
          height: min(700px, calc(100vh - 34px));
          min-height: 650px;
          border-radius: 30px;
          background: #2d98d8;
          color: #ffffff;
          padding: 30px 28px 26px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }

        .enetice-promo h2 {
          width: min(100%, 410px);
          margin: 0;
          font-size: 27px;
          font-weight: 700;
          line-height: 1.35;
          text-align: center;
          letter-spacing: 0;
        }

        .enetice-phone-frame {
          position: relative;
          width: min(56%, 245px);
          height: 480px;
          margin: 4px auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          object-fit: cover;
          object-position: center top;
        }

        .enetice-store-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .enetice-store-row img {
          height: 42px;
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
          width: 132px;
          max-width: 48%;
          height: auto;
          object-fit: contain;
          margin-bottom: 20px;
        }

        .enetice-form-panel h1 {
          margin: 0 0 8px;
          font-size: clamp(34px, 2.5vw, 40px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: 0;
          color: #0b1d34;
        }

        .enetice-subtitle {
          max-width: 560px;
          margin: 0 0 26px;
          color: #475569;
          font-size: 18px;
          line-height: 1.42;
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
          margin-bottom: 24px;
        }

        .enetice-choice {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #101828;
          font-size: 16px;
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
          margin-bottom: 18px;
          position: relative;
        }

        .enetice-field > label,
        .enetice-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #344054;
          font-size: 17px;
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
          height: 62px;
          border: 1px solid #1f2937;
          border-radius: 4px;
          background: #ffffff;
          color: ${NAVY};
          font: 500 18px/1.2 ${FONT};
          padding: 0 48px 0 16px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          box-sizing: border-box;
        }

        .enetice-input::placeholder {
          color: #d8dbe0;
          font-weight: 700;
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
          gap: 20px;
          margin-top: 0;
        }

        .enetice-date-grid .enetice-field {
          margin-bottom: 18px;
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
          height: 72px;
          border: 0;
          border-radius: 8px;
          background: #a9d7f4;
          color: #ffffff;
          font: 700 21px/1 ${FONT};
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }

        .enetice-submit:not(:disabled) {
          background: #2d98d8;
          box-shadow: 0 10px 20px rgba(45, 152, 216, 0.2);
        }

        .enetice-submit:not(:disabled):hover {
          background: #0e8f96;
          transform: translateY(-1px);
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
          margin-top: 22px;
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
          width: 142px;
        }

        .enetice-partner-strip .tabib-logo {
          width: 118px;
        }

        .enetice-result {
          margin-top: 22px;
          max-width: 720px;
        }

        .enetice-result-card {
          border: 1px solid #c8f3d4;
          border-radius: 12px;
          background: #f0fdf4;
          padding: 15px 18px;
          margin-bottom: 12px;
        }

        .enetice-result-status {
          margin-bottom: 4px;
          color: #15803d;
          font-size: 14px;
          font-weight: 800;
        }

        .enetice-result-name {
          color: ${NAVY};
          font-size: 18px;
          font-weight: 800;
        }

        .enetice-result-id {
          margin-top: 2px;
          color: #667085;
          font-size: 13px;
          font-weight: 600;
        }

        .enetice-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
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
          font: 800 14px/1 ${FONT};
          padding: 12px;
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
            width: min(250px, 70%);
            max-width: 250px;
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

          .enetice-store-row img {
            height: 34px;
          }

          .enetice-form-logo {
            width: 124px;
            margin-bottom: 14px;
          }

          .enetice-form-panel h1 {
            font-size: 28px;
          }

          .enetice-subtitle {
            font-size: 16px;
            margin-bottom: 22px;
          }

          .enetice-choice-row,
          .enetice-date-grid,
          .enetice-actions,
          .enetice-result-grid {
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
            font-size: 15px;
          }

          .enetice-input {
            height: 48px;
            font-size: 16px;
          }

          .enetice-actions {
            gap: 18px;
          }

          .enetice-tooltip {
            width: min(320px, calc(100vw - 40px));
            font-size: 17px;
            padding: 18px 20px;
          }

          .enetice-submit {
            width: 100%;
            height: 54px;
            font-size: 18px;
          }

          .enetice-partner-strip {
            justify-content: center;
            gap: 28px;
          }
        }
      `}</style>

      <div className="enetice-shell">
        <aside className="enetice-promo" aria-label="Aslan Medical mobil tətbiqi">
          <h2>Tətbiqdən istifadə edərək, laborator analizlərinizin nəticələrini onlayn rejimdə əldə edə bilərsiniz</h2>

          <div className="enetice-phone-frame">
            <img src={ASSETS.phone} alt="Aslan Medical mobil tətbiq ekranı" />
          </div>

          <div className="enetice-store-row" aria-label="Mobil tətbiq keçidləri">
            <img src={ASSETS.googlePlay} alt="Google Play" />
            <img src={ASSETS.appStore} alt="App Store" />
          </div>
        </aside>

        <main className="enetice-form-panel">
          <img className="enetice-form-logo" src={ASSETS.logo} alt="Aslan Medical Center" />

          <h1>Laborator analiz nəticələri</h1>
          <p className="enetice-subtitle">Aşağıdakı xanaları dolduraraq analiz nəticələrinizi yoxlaya bilərsiniz</p>

          {error && <div className="enetice-error">{error}</div>}

          <form className="enetice-form" onSubmit={handleSearch}>
            <div className="enetice-choice-row" role="radiogroup" aria-label="Axtarış metodu">
              <label className={`enetice-choice ${searchMode === 'fin' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="enetice-search-mode"
                  value="fin"
                  checked={searchMode === 'fin'}
                  onChange={() => setSearchMode('fin')}
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
                  onChange={() => setSearchMode('birth')}
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

            <div className="enetice-date-grid">
              <div className="enetice-field" data-info-root>
                <div className="enetice-label-row">
                  <label htmlFor="enetice-start-date">Başlanğıc tarix</label>
                  <InfoButton
                    label="Başlanğıc tarix barədə məlumat"
                    onClick={() => setTooltip((current) => (current === 'start' ? null : 'start'))}
                  />
                </div>
                {tooltip === 'start' && <div className="enetice-tooltip" role="tooltip">{START_DATE_HINT}</div>}
                <input
                  id="enetice-start-date"
                  className="enetice-input"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="enetice-field" data-info-root>
                <div className="enetice-label-row">
                  <label htmlFor="enetice-end-date">Son tarix</label>
                  <InfoButton
                    label="Son tarix barədə məlumat"
                    onClick={() => setTooltip((current) => (current === 'end' ? null : 'end'))}
                  />
                </div>
                {tooltip === 'end' && <div className="enetice-tooltip" role="tooltip">{END_DATE_HINT}</div>}
                <input
                  id="enetice-end-date"
                  className="enetice-input"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            {dateRangeError && <div className="enetice-date-error">{dateRangeError}</div>}

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

          {result && (
            <div className="enetice-result">
              <div className="enetice-result-card">
                <div className="enetice-result-status">✓ {t('eNetice.foundTitle')}</div>
                <div className="enetice-result-name">{result.fullName}</div>
                <div className="enetice-result-id">ID: {result.patientId}</div>
              </div>

              <div className="enetice-result-grid">
                <div className="enetice-mini-card">
                  <div className="enetice-mini-label">{t('eNetice.bloodGroup')}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: result.bloodGroup ? '#dc2626' : '#9ca3af' }}>
                    {result.bloodGroup || '—'}
                  </div>
                </div>
                <div className="enetice-mini-card">
                  <div className="enetice-mini-label">{t('eNetice.allergies')}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                    {result.allergies?.length ? result.allergies.join(', ') : t('eNetice.noAllergies')}
                  </div>
                </div>
              </div>

              {result.medicalHistory?.length > 0 && (
                <div className="enetice-history">
                  <div className="enetice-history-title">{t('eNetice.medHistory')}</div>
                  <div className="enetice-history-list">
                    {result.medicalHistory.map((history, index) => (
                      <div key={index} className="enetice-history-item">
                        <span style={{ fontWeight: 700, color: NAVY }}>{history.condition}</span>
                        {history.notes && <span style={{ color: '#98a2b3' }}> — {history.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="enetice-reset" type="button" onClick={reset}>
                Yeni Sorğu
              </button>
            </div>
          )}
        </main>
      </div>

      {modal && <InfoModal type={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
