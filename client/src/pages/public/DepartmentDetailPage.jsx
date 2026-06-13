import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { fadeUp } from '../../utils/animations'

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
const getDoctorDeptId    = (d) => d.departmentId?._id || d.departmentId

const isHtml = (str) => /<[a-z][\s\S]*>/i.test(str || '')

const replaceLegacyBranding = (value) => {
  if (typeof value !== 'string') return value
  return value
    .replace(/\bLIV BONA DEA HOSPITAL BAK[ÜU]\b/gi, 'ASLAN MEDICAL CENTER, BAKI')
    .replace(/\bLiv Bona Dea Hospital Bak[üu]\b/gi, 'Aslan Medical Center, Bakı')
    .replace(/\bLiv Bona Dea Hospital\b/gi, 'Aslan Medical Center')
    .replace(/\bLiv Bona Dea\b/gi, 'Aslan Medical Center')
    .replace(/\bLiv\b/g, 'Aslan Medical')
    .replace(/\bLIV\b/g, 'ASLAN MEDICAL')
}

const getDoctorSpecialty = (d) => replaceLegacyBranding(d.specialization || d.specialty || '')

const CARDIOLOGY_CONTENT = {
  name: 'Kardiologiya şöbəsi',
  heroSubtitle: 'Aslan Medical Center-in Kardiologiya şöbəsində ürək-damar sistemi xəstəliklərinin müasir diaqnostikası, müalicəsi və profilaktikası təcrübəli həkimlər tərəfindən həyata keçirilir.',
  aboutHeading: 'Kardiologiyada hansı xidmətlər göstərilir?',
  aboutBody: [
    'Aslan Medical Center-in Kardiologiya şöbəsində ürək və damar xəstəliklərinin diaqnostikası, müalicəsi və izlənməsi həyata keçirilir. Şöbədə arterial hipertenziya, işemik ürək xəstəliyi, ürək ritm pozuntuları, ürək çatışmazlığı və digər kardioloji problemlərin qiymətləndirilməsi aparılır.',
    'Müasir tibbi yanaşmalar və diaqnostik üsullar vasitəsilə pasiyentlərə elektrokardioqramma (EKQ), exokardioqrafiya, Holter monitorinqi, təzyiq nəzarəti, laborator müayinələr və digər müvafiq xidmətlər göstərilir. Məqsəd ürək sağlamlığını vaxtında qiymətləndirmək, riskləri azaltmaq və pasiyent üçün ən uyğun müalicə planını müəyyən etməkdir.',
  ].join('\n\n'),
  contentSections: [
    {
      title: 'Kardiologiyaya nə zaman müraciət etmək lazımdır?',
      body: [
        'Sinə nahiyəsində ağrı, təngnəfəslik, ürəkdöyünmə, arterial təzyiqin yüksəlməsi, tez yorulma, başgicəllənmə, ayaqlarda şişkinlik və ya ürək ritmində dəyişiklik kimi hallar olduqda kardioloqa müraciət etmək vacibdir.',
        'Eyni zamanda ailəsində ürək-damar xəstəlikləri olan şəxslər, diabet, piylənmə, yüksək xolesterin və ya hipertoniya riski daşıyan pasiyentlər mütəmadi kardioloji müayinədən keçməlidirlər. Erkən diaqnostika ürək-damar xəstəliklərinin qarşısının alınmasında və effektiv müalicəsində mühüm rol oynayır.',
      ].join('\n\n'),
    },
    {
      title: 'Niyə Aslan Medical Center Kardiologiya şöbəsi?',
      body: 'Aslan Medical Center-də kardioloji yanaşma pasiyentin fərdi vəziyyətinə uyğun qurulur. Müasir avadanlıq, peşəkar tibbi heyət və sistemli izləmə sayəsində pasiyentlərə etibarlı və keyfiyyətli xidmət təqdim olunur.',
    },
  ],
}

const isCardiologyDepartment = (dept, slug) => {
  const values = [slug, dept?.slug, dept?.name].filter(Boolean).join(' ').toLowerCase()
  return values.includes('kardiolog') || values.includes('cardiolog') || values.includes('kardio')
}

const sanitizeSections = (sections) =>
  Array.isArray(sections)
    ? sections.map(section => ({
      ...section,
      title: replaceLegacyBranding(section.title),
      body: replaceLegacyBranding(section.body),
    }))
    : []

const buildDepartmentViewModel = (data, slug) => {
  const sanitized = {
    ...data,
    name: replaceLegacyBranding(data.name),
    description: replaceLegacyBranding(data.description),
    contentSections: sanitizeSections(data.contentSections),
  }

  if (!isCardiologyDepartment(data, slug)) return sanitized

  return {
    ...sanitized,
    name: CARDIOLOGY_CONTENT.name,
    heroSubtitle: CARDIOLOGY_CONTENT.heroSubtitle,
    aboutHeading: CARDIOLOGY_CONTENT.aboutHeading,
    description: CARDIOLOGY_CONTENT.aboutBody,
    contentSections: CARDIOLOGY_CONTENT.contentSections,
  }
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

export default function DepartmentDetailPage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()

  const [deptState, setDeptState] = useState({ slug: null, data: null, error: false })
  const [doctors, setDoctors]     = useState([])

  const dept = deptState.slug === slug ? deptState.data : null
  const loading = deptState.slug !== slug
  const error = deptState.slug === slug && deptState.error

  usePageTitle(dept?.name || 'Şöbə', dept?.heroSubtitle || dept?.description || 'Tibbi mərkəzimizin şöbəsi haqqında məlumat.')

  useEffect(() => {
    let ignore = false

    api.get(`/departments/${slug}`)
      .then(res => {
        const data = res.data?.data ?? res.data
        if (!data) throw new Error('not found')
        if (!ignore) {
          setDeptState({ slug, data: buildDepartmentViewModel(data, slug), error: false })
        }
      })
      .catch(() => {
        if (!ignore) {
          setDeptState({ slug, data: null, error: true })
        }
      })

    return () => { ignore = true }
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
  const heroSubtitle = dept?.heroSubtitle || dept?.description
  const aboutHeading = dept?.aboutHeading || 'Haqqında'
  const relatedDoctors = dept?._id
    ? doctors.filter(d => String(getDoctorDeptId(d)) === String(dept._id))
    : []

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

        <motion.div
          className="relative px-4"
          style={{ maxWidth: 1320, margin: '0 auto' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] mb-10 text-white/80">
            <a href="/" className="hover:underline text-white/80">Ana Səhifə</a>
            <span className="text-white/50">›</span>
            <Link to="/departments" className="hover:underline text-white/80">Şöbələr</Link>
            <span className="text-white/50">›</span>
            <span className="text-white">{dept?.name || '...'}</span>
          </nav>

          {/* Title */}
          <h1 className="text-center text-4xl md:text-5xl font-light text-white" style={{ textAlign: 'center' }}>
            {loading ? 'Yüklənir...' : (dept?.name || 'Şöbə tapılmadı')}
          </h1>

          {/* Subtitle */}
          {!loading && heroSubtitle && (
            <p
              className="text-base text-white/80"
              style={{
                maxWidth: 760,
                width: '100%',
                margin: '16px auto 0',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {heroSubtitle}
            </p>
          )}
        </motion.div>
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
              <div className="flex flex-col md:flex-row gap-10">

                {/* LEFT — Doctors sidebar */}
                <motion.aside
                  className="w-full md:w-[34%] md:sticky md:top-24 self-start"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <h2 className="text-lg font-semibold mb-4" style={{ color: TEAL }}>Əlaqədar Həkimlər</h2>

                  {relatedDoctors.length > 0 ? (
                    <div className="overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
                      {relatedDoctors.map(doc => {
                        const photo = getDoctorImage(doc)
                        const name  = getDoctorName(doc)
                        const spec  = getDoctorSpecialty(doc)
                        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
                        return (
                          <div key={doc._id} className="flex items-center gap-4 py-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
                            {photo ? (
                              <img src={photo} alt={name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-semibold" style={{ background: TEAL }}>
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              {spec && <div className="text-xs uppercase tracking-wide truncate" style={{ color: '#64748B' }}>{spec}</div>}
                              <div className="text-base font-semibold truncate" style={{ color: NAVY }}>{name}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(`/randevu?doctorId=${doc._id}`)}
                              className="flex-shrink-0 whitespace-nowrap text-[15px] font-semibold rounded px-3.5 py-1.5 text-white transition-colors"
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
                  ) : (
                    <p className="text-sm" style={{ color: '#64748B' }}>Bu şöbə üzrə həkim tapılmadı.</p>
                  )}
                </motion.aside>

                {/* RIGHT — Content */}
                <motion.div
                  className="w-full md:w-[66%]"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {dept.updatedAt && (
                    <div className="text-right text-xs mb-4" style={{ color: '#64748B' }}>
                      Son yenilənmə: {formatDate(dept.updatedAt)}
                    </div>
                  )}

                  {/* Description */}
                  {dept.description && (
                    <div className="mb-8">
                      <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>{aboutHeading}</h2>
                      {isHtml(dept.description) ? (
                        <div
                          className="text-[15px] leading-relaxed [&_p]:mb-4"
                          style={{ color: '#334155' }}
                          dangerouslySetInnerHTML={{ __html: dept.description }}
                        />
                      ) : (
                        dept.description.split(/\n+/).filter(Boolean).map((para, i) => (
                          <p key={i} className="text-[15px] leading-relaxed mb-4" style={{ color: '#334155' }}>
                            {para}
                          </p>
                        ))
                      )}
                    </div>
                  )}

                  {/* Additional content sections */}
                  {dept.contentSections?.filter(s => s.title || s.body).map((section, i) => (
                    <div key={i} className="mt-8">
                      {section.title && (
                        <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>{section.title}</h2>
                      )}
                      {section.body && (
                        isHtml(section.body) ? (
                          <div
                            className="text-sm leading-relaxed [&_p]:mb-4"
                            style={{ color: '#475569' }}
                            dangerouslySetInnerHTML={{ __html: section.body }}
                          />
                        ) : (
                          section.body.split(/\n+/).filter(Boolean).map((para, j) => (
                            <p key={j} className="text-sm leading-relaxed mb-4" style={{ color: '#475569' }}>
                              {para}
                            </p>
                          ))
                        )
                      )}
                    </div>
                  ))}

                  {/* Contact card */}
                  {hasContact && (
                    <div className="bg-white rounded-lg p-6 mb-8" style={{ border: '1px solid #E2E8F0', maxWidth: 480 }}>
                      <h2 className="text-base font-bold mb-3" style={{ color: NAVY }}>Əlaqə məlumatları</h2>
                      <div className="text-[14px] leading-[1.9]" style={{ color: '#334155' }}>
                        {dept.phone && <div>Tel: {dept.phone}</div>}
                        {dept.fax   && <div>Faks: {dept.fax}</div>}
                        {dept.room  && <div>Otaq: {dept.room}</div>}
                      </div>
                    </div>
                  )}

                  {/* Back link */}
                  <Link
                    to="/departments"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline mt-2 transition-transform duration-200 hover:scale-105"
                    style={{ color: TEAL }}
                    onMouseEnter={e => { e.currentTarget.style.color = TEAL_HOVER }}
                    onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Bütün şöbələr
                  </Link>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
