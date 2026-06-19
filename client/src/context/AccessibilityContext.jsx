import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'aslanMedicalAccessibility:v2'
const LEGACY_STORAGE_KEY = 'aslanMedicalAccessibility:v1'

const DEFAULT_SETTINGS = Object.freeze({
  contrast: 0,
  highlightLinks: false,
  textSize: 0,
  textSpacing: 0,
  animationsPaused: false,
  imagesHidden: false,
  dyslexia: false,
  cursor: 0,
  tooltips: false,
  lineHeight: 0,
  textAlign: 0,
  saturation: 0,
  oversized: false,
  widgetPosition: 'right',
  widgetVisible: true,
})

const NUMBER_LIMITS = {
  contrast: 4,
  textSize: 3,
  textSpacing: 3,
  cursor: 2,
  lineHeight: 3,
  textAlign: 4,
  saturation: 3,
}

const BOOLEAN_KEYS = [
  'highlightLinks',
  'animationsPaused',
  'imagesHidden',
  'dyslexia',
  'tooltips',
  'oversized',
  'widgetVisible',
]

const AccessibilityContext = createContext(null)

const sanitizeSettings = (candidate) => {
  const safe = { ...DEFAULT_SETTINGS }
  if (!candidate || typeof candidate !== 'object') return safe

  Object.entries(NUMBER_LIMITS).forEach(([key, maximum]) => {
    const value = Number(candidate[key])
    safe[key] = Number.isInteger(value) && value >= 0 && value <= maximum ? value : 0
  })
  BOOLEAN_KEYS.forEach((key) => {
    safe[key] = typeof candidate[key] === 'boolean' ? candidate[key] : DEFAULT_SETTINGS[key]
  })
  safe.widgetPosition = candidate.widgetPosition === 'left' ? 'left' : 'right'
  return safe
}

const readStoredSettings = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    return parsed?.version === 2 ? sanitizeSettings(parsed.settings) : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

const removeLegacyArtifacts = () => {
  const body = document.body
  ;[...body.classList].forEach((className) => {
    if (className.startsWith('am-a11y-')) body.classList.remove(className)
  })
  ;[...body.style].forEach((property) => {
    if (property.startsWith('--am-a11y-')) body.style.removeProperty(property)
  })
  try { window.localStorage.removeItem(LEGACY_STORAGE_KEY) } catch { /* optional storage */ }
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings)
  const skipPersistenceRef = useRef(false)

  useEffect(() => {
    removeLegacyArtifacts()
  }, [])

  useEffect(() => {
    if (skipPersistenceRef.current) {
      skipPersistenceRef.current = false
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, settings }))
    } catch {
      // Preferences are optional and must never prevent the public site from rendering.
    }
  }, [settings])

  useEffect(() => {
    const body = document.body
    const classes = [
      settings.contrast > 0 && `aslan-a11y-contrast-${settings.contrast}`,
      settings.highlightLinks && 'aslan-a11y-highlight-links',
      settings.textSize > 0 && `aslan-a11y-text-size-${settings.textSize}`,
      settings.textSpacing > 0 && `aslan-a11y-text-spacing-${settings.textSpacing}`,
      settings.animationsPaused && 'aslan-a11y-pause-animations',
      settings.imagesHidden && 'aslan-a11y-hide-images',
      settings.dyslexia && 'aslan-a11y-dyslexia',
      settings.cursor > 0 && `aslan-a11y-cursor-${settings.cursor}`,
      settings.tooltips && 'aslan-a11y-tooltips',
      settings.lineHeight > 0 && `aslan-a11y-line-height-${settings.lineHeight}`,
      settings.textAlign > 0 && `aslan-a11y-text-align-${settings.textAlign}`,
      settings.saturation > 0 && `aslan-a11y-saturation-${settings.saturation}`,
    ].filter(Boolean)

    body.classList.add(...classes)

    const media = [...document.querySelectorAll('video, audio')]
    if (settings.animationsPaused) {
      media.forEach((item) => {
        if (!item.paused) {
          item.dataset.aslanA11yWasPlaying = 'true'
          item.pause()
        }
      })
    } else {
      media.forEach((item) => {
        if (item.dataset.aslanA11yWasPlaying === 'true') {
          delete item.dataset.aslanA11yWasPlaying
          item.play().catch(() => {})
        }
      })
    }

    return () => classes.forEach((className) => body.classList.remove(className))
  }, [settings])

  useEffect(() => () => {
    const body = document.body
    ;[...body.classList].forEach((className) => {
      if (className.startsWith('aslan-a11y-')) body.classList.remove(className)
    })
  }, [])

  const patch = useCallback((next) => {
    setSettings((current) => sanitizeSettings({ ...current, ...next }))
  }, [])

  const toggle = useCallback((key) => {
    setSettings((current) => sanitizeSettings({ ...current, [key]: !current[key] }))
  }, [])

  const cycle = useCallback((key, maximum) => {
    setSettings((current) => sanitizeSettings({
      ...current,
      [key]: (current[key] + 1) % (maximum + 1),
    }))
  }, [])

  const reset = useCallback(() => {
    skipPersistenceRef.current = true
    setSettings({ ...DEFAULT_SETTINGS })
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* optional storage */ }
  }, [])

  const value = useMemo(() => ({
    settings,
    patch,
    toggle,
    cycle,
    reset,
  }), [settings, patch, toggle, cycle, reset])

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return context
}
