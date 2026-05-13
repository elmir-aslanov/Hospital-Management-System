export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><div className="skel" style={{ height: 14, borderRadius: 4, background: 'var(--em-slate-100)', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
      ))}
    </tr>
  );
}

export function SkeletonKpi() {
  return (
    <div className="kpi">
      <div className="kpi-head">
        <div className="skel" style={{ height: 12, width: 100, borderRadius: 4, background: 'var(--em-slate-100)' }} />
      </div>
      <div className="skel" style={{ height: 32, width: 80, borderRadius: 4, background: 'var(--em-slate-100)', margin: '12px 0 8px' }} />
      <div className="skel" style={{ height: 12, width: 120, borderRadius: 4, background: 'var(--em-slate-100)' }} />
    </div>
  );
}

export function ErrorCard({ message }) {
  return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 20px', color: '#991B1B', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
      <span>⚠</span> {message}
    </div>
  );
}
