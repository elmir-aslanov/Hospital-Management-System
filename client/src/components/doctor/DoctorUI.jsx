// Shared minimal UI primitives for the Doctor Panel.

export const C = {
  bg:      '#F4F7FA',
  sidebar: '#071B2E',
  teal:    '#168C96',
  tealDim: '#e6f7f8',
  navy:    '#10233E',
  sub:     '#64748B',
  border:  '#E2E8F0',
  white:   '#FFFFFF',
  rowHover:'#F8FAFC',
}

// ── Toolbar: title + optional right slot ──────────────────────────────────────
export function Toolbar({ title, count, right, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Raleway',sans-serif" }}>{title}</h2>
        {count !== undefined && (
          <span style={{ background: C.tealDim, color: C.teal, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{count}</span>
        )}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
  )
}

// ── Search input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Axtar...', width = 360 }) {
  return (
    <div style={{ position: 'relative', width, maxWidth: '100%' }}>
      <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px 8px 34px', fontSize: 13,
          border: `1px solid ${C.border}`, borderRadius: 8,
          background: C.white, color: '#334155', outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = C.teal}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
const BADGE_MAP = {
  scheduled:   { bg: '#fef9c3', color: '#854d0e', label: 'Gözləyir'    },
  waiting:     { bg: '#fef9c3', color: '#854d0e', label: 'Gözləmədə'   },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'Davam edir'  },
  completed:   { bg: '#dcfce7', color: '#166534', label: 'Tamamlandı'  },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
  missed:      { bg: '#f3f4f6', color: '#374151', label: 'Buraxıldı'   },
  active:      { bg: '#dcfce7', color: '#166534', label: 'Aktiv'       },
  pending:     { bg: '#fef9c3', color: '#854d0e', label: 'Gözləyir'    },
  reviewed:    { bg: '#dbeafe', color: '#1e40af', label: 'Baxıldı'     },
  normal:      { bg: '#dcfce7', color: '#166534', label: 'Normal'      },
  abnormal:    { bg: '#fee2e2', color: '#991b1b', label: 'Anormal'     },
  archived:    { bg: '#f3f4f6', color: '#374151', label: 'Arxivləşdirilib' },
  superseded:  { bg: '#f3f4f6', color: '#374151', label: 'Əvəzlənib'   },
  draft:       { bg: '#f3f4f6', color: '#475569', label: 'Qaralama'    },
  submitted:   { bg: '#fef9c3', color: '#854d0e', label: 'Baxılır'     },
  approved:    { bg: '#dcfce7', color: '#166534', label: 'Təsdiqlənib' },
  returned:    { bg: '#fee2e2', color: '#991b1b', label: 'Geri qaytarılıb' },
  pending_patient: { bg: '#fef9c3', color: '#854d0e', label: 'Pasiyenti gözləyir' },
  signed:          { bg: '#dcfce7', color: '#166534', label: 'İmzalanıb' },
  declined:        { bg: '#fee2e2', color: '#991b1b', label: 'Rədd edilib' },
}

export function Badge({ status, label }) {
  const s = BADGE_MAP[status] || { bg: '#f3f4f6', color: '#374151', label: status || '—' }
  return (
    <span style={{
      display: 'inline-block',
      background: s.bg, color: s.color,
      borderRadius: 6, padding: '3px 10px',
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }} aria-label={label ?? s.label}>
      {label ?? s.label}
    </span>
  )
}

// ── Table container card ──────────────────────────────────────────────────────
export function TableCard({ children }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12,
      border: `1px solid ${C.border}`, overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

// ── Table header row ──────────────────────────────────────────────────────────
export function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
        {cols.map(c => (
          <th key={c} style={{
            padding: '11px 16px', textAlign: 'left',
            fontWeight: 600, color: C.sub, fontSize: 11.5,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>{c}</th>
        ))}
      </tr>
    </thead>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyRow({ colSpan, text, subText }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub }}>{text}</div>
        {subText && <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>{subText}</div>}
      </td>
    </tr>
  )
}

// ── Modal shell ───────────────────────────────────────────────────────────────
export function Modal({ title, onClose, width = 480, children }) {
  // Escape key
  if (typeof document !== 'undefined') {
    // attached in effect inside callers; here just export the shell
  }
  return (
    <div
      role="dialog" aria-modal="true" aria-label={title}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(7,27,46,0.55)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: C.white, borderRadius: 12, width, maxWidth: '100%',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Bağla"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: 22, lineHeight: 1, padding: '0 2px',
              borderRadius: 4,
            }}
          >×</button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 22px', flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────────────
export function Field({ label, required, children, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type = 'text', disabled, onKeyDown, autoFocus }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      onKeyDown={onKeyDown} autoFocus={autoFocus}
      style={{
        width: '100%', padding: '9px 12px', fontSize: 13,
        border: `1px solid ${C.border}`, borderRadius: 8,
        outline: 'none', boxSizing: 'border-box',
        background: disabled ? '#f8fafc' : C.white,
        color: disabled ? C.sub : '#1e293b',
      }}
      onFocus={e => !disabled && (e.target.style.borderColor = C.teal)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  )
}

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{
        width: '100%', padding: '9px 12px', fontSize: 13,
        border: `1px solid ${C.border}`, borderRadius: 8,
        outline: 'none', boxSizing: 'border-box',
        resize: 'vertical', fontFamily: 'inherit',
      }}
      onFocus={e => (e.target.style.borderColor = C.teal)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const styles = {
    error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534' },
  }
  const s = styles[type] || styles.error
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: '9px 13px',
      fontSize: 13, color: s.color,
    }}>{children}</div>
  )
}

// ── Primary / ghost button ────────────────────────────────────────────────────
export function PrimaryBtn({ onClick, disabled, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#94a3b8' : C.teal,
      color: 'white', border: 'none', borderRadius: 8,
      padding: '9px 18px', fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</button>
  )
}

export function GhostBtn({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: C.white, color: '#374151',
      border: `1px solid ${C.border}`, borderRadius: 8,
      padding: '9px 16px', fontSize: 13, fontWeight: 500,
      cursor: 'pointer',
      ...style,
    }}>{children}</button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <>
      <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.teal, borderRadius: '50%', animation: 'dr-spin 0.8s linear infinite' }} />
      <style>{`@keyframes dr-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

// ── Avatar circle ─────────────────────────────────────────────────────────────
export function Avatar({ name, size = 36, fontSize = 14 }) {
  const initial = (name || '?')[0].toUpperCase()
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#168C96,#1aaabb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize, fontWeight: 700, flexShrink: 0,
    }}>{initial}</div>
  )
}
