import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AccessibilityPanel from './AccessibilityPanel'
import AccessibilityEffects from './AccessibilityEffects'
import './accessibility.css'

export default function AccessibilityWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target
      const isTyping = target instanceof HTMLElement && (
        target.matches('input, textarea, select') || target.isContentEditable
      )
      if (isTyping || !event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.key.toLowerCase() !== 'u') return
      event.preventDefault()
      setOpen((current) => !current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <div className={`am-a11y-trigger-wrap am-a11y-ui ${open ? 'is-hidden' : ''}`}>
        <span role="tooltip">{t('accessibility.tooltip')}</span>
        <button
          ref={triggerRef}
          type="button"
          className="am-a11y-trigger"
          onClick={() => setOpen(true)}
          aria-label={t('accessibility.tooltip')}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2.2" />
            <path d="M4 8.5c2.6 1.1 5.2 1.6 8 1.6s5.4-.5 8-1.6" />
            <path d="M12 10v10" />
            <path d="m8 21 4-6 4 6" />
          </svg>
        </button>
      </div>
      <AccessibilityPanel open={open} onClose={close} triggerRef={triggerRef} />
      <AccessibilityEffects />
    </>
  )
}
