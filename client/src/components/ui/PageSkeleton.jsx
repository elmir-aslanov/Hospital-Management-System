const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -1000px 0 }
    100% { background-position:  1000px 0 }
  }
`

const skeletonStyle = {
  background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)',
  backgroundSize: '2000px 100%',
  animation: 'shimmer 1.5s infinite linear',
  borderRadius: 8,
}

export function SkeletonBox({ width = '100%', height = 16, style = {} }) {
  return <div style={{ ...skeletonStyle, width, height, borderRadius: 8, ...style }} />
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #f1f5f9' }}>
      <SkeletonBox height={20} width="60%" style={{ marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={12}
          width={i === lines - 1 ? '40%' : '100%'}
          style={{ marginBottom: 10 }}
        />
      ))}
      <style>{shimmer}</style>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12, padding: '14px 16px',
        borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} height={12} width="70%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12, padding: '14px 16px',
          borderBottom: r < rows - 1 ? '1px solid #f8fafc' : 'none',
        }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} height={12} width={c === 0 ? '80%' : '60%'} />
          ))}
        </div>
      ))}
      <style>{shimmer}</style>
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }) {
  return (
    <div style={{ ...skeletonStyle, width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
  )
}

export default function PageSkeleton() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{shimmer}</style>
      <SkeletonBox height={28} width="200px" style={{ marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <SkeletonTable rows={6} cols={5} />
    </div>
  )
}
