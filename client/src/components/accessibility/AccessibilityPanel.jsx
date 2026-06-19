import { useEffect, useId, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  AudioOutlined,
  BgColorsOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FontSizeOutlined,
  LinkOutlined,
  MenuOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { useAccessibility } from '../../context/AccessibilityContext'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const ToggleCard = ({ active, icon, label, onClick }) => (
  <button type="button" className={`am-a11y-card ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={onClick}>
    <span className="am-a11y-card-icon" aria-hidden="true">{icon}</span>
    <span>{label}</span>
    {active && <CheckOutlined className="am-a11y-check" aria-hidden="true" />}
  </button>
)

const StepControl = ({ label, value, onMinus, onPlus, minusDisabled, plusDisabled }) => (
  <div className="am-a11y-step">
    <span>{label}</span>
    <div>
      <button type="button" onClick={onMinus} disabled={minusDisabled} aria-label={`${label} −`}>−</button>
      <strong>{value}</strong>
      <button type="button" onClick={onPlus} disabled={plusDisabled} aria-label={`${label} +`}>+</button>
    </div>
  </div>
)

export default function AccessibilityPanel({ open, onClose, triggerRef }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const headingRef = useRef(null)
  const titleId = useId()
  const {
    settings, patch, toggle, toggleMode, setVisualMode, setCursor,
    setBackground, reset, speakText, stopReading, isSpeaking,
  } = useAccessibility()

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const triggerElement = triggerRef.current
    document.body.style.overflow = 'hidden'
    headingRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...(panelRef.current?.querySelectorAll(FOCUSABLE) || [])]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (document.activeElement === headingRef.current) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      stopReading()
      triggerElement?.focus()
    }
  }, [open, onClose, stopReading, triggerRef])

  if (!open) return null

  const readSite = () => {
    if (isSpeaking) {
      stopReading()
      return
    }
    const content = document.querySelector('main')?.innerText || ''
    speakText(content, i18n.language, () => toast.error(t('accessibility.messages.speechUnsupported')))
  }

  const readSelection = () => {
    const selection = window.getSelection()?.toString().trim().slice(0, 3000)
    if (!selection) {
      toast.info(t('accessibility.messages.selectText'))
      return
    }
    speakText(selection, i18n.language, () => toast.error(t('accessibility.messages.speechUnsupported')))
  }

  const modes = [
    ['epilepsy', t('accessibility.modes.epilepsy')],
    ['visual', t('accessibility.modes.visual')],
    ['cognitive', t('accessibility.modes.cognitive')],
    ['attention', t('accessibility.modes.attention')],
  ]
  const visuals = [
    ['dark', t('accessibility.visual.dark')],
    ['light', t('accessibility.visual.light')],
    ['monochrome', t('accessibility.visual.monochrome')],
    ['high-contrast', t('accessibility.visual.highContrast')],
    ['low-saturation', t('accessibility.visual.lowSaturation')],
    ['high-saturation', t('accessibility.visual.highSaturation')],
  ]
  const backgrounds = ['navy', 'red', 'orange', 'yellow', 'green', 'purple', 'teal', 'mint', 'black', 'blue']

  return (
    <div className="am-a11y-overlay am-a11y-ui" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <aside ref={panelRef} className="am-a11y-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="am-a11y-panel-header">
          <div>
            <h2 id={titleId} ref={headingRef} tabIndex="-1">{t('accessibility.title')}</h2>
            <span>{t('accessibility.shortcut')}: Ctrl + U</span>
          </div>
          <button type="button" className="am-a11y-close" onClick={onClose} aria-label={t('accessibility.close')}>
            <CloseOutlined aria-hidden="true" />
            <span>{t('accessibility.close')}</span>
          </button>
        </header>

        <div className="am-a11y-panel-body">
          <section>
            <h3>{t('accessibility.sections.modes')}</h3>
            <div className="am-a11y-grid">
              {modes.map(([key, label]) => (
                <ToggleCard key={key} active={settings.modes[key]} label={label} icon={<EyeOutlined />} onClick={() => toggleMode(key)} />
              ))}
            </div>
          </section>

          <section>
            <h3>{t('accessibility.sections.visual')}</h3>
            <div className="am-a11y-grid">
              {visuals.map(([key, label]) => (
                <ToggleCard key={key} active={settings.visualMode === key} label={label} icon={<BgColorsOutlined />} onClick={() => setVisualMode(key)} />
              ))}
            </div>
          </section>

          <section>
            <h3>{t('accessibility.sections.content')}</h3>
            <div className="am-a11y-grid">
              <ToggleCard active={settings.magnifier} label={t('accessibility.content.magnifier')} icon={<FontSizeOutlined />} onClick={() => toggle('magnifier')} />
              <ToggleCard active={settings.readableFont} label={t('accessibility.content.readableFont')} icon={<FontSizeOutlined />} onClick={() => toggle('readableFont')} />
              <ToggleCard active={settings.dyslexiaFont} label={t('accessibility.content.dyslexia')} icon={<FontSizeOutlined />} onClick={() => toggle('dyslexiaFont')} />
              <ToggleCard active={settings.highlightHeadings} label={t('accessibility.content.headings')} icon={<MenuOutlined />} onClick={() => toggle('highlightHeadings')} />
              <ToggleCard active={settings.highlightLinks} label={t('accessibility.content.links')} icon={<LinkOutlined />} onClick={() => toggle('highlightLinks')} />
            </div>

            <div className="am-a11y-steps">
              <StepControl
                label={t('accessibility.content.textSize')}
                value={settings.textScale === 100 ? t('accessibility.standard') : `${settings.textScale}%`}
                onMinus={() => patch({ textScale: Math.max(80, settings.textScale - 10) })}
                onPlus={() => patch({ textScale: Math.min(160, settings.textScale + 10) })}
                minusDisabled={settings.textScale <= 80}
                plusDisabled={settings.textScale >= 160}
              />
              <StepControl
                label={t('accessibility.content.lineHeight')}
                value={settings.lineHeight === 1.5 ? t('accessibility.standard') : settings.lineHeight.toFixed(1)}
                onMinus={() => patch({ lineHeight: Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(1)) })}
                onPlus={() => patch({ lineHeight: Math.min(2.2, +(settings.lineHeight + 0.1).toFixed(1)) })}
                minusDisabled={settings.lineHeight <= 1.2}
                plusDisabled={settings.lineHeight >= 2.2}
              />
              <StepControl
                label={t('accessibility.content.letterSpacing')}
                value={settings.letterSpacing === 0 ? t('accessibility.standard') : `${settings.letterSpacing.toFixed(2)}em`}
                onMinus={() => patch({ letterSpacing: Math.max(0, +(settings.letterSpacing - 0.01).toFixed(2)) })}
                onPlus={() => patch({ letterSpacing: Math.min(0.15, +(settings.letterSpacing + 0.01).toFixed(2)) })}
                minusDisabled={settings.letterSpacing <= 0}
                plusDisabled={settings.letterSpacing >= 0.15}
              />
            </div>

            <div className="am-a11y-alignments" role="group" aria-label={t('accessibility.content.alignment')}>
              {[
                ['left', t('accessibility.content.alignLeft'), <AlignLeftOutlined />],
                ['center', t('accessibility.content.alignCenter'), <AlignCenterOutlined />],
                ['justify', t('accessibility.content.alignJustify'), <MenuOutlined />],
                ['right', t('accessibility.content.alignRight'), <AlignRightOutlined />],
              ].map(([key, label, icon]) => (
                <button key={key} type="button" aria-pressed={settings.textAlign === key}
                  className={settings.textAlign === key ? 'is-active' : ''}
                  onClick={() => patch({ textAlign: settings.textAlign === key ? '' : key })}>
                  <span aria-hidden="true">{icon}</span>{label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>{t('accessibility.sections.reading')}</h3>
            <div className="am-a11y-grid">
              <ToggleCard active={isSpeaking} label={isSpeaking ? t('accessibility.reading.stop') : t('accessibility.reading.readSite')} icon={<AudioOutlined />} onClick={readSite} />
              <ToggleCard active={false} label={t('accessibility.reading.readSelection')} icon={<SoundOutlined />} onClick={readSelection} />
              <ToggleCard active={settings.hideImages} label={t('accessibility.reading.hideImages')} icon={<EyeOutlined />} onClick={() => toggle('hideImages')} />
              <ToggleCard active={settings.cursor === 'dark'} label={t('accessibility.reading.darkCursor')} icon={<MenuOutlined />} onClick={() => setCursor('dark')} />
              <ToggleCard active={settings.cursor === 'light'} label={t('accessibility.reading.lightCursor')} icon={<MenuOutlined />} onClick={() => setCursor('light')} />
              <ToggleCard active={settings.readingMask} label={t('accessibility.reading.mask')} icon={<EyeOutlined />} onClick={() => toggle('readingMask')} />
              <ToggleCard active={settings.readingGuide} label={t('accessibility.reading.guide')} icon={<MenuOutlined />} onClick={() => toggle('readingGuide')} />
              <ToggleCard active={settings.focusHighlight} label={t('accessibility.reading.focus')} icon={<CheckOutlined />} onClick={() => toggle('focusHighlight')} />
              <ToggleCard active={settings.stopAnimations} label={t('accessibility.reading.stopAnimations')} icon={<PauseCircleOutlined />} onClick={() => toggle('stopAnimations')} />
              <ToggleCard active={settings.keyboardNavigation} label={t('accessibility.reading.keyboard')} icon={<MenuOutlined />} onClick={() => toggle('keyboardNavigation')} />
            </div>
          </section>

          <section>
            <h3>{t('accessibility.sections.background')}</h3>
            <div className="am-a11y-colors">
              {backgrounds.map((color) => (
                <button key={color} type="button" className={`am-a11y-color is-${color} ${settings.background === color ? 'is-active' : ''}`}
                  onClick={() => setBackground(color)} aria-pressed={settings.background === color}
                  aria-label={t(`accessibility.colors.${color}`)}>
                  {settings.background === color && <CheckOutlined aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>

          <button type="button" className="am-a11y-wide-card" onClick={() => { onClose(); navigate('/site-map') }}>
            <MenuOutlined aria-hidden="true" /> {t('accessibility.siteMap')}
          </button>

          <button type="button" className="am-a11y-reset" onClick={reset}>
            <ReloadOutlined aria-hidden="true" /> {t('accessibility.reset')}
          </button>

          <p className="am-a11y-copyright">© 2026 Aslan Medical Center. {t('accessibility.rights')}.</p>
        </div>
      </aside>
    </div>
  )
}
