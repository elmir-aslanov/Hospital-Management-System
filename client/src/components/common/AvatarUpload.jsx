import { useState, useRef } from 'react'

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'

const getImageDimensions = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    URL.revokeObjectURL(url)
    resolve({ width: img.naturalWidth, height: img.naturalHeight })
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    reject(new Error('Şəkil oxunmadı. Yenidən cəhd edin.'))
  }
  img.src = url
})

export default function AvatarUpload({
  currentUrl,
  userName,
  size = 80,
  onSuccess,
  onFileSelect,
  onValidationChange,
  uploadImmediately = true,
  allowedTypes,
  maxSizeBytes = 5 * 1024 * 1024,
  minWidth,
  minHeight,
  preferSquare = false,
  helperText,
  guidanceText,
  accept = 'image/*',
  previewWidth,
  previewHeight,
  previewRadius = '50%',
  previewObjectPosition = 'center',
  previewBackground = 'transparent',
  previewBorder = '3px solid #e2e8f0',
  placeholderColor = 'white',
}) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [warning,   setWarning]   = useState('')
  const [preview,   setPreview]   = useState(null)
  const inputRef = useRef()

  const token   = localStorage.getItem('adminToken') || localStorage.getItem('token')
  const initial = (userName || '?')[0].toUpperCase()
  const frameWidth = previewWidth || size
  const frameHeight = previewHeight || size

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setWarning('')
    onValidationChange?.({ valid: true, message: '' })

    if (allowedTypes?.length) {
      if (!allowedTypes.includes(file.type)) {
        const message = 'Yalnız JPG və PNG formatları dəstəklənir.'
        setError(message)
        onValidationChange?.({ valid: false, message })
        setPreview(null)
        onFileSelect?.(null)
        return
      }
    } else if (!file.type.startsWith('image/')) {
      const message = 'Yalnız şəkil faylı qəbul edilir'
      setError(message)
      onValidationChange?.({ valid: false, message })
      setPreview(null)
      onFileSelect?.(null)
      return
    }

    if (file.size > maxSizeBytes) {
      const message = maxSizeBytes <= 2 * 1024 * 1024 ? 'Şəkil ölçüsü 2MB-dan böyük ola bilməz.' : 'Fayl 5MB-dan böyük ola bilməz'
      setError(message)
      onValidationChange?.({ valid: false, message })
      setPreview(null)
      onFileSelect?.(null)
      return
    }

    try {
      if (minWidth || minHeight || preferSquare) {
        const dimensions = await getImageDimensions(file)
        if ((minWidth && dimensions.width < minWidth) || (minHeight && dimensions.height < minHeight)) {
          const message = 'Şəkil çox kiçikdir. Minimum ölçü 600x600 px olmalıdır.'
          setError(message)
          onValidationChange?.({ valid: false, message })
          setPreview(null)
          onFileSelect?.(null)
          return
        }
        if (preferSquare && dimensions.width !== dimensions.height) {
          setWarning('Şəkil kvadrat deyil. Daha yaxşı görünüş üçün 600x600 px kvadrat şəkil yükləyin.')
        }
      }
    } catch (e) {
      setError(e.message)
      onValidationChange?.({ valid: false, message: e.message })
      setPreview(null)
      onFileSelect?.(null)
      return
    }
    if (!file.type.startsWith('image/')) { setError('Yalnız şəkil faylı qəbul edilir'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('Fayl 5MB-dan böyük ola bilməz'); return }

    setError('')
    onValidationChange?.({ valid: true, message: '' })
    setPreview(URL.createObjectURL(file))
    if (!uploadImmediately) {
      onFileSelect?.(file)
      return
    }
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await fetch(`${BASE}/api/v1/users/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Yükləmə xətası')
      const url = data.data?.photoUrl || data.photoUrl
      if (onSuccess) onSuccess(url)
    } catch (e) {
      setError(e.message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const imgSrc = preview || currentUrl || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Avatar circle */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: frameWidth, height: frameHeight, borderRadius: previewRadius,
          background: imgSrc ? previewBackground : (previewBackground === 'transparent' ? 'linear-gradient(135deg,#00848e,#0a1628)' : previewBackground),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          position: 'relative', overflow: 'hidden',
          border: previewBorder,
          transition: 'border-color 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#00848e' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: previewObjectPosition }} />
        ) : (
          <span style={{ fontSize: size * 0.38, fontWeight: 700, color: placeholderColor }}>{initial}</span>
        )}

        {/* Hover overlay */}
        {!uploading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        )}

        {/* Spinner overlay */}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        style={{
          fontSize: 11, fontWeight: 600, color: '#00848e',
          background: 'none', border: '1px solid #00848e',
          borderRadius: 8, padding: '4px 12px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? 'Yüklənir...' : 'Şəkil dəyiş'}
      </button>

      {error && (
        <span style={{ fontSize: 11, color: '#dc2626', textAlign: 'center', maxWidth: 240 }}>{error}</span>
      )}

      {warning && !error && (
        <span style={{ fontSize: 11, color: '#b45309', textAlign: 'center', maxWidth: 260, lineHeight: 1.35 }}>{warning}</span>
      )}

      {helperText && (
        <span style={{ fontSize: 11, color: '#64748B', textAlign: 'center', maxWidth: 280, lineHeight: 1.45 }}>{helperText}</span>
      )}

      {guidanceText && (
        <span style={{ fontSize: 11, color: '#1D8B95', textAlign: 'center', maxWidth: 280, lineHeight: 1.45 }}>{guidanceText}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0])}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
