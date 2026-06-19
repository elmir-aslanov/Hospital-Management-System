import { useAccessibility } from '../../context/AccessibilityContext'

export default function AccessibilityEffects() {
  const { settings, pointerY } = useAccessibility()

  return (
    <>
      {settings.readingMask && (
        <div
          className="am-a11y-reading-mask am-a11y-ui"
          aria-hidden="true"
          style={{ '--am-a11y-pointer-y': `${pointerY}px` }}
        />
      )}
      {settings.readingGuide && (
        <div
          className="am-a11y-reading-guide am-a11y-ui"
          aria-hidden="true"
          style={{ top: pointerY }}
        />
      )}
    </>
  )
}

