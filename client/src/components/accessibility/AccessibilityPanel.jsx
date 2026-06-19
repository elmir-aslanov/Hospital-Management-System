import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlignLeftOutlined,
  BgColorsOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  FontSizeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  MenuOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAccessibility } from '../../context/AccessibilityContext'

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const Progress = ({ value }) => (
  <span className="aslan-a11y-progress" aria-hidden="true">
    {[0, 1, 2, 3].map((step) => (
      <span key={step} className={step <= value ? 'is-filled' : ''} />
    ))}
  </span>
)

const FeatureCard = ({
  active,
  icon,
  label,
  onClick,
  progress,
  description,
}) => (
  <button
    type="button"
    className={`aslan-a11y-card ${active ? 'is-active' : ''}`}
    aria-pressed={active}
    aria-label={description ? `${label}. ${description}` : label}
    onClick={onClick}
  >
    {description && (
      <InfoCircleOutlined className="aslan-a11y-card-info" aria-hidden="true" />
    )}
    {active && (
      <span className="aslan-a11y-card-check" aria-hidden="true">
        <CheckOutlined />
      </span>
    )}
    <span className="aslan-a11y-card-icon" aria-hidden="true">{icon}</span>
    <span className="aslan-a11y-card-label">{label}</span>
    {typeof progress === 'number' && <Progress value={progress} />}
  </button>
)

const Toggle = ({ checked, label, onChange }) => (
  <button
    type="button"
    className={`aslan-a11y-switch ${checked ? 'is-checked' : ''}`}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
  >
    <span />
  </button>
)

export default function AccessibilityPanel({ id, open, onClose, triggerRef }) {
  const { t } = useTranslation()
  const { settings, patch, toggle, cycle, reset } = useAccessibility()
  const [infoOpen, setInfoOpen] = useState(false)
  const [placementOpen, setPlacementOpen] = useState(false)
  const panelRef = useRef(null)
  const titleRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const returnTarget = triggerRef.current
    document.body.style.overflow = 'hidden'
    titleRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...(panelRef.current?.querySelectorAll(FOCUSABLE) || [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!event.shiftKey && document.activeElement === titleRef.current) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (returnTarget?.isConnected) returnTarget.focus()
    }
  }, [open, onClose, triggerRef])

  const cards = useMemo(() => {
    const contrastLabels = [
      t('accessibility.features.contrast'),
      t('accessibility.states.highContrast'),
      t('accessibility.states.darkContrast'),
      t('accessibility.states.lightContrast'),
      t('accessibility.states.monochrome'),
    ]
    const cursorLabels = [
      t('accessibility.features.cursor'),
      t('accessibility.states.darkCursor'),
      t('accessibility.states.lightCursor'),
    ]
    const saturationLabels = [
      t('accessibility.features.saturation'),
      t('accessibility.states.lowSaturation'),
      t('accessibility.states.highSaturation'),
      t('accessibility.states.grayscale'),
    ]

    return [
      {
        key: 'contrast',
        active: settings.contrast > 0,
        icon: <BgColorsOutlined />,
        label: contrastLabels[settings.contrast],
        onClick: () => cycle('contrast', 4),
      },
      {
        key: 'highlightLinks',
        active: settings.highlightLinks,
        icon: <LinkOutlined />,
        label: t('accessibility.features.highlightLinks'),
        onClick: () => toggle('highlightLinks'),
      },
      {
        key: 'textSize',
        active: settings.textSize > 0,
        icon: <FontSizeOutlined />,
        label: t('accessibility.features.textSize'),
        progress: settings.textSize,
        onClick: () => cycle('textSize', 3),
      },
      {
        key: 'textSpacing',
        active: settings.textSpacing > 0,
        icon: <span className="aslan-a11y-letter-icon">↔</span>,
        label: t('accessibility.features.textSpacing'),
        progress: settings.textSpacing,
        onClick: () => cycle('textSpacing', 3),
      },
      {
        key: 'animationsPaused',
        active: settings.animationsPaused,
        icon: <PauseCircleOutlined />,
        label: settings.animationsPaused
          ? t('accessibility.states.startAnimations')
          : t('accessibility.features.pauseAnimations'),
        onClick: () => toggle('animationsPaused'),
      },
      {
        key: 'imagesHidden',
        active: settings.imagesHidden,
        icon: <EyeInvisibleOutlined />,
        label: settings.imagesHidden
          ? t('accessibility.states.showImages')
          : t('accessibility.features.hideImages'),
        onClick: () => toggle('imagesHidden'),
      },
      {
        key: 'dyslexia',
        active: settings.dyslexia,
        icon: <span className="aslan-a11y-dyslexia-icon">Df</span>,
        label: t('accessibility.features.dyslexia'),
        description: t('accessibility.dyslexiaHint'),
        onClick: () => toggle('dyslexia'),
      },
      {
        key: 'cursor',
        active: settings.cursor > 0,
        icon: <span className="aslan-a11y-cursor-icon">➤</span>,
        label: cursorLabels[settings.cursor],
        onClick: () => cycle('cursor', 2),
      },
      {
        key: 'tooltips',
        active: settings.tooltips,
        icon: <InfoCircleOutlined />,
        label: t('accessibility.features.tooltips'),
        onClick: () => toggle('tooltips'),
      },
      {
        key: 'lineHeight',
        active: settings.lineHeight > 0,
        icon: <MenuOutlined />,
        label: t('accessibility.features.lineHeight'),
        progress: settings.lineHeight,
        onClick: () => cycle('lineHeight', 3),
      },
      {
        key: 'textAlign',
        active: settings.textAlign > 0,
        icon: <AlignLeftOutlined />,
        label: t('accessibility.features.textAlign'),
        onClick: () => cycle('textAlign', 4),
      },
      {
        key: 'saturation',
        active: settings.saturation > 0,
        icon: <BgColorsOutlined />,
        label: saturationLabels[settings.saturation],
        progress: settings.saturation,
        onClick: () => cycle('saturation', 3),
      },
    ]
  }, [cycle, settings, t, toggle])

  if (!open) return null

  const selectPlacement = (value) => {
    if (value === 'hidden') {
      patch({ widgetVisible: false })
      return
    }
    patch({ widgetPosition: value, widgetVisible: true })
  }

  const placementValue = settings.widgetVisible ? settings.widgetPosition : 'hidden'

  return (
    <div
      className={`aslan-a11y-overlay aslan-a11y-ui is-${settings.widgetPosition}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        id={id}
        ref={panelRef}
        className={`aslan-a11y-panel ${settings.oversized ? 'is-oversized' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="aslan-a11y-panel-header">
          <h2 id={titleId} ref={titleRef} tabIndex="-1">
            {t('accessibility.title')} <span>(CTRL+U)</span>
          </h2>
          <button
            type="button"
            className="aslan-a11y-close"
            onClick={onClose}
            aria-label={t('accessibility.close')}
            title={t('accessibility.close')}
          >
            <CloseOutlined aria-hidden="true" />
          </button>
        </header>

        <div className="aslan-a11y-panel-scroll">
          <button
            type="button"
            className="aslan-a11y-info-button"
            aria-expanded={infoOpen}
            aria-controls={`${id}-description`}
            onClick={() => setInfoOpen((current) => !current)}
          >
            <span className="aslan-a11y-info-icon" aria-hidden="true">
              <InfoCircleOutlined />
            </span>
            <span>{t('accessibility.functions')}</span>
          </button>
          {infoOpen && (
            <p id={`${id}-description`} className="aslan-a11y-description">
              {t('accessibility.description')}
            </p>
          )}

          <div className="aslan-a11y-oversized-row">
            <span>{t('accessibility.oversized')}</span>
            <Toggle
              checked={settings.oversized}
              label={t('accessibility.oversized')}
              onChange={() => toggle('oversized')}
            />
          </div>

          <div className="aslan-a11y-grid">
            {cards.map((card) => <FeatureCard key={card.key} {...card} />)}
          </div>

          <button type="button" className="aslan-a11y-reset" onClick={reset}>
            <ReloadOutlined aria-hidden="true" />
            <span>{t('accessibility.reset')}</span>
          </button>

          <section className="aslan-a11y-placement">
            <button
              type="button"
              className="aslan-a11y-placement-toggle"
              aria-expanded={placementOpen}
              aria-controls={`${id}-placement`}
              onClick={() => setPlacementOpen((current) => !current)}
            >
              <span className="aslan-a11y-settings-icon" aria-hidden="true">
                <SettingOutlined />
              </span>
              <span>{t('accessibility.placement.title')}</span>
              <span className={`aslan-a11y-chevron ${placementOpen ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
            </button>

            {placementOpen && (
              <div id={`${id}-placement`} className="aslan-a11y-placement-options" role="radiogroup" aria-label={t('accessibility.placement.title')}>
                {[
                  ['left', t('accessibility.placement.left')],
                  ['right', t('accessibility.placement.right')],
                  ['hidden', t('accessibility.placement.hide')],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={placementValue === value}
                    className={placementValue === value ? 'is-selected' : ''}
                    onClick={() => selectPlacement(value)}
                  >
                    <span>{label}</span>
                    <span className="aslan-a11y-radio" aria-hidden="true">
                      <span />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}
