import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const TEAL_HOVER = '#0E8F96'
const NAVY = '#0B1D34'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'
function resolveImage(src) {
  if (!src) return null
  if (typeof src === 'object') src = src.url || src.secure_url || src.path || ''
  if (!src) return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${BACKEND}${src}`
  return src
}

const getDoctorName      = (d) => d.userId?.fullName || d.fullName || d.name || 'Həkim'
const getDoctorImage     = (d) => resolveImage(d.image || d.userId?.photoUrl || d.photoUrl || d.photo)
const getDoctorSpecialty = (d) => d.specialization || d.specialty || ''
const getDoctorDeptId    = (d) => d.departmentId?._id || d.departmentId

export default function DepartmentDetailPage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()

  const [dept, setDept]       = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  usePageTitle(dept?.name || 'Şöbə', dept?.description || 'Tibbi mərkəzimizin şöbəsi haqqında məlumat.')

  useEffect(() => {
    setLoading(true)
    setError(false)
    setDept(null)
    api.get(`/departments/${slug}`)
      .then(res => {
        const data = res.data?.data ?? res.data
        if (!data) throw new Error('not found')
        setDept(data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!dept?._id) return
    api.get('/doctors/public/all')
      .then(res => {
        const data = res.data?.data ?? res.data
        const all = Array.isArray(data) ? data : []
        setDoctors(all.filter(d => String(getDoctorDeptId(d)) === String(dept._id)))
      })
      .catch(() => {})
  }, [dept])

  const hasContact = dept && (dept.phone || dept.fax || dept.room)

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${NAVY} 100%)`, padding: '90px 0' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.08,
            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 64px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            opacity: 0.06, right: -120, top: -120, width: 360, height: 360,
            borderRadius: '50%', border: '40px solid #ffffff',
          }}
        />

        <div className="relative px-4" style={{ maxWidth: 1320, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] mb-10 text-white/80">
            <a href="/" className="hover:underline text-white/80">Ana Səhifə</a>
            <span className="text-white/50">›</span>
            <Link to="/departments" className="hover:underline text-white/80">Şöbələr</Link>
            <span className="text-white/50">›</span>
            <span className="text-white">{dept?.name || '...'}</span>
          </nav>

          {/* Title */}
          <h1 className="text-center text-4xl md:text-5xl font-light text-white">
            {loading ? 'Yüklənir...' : (dept?.name || 'Şöbə tapılmadı')}
          </h1>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="px-4" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 16px 80px' }}>

          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#64748B', marginBottom: 16 }}>Bu şöbə tapılmadı.</p>
              <Link to="/departments" className="text-sm hover:underline" style={{ color: TEAL }}>← Bütün şöbələr</Link>
            </div>
          )}

          {!error && loading && (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '60px 0' }}>Yüklənir...</p>
          )}

          {!error && !loading && dept && (
            <>
              {/* Description */}
              {dept.description && (
                <p className="text-[15px] leading-relaxed mb-8" style={{ color: '#334155', maxWidth: 800 }}>
                  {dept.description}
                </p>
              )}

              {/* Contact card */}
              {hasContact && (
                <div className="bg-white rounded-lg p-6 mb-12" style={{ border: '1px solid #E2E8F0', maxWidth: 480 }}>
                  <h2 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Əlaqə məlumatları</h2>
                  <div className="text-[14px] leading-[1.9]" style={{ color: '#334155' }}>
                    {dept.phone && <div>Tel: {dept.phone}</div>}
                    {dept.fax   && <div>Faks: {dept.fax}</div>}
                    {dept.room  && <div>Otaq: {dept.room}</div>}
                  </div>
                </div>
              )}

              {/* Doctors */}
              {doctors.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-light mb-6" style={{ color: NAVY }}>Şöbə həkimləri</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {doctors.map(doc => {
                      const photo = getDoctorImage(doc)
                      const name  = getDoctorName(doc)
                      const spec  = getDoctorSpecialty(doc)
                      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
                      return (
                        <div key={doc._id} className="rounded-lg p-5 text-center" style={{ border: '1px solid #E2E8F0' }}>
                          {photo ? (
                            <img src={photo} alt={name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold" style={{ background: TEAL }}>
                              {initials}
                            </div>
                          )}
                          <div className="text-[15px] font-semibold" style={{ color: NAVY }}>{name}</div>
                          {spec && <div className="text-[13px] mt-1" style={{ color: '#64748B' }}>{spec}</div>}
                          <button
                            type="button"
                            onClick={() => navigate(`/randevu?doctorId=${doc._id}`)}
                            className="mt-4 text-sm font-semibold rounded-full px-5 py-2 text-white transition-colors"
                            style={{ background: TEAL }}
                            onMouseEnter={e => { e.currentTarget.style.background = TEAL_HOVER }}
                            onMouseLeave={e => { e.currentTarget.style.background = TEAL }}
                          >
                            Randevu al
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Back link */}
              <Link
                to="/departments"
                className="inline-block text-sm hover:underline"
                style={{ color: TEAL }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL_HOVER }}
                onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
              >
                ← Bütün şöbələr
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
