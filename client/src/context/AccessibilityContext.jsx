import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'aslanMedicalAccessibility:v1'

const DEFAULTS = {
  modes: { epilepsy: false, visual: false, cognitive: false, attention: false },
  visualMode: '',
  readableFont: false,
  dyslexiaFont: false,
  highlightHeadings: false,
  highlightLinks: false,
  magnifier: false,
  textScale: 100,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: '',
  hideImages: false,
  cursor: '',
  readingMask: false,
  readingGuide: false,
  focusHighlight: false,
  stopAnimations: false,
  keyboardNavigation: false,
  background: '',
}

const MODE_PRESETS = {
  epilepsy: { stopAnimations: true },
  visual: {
    visualMode: 'high-contrast',
    textScale: 120,
    highlightLinks: true,
    focusHighlight: true,
    cursor: 'dark',
  },
  cognitive: {
    readableFont: true,
    highlightHeadings: true,
    highlightLinks: true,
    lineHeight: 1.8,
    letterSpacing: 0.05,
    stopAnimations: true,
  },
  attention: {
    readingMask: true,
    focusHighlight: true,
    stopAnimations: true,
  },
}

const AccessibilityContext = createContext(null)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const hasActiveSettings = (settings) => (
  Object.values(settings.modes).some(Boolean)
  || settings.visualMode
  || settings.readableFont
  || settings.dyslexiaFont
  || settings.highlightHeadings
  || settings.highlightLinks
  || settings.magnifier
  || settings.textScale !== DEFAULTS.textScale
  || settings.lineHeight !== DEFAULTS.lineHeight
  || settings.letterSpacing !== DEFAULTS.letterSpacing
  || settings.textAlign
  || settings.hideImages
  || settings.cursor
  || settings.readingMask
  || settings.readingGuide
  || settings.focusHighlight
  || settings.stopAnimations
  || settings.keyboardNavigation
  || settings.background
)

const readStoredSettings = () => {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!parsed || parsed.version !== 1 || typeof parsed.settings !== 'object') return DEFAULTS
    return {
      ...DEFAULTS,
      ...parsed.settings,
      modes: { ...DEFAULTS.modes, ...(parsed.settings.modes || {}) },
      textScale: clamp(Number(parsed.settings.textScale) || 100, 80, 160),
      lineHeight: clamp(Number(parsed.settings.lineHeight) || 1.5, 1.2, 2.2),
      letterSpacing: clamp(Number(parsed.settings.letterSpacing) || 0, 0, 0.15),
    }
  } catch {
    return DEFAULTS
  }
}

const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function AccessibilityProvider({ children }) {
  const location = useLocation()
  const [settings, setSettings] = useState(readStoredSettings)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const skipNextPersistenceRef = useRef(false)
  const [pointerY, setPointerY] = useState(() => (
    typeof window === 'undefined' ? 0 : window.innerHeight / 2
  ))

  useEffect(() => {
    if (skipNextPersistenceRef.current) {
      skipNextPersistenceRef.current = false
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, settings }))
    } catch {
      // Accessibility preferences are optional; storage failures must not break the site.
    }
  }, [settings])

  useEffect(() => {
    const body = document.body
    const classes = [
      hasActiveSettings(settings) && 'am-a11y-active',
      settings.stopAnimations && 'am-a11y-stop-motion',
      settings.readableFont && 'am-a11y-readable-font',
      settings.dyslexiaFont && 'am-a11y-dyslexia-font',
      settings.highlightHeadings && 'am-a11y-headings',
      settings.highlightLinks && 'am-a11y-links',
      settings.magnifier && 'am-a11y-magnifier',
      settings.hideImages && 'am-a11y-hide-images',
      settings.focusHighlight && 'am-a11y-focus',
      settings.keyboardNavigation && 'am-a11y-keyboard',
      settings.cursor === 'dark' && 'am-a11y-cursor-dark',
      settings.cursor === 'light' && 'am-a11y-cursor-light',
      settings.visualMode && `am-a11y-visual-${settings.visualMode}`,
      settings.textAlign && `am-a11y-align-${settings.textAlign}`,
      settings.background && `am-a11y-bg-${settings.background}`,
    ].filter(Boolean)

    body.classList.add(...classes)
    body.style.setProperty('--am-a11y-text-scale', String(settings.textScale / 100))
    body.style.setProperty('--am-a11y-line-height', String(settings.lineHeight))
    body.style.setProperty('--am-a11y-letter-spacing', `${settings.letterSpacing}em`)

    const media = document.querySelectorAll('video, audio')
    if (settings.stopAnimations) {
      media.forEach((item) => {
        if (!item.paused) {
          item.dataset.amA11yWasPlaying = 'true'
          item.pause()
        }
      })
    }

    return () => {
      classes.forEach((className) => body.classList.remove(className))
      body.style.removeProperty('--am-a11y-text-scale')
      body.style.removeProperty('--am-a11y-line-height')
      body.style.removeProperty('--am-a11y-letter-spacing')
    }
  }, [settings])

  useEffect(() => {
    if (!settings.readingMask && !settings.readingGuide) return undefined
    const updatePointer = (event) => setPointerY(event.clientY)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [settings.readingMask, settings.readingGuide])

  useEffect(() => {
    stopSpeech()
    queueMicrotask(() => setIsSpeaking(false))
  }, [location.pathname])

  useEffect(() => () => stopSpeech(), [])

  const patch = useCallback((next) => {
    setSettings((current) => ({ ...current, ...next }))
  }, [])

  const toggle = useCallback((key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  const toggleMode = useCallback((mode) => {
    setSettings((current) => {
      const enabled = !current.modes[mode]
      const preset = MODE_PRESETS[mode]
      const disabledPreset = Object.fromEntries(
        Object.keys(preset).map((key) => [key, DEFAULTS[key]])
      )
      return {
        ...current,
        ...(enabled ? preset : disabledPreset),
        modes: { ...current.modes, [mode]: enabled },
      }
    })
  }, [])

  const setVisualMode = useCallback((visualMode) => {
    setSettings((current) => ({
      ...current,
      visualMode: current.visualMode === visualMode ? '' : visualMode,
    }))
  }, [])

  const setCursor = useCallback((cursor) => {
    setSettings((current) => ({ ...current, cursor: current.cursor === cursor ? '' : cursor }))
  }, [])

  const setBackground = useCallback((background) => {
    setSettings((current) => ({
      ...current,
      background: current.background === background ? '' : background,
    }))
  }, [])

  const reset = useCallback(() => {
    stopSpeech()
    setIsSpeaking(false)
    skipNextPersistenceRef.current = true
    setSettings(DEFAULTS)
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
  }, [])

  const speakText = useCallback((text, language, onUnsupported) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      onUnsupported?.()
      return false
    }
    const safeText = String(text || '').trim().slice(0, 12000)
    if (!safeText) return false
    stopSpeech()
    const utterance = new SpeechSynthesisUtterance(safeText)
    utterance.lang = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ'
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
    return true
  }, [])

  const stopReading = useCallback(() => {
    stopSpeech()
    setIsSpeaking(false)
  }, [])

  const value = useMemo(() => ({
    settings,
    patch,
    toggle,
    toggleMode,
    setVisualMode,
    setCursor,
    setBackground,
    reset,
    speakText,
    stopReading,
    isSpeaking,
    pointerY,
  }), [
    settings, patch, toggle, toggleMode, setVisualMode, setCursor,
    setBackground, reset, speakText, stopReading, isSpeaking, pointerY,
  ])

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
