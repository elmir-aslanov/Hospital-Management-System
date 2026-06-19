import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccessibility } from '../../context/AccessibilityContext'
import AccessibilityPanel from './AccessibilityPanel'
import './accessibility.css'

const PANEL_ID = 'aslan-accessibility-panel'

const isTypingTarget = (target) => target instanceof HTMLElement && (
  target.matches('input, textarea, select') || target.isContentEditable
)

export default function AccessibilityWidget() {
  const { t } = useTranslation()
  const { settings } = useAccessibility()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        isTypingTarget(event.target)
        || !event.ctrlKey
        || event.altKey
        || event.metaKey
        || event.shiftKey
        || event.key.toLowerCase() !== 'u'
      ) return

      event.preventDefault()
      setOpen((current) => !current)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      {settings.widgetVisible && (
        <div
          className={`aslan-a11y-trigger-wrap aslan-a11y-ui is-${settings.widgetPosition} ${open ? 'is-panel-open' : ''}`}
        >
          <span className="aslan-a11y-trigger-tooltip" role="tooltip">
            {t('accessibility.tooltip')}
          </span>
          <button
            ref={triggerRef}
            type="button"
            className="aslan-a11y-trigger"
            onClick={() => setOpen(true)}
            aria-label={t('accessibility.tooltip')}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            aria-haspopup="dialog"
            title={t('accessibility.tooltip')}
          >
            <span className="aslan-a11y-trigger-icon">
              <img src="/newelcatanliq.png" alt={t('accessibility.tooltip')} />
            </span>
          </button>
        </div>
      )}
      <AccessibilityPanel
        id={PANEL_ID}
        open={open}
        onClose={close}
        triggerRef={triggerRef}
      />
    </>
  )
}
