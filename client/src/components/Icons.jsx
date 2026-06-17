/* Central SVG icon set used across the dashboard */
const Icons = {
  Search: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  AlertCircle: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Bed: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M2 9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5"/><path d="M2 20v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"/>
      <path d="M2 20h20"/><path d="M2 9h20"/><rect x="6" y="9" width="4" height="4" rx="1"/>
    </svg>
  ),
  Users: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Stethoscope: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  Home: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  LogOut: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronRight: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Plus: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Edit: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  X: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Globe: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),

  /* ── Medical department icons ──────────────────────────────────────────── */
  Heart: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Brain: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  Bone: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>
    </svg>
  ),
  Eye: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Baby: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9 12h.01"/>
      <path d="M15 12h.01"/>
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>
      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>
    </svg>
  ),
  Scan: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  Tooth: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 5.5c-1.5-1-3.5-1.5-5-.5C4.5 6.5 4 10 4 13c0 2.5 1.5 3.5 3 3 1-.3 1.5-1 2-2 .5-1 1-1.5 3-1.5s2.5.5 3 1.5c.5 1 1 1.7 2 2 1.5.5 3-.5 3-3 0-3-.5-6.5-3-8-1.5-1-3.5-.5-5 .5Z"/>
    </svg>
  ),
  Activity: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Syringe: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m18 2 4 4"/>
      <path d="m17 7 3-3"/>
      <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
      <path d="m9 11 4 4"/>
      <path d="m5 19-3 3"/>
      <path d="m14 4 6 6"/>
    </svg>
  ),
  Ear: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/>
      <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0"/>
    </svg>
  ),
  Droplets: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
    </svg>
  ),
  Flask: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 18.39A1 1 0 0 0 5.618 20h12.764a1 1 0 0 0 .898-1.61l-5.069-8.967A2 2 0 0 1 14 8.527V2"/>
      <path d="M8.5 2h7"/>
      <path d="M7 16h10"/>
    </svg>
  ),
  Zap: ({ size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

/* ── Department icon utilities ─────────────────────────────────────────────
   Shared between AdminDepartments and the public DepartmentsPage.
   No new packages required — all icons are plain SVG in this file.
   ───────────────────────────────────────────────────────────────────────── */

export const DEPT_ICON_OPTIONS = [
  { key: 'stethoscope', label: 'Stethoscope — Ümumi / Daxili xəstəliklər' },
  { key: 'heart',       label: 'Heart — Kardiologiya' },
  { key: 'brain',       label: 'Brain — Nevrologiya / Psixiatriya' },
  { key: 'bone',        label: 'Bone — Ortopediya / Travmatologiya' },
  { key: 'eye',         label: 'Eye — Oftalmologiya' },
  { key: 'baby',        label: 'Baby — Pediatriya / Ginekologiya' },
  { key: 'scan',        label: 'Scan — Radiologiya / Diaqnostika' },
  { key: 'tooth',       label: 'Tooth — Stomatologiya' },
  { key: 'activity',    label: 'Activity — Cərrahiyyə / Anesteziologiya' },
  { key: 'syringe',     label: 'Syringe — Onkologiya / İmmunologiya' },
  { key: 'ear',         label: 'Ear — Audiologiya / LOR / Otolarinqologiya' },
  { key: 'droplets',    label: 'Droplets — Urologiya / Nefrologiya' },
  { key: 'flask',       label: 'Flask — Endokrinologiya / Laboratoriya' },
  { key: 'zap',         label: 'Zap — Alqologiya / Ağrı Klinikası / Allergologiya' },
]

// Map legacy emoji values → icon key
const EMOJI_TO_KEY = {
  '🏥': 'stethoscope', '🩺': 'stethoscope',
  '❤️': 'heart', '💖': 'heart', '🫀': 'heart', '♥': 'heart',
  '🧠': 'brain',
  '🦴': 'bone',
  '👁️': 'eye', '👁': 'eye',
  '👶': 'baby',
  '🦷': 'tooth',
  '🔬': 'scan', '📡': 'scan',
  '💉': 'syringe',
  '⚡': 'activity', '📈': 'activity',
}

// Normalize Azerbaijani characters for reliable substring matching
const azNorm = (s) => s.toLowerCase()
  .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o')
  .replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g')

// Guess icon key from department name when no explicit icon key is stored
const nameToKey = (name = '') => {
  const n = azNorm(name)

  // Cardiology
  if (n.includes('kardi'))                                               return 'heart'

  // Neurology / Psychiatry / Psychology / Narcology
  if (n.includes('nevro') || n.includes('neuro')
    || n.includes('psixiat') || n.includes('psixol')
    || n.includes('narkol'))                                              return 'brain'

  // Orthopedics / Traumatology / Rheumatology / Physiotherapy
  if (n.includes('ortop') || n.includes('travmat')
    || n.includes('revmat') || n.includes('fizioter'))                   return 'bone'

  // Ophthalmology
  if (n.includes('oft') || n.includes('goz'))                           return 'eye'

  // Pediatrics / Gynecology / Obstetrics / Neonatology
  if (n.includes('pediat') || n.includes('usaq')
    || n.includes('ginek') || n.includes('mamal')
    || n.includes('neonat') || n.includes('obstet'))                     return 'baby'

  // Radiology / Imaging / MRI / CT / Ultrasound / Endoscopy
  if (n.includes('radio') || n.includes('rentgen')
    || n.includes('diaqnostika') || n.includes('mrt')
    || n.includes('tomograf') || n.includes('endoskop'))                 return 'scan'

  // Dentistry / Stomatology
  if (n.includes('stomat') || n.includes('dis') || n.includes('dental')) return 'tooth'

  // Surgery (all types) / Anesthesiology / Intensive Care
  if (n.includes('cerr') || n.includes('bariatrik')
    || n.includes('anestezi') || n.includes('intensiv')
    || n.includes('plastik') || n.includes('vaskulyar')
    || n.includes('laparoskop'))                                          return 'activity'

  // Audiology / ENT / Otolaryngology / Laryngology / Rhinology
  if (n.includes('lor') || n.includes('otolar') || n.includes('laringo')
    || n.includes('rinolog') || n.includes('audiol')
    || n.includes('esitme') || n.includes('kulak'))                      return 'ear'

  // Urology / Nephrology / Dialysis
  if (n.includes('urol') || n.includes('nefrol') || n.includes('dializ')) return 'droplets'

  // Endocrinology / Diabetes / Thyroid / Metabolism / Laboratory
  if (n.includes('endokrin') || n.includes('diabet')
    || n.includes('tiroid') || n.includes('metabol')
    || n.includes('lab') || n.includes('analiz')
    || n.includes('mikrob') || n.includes('patol')
    || n.includes('histol') || n.includes('biokimya'))                   return 'flask'

  // Algology / Pain Clinic / Allergology
  if (n.includes('alqol') || n.includes('agri')
    || n.includes('allerg') || n.includes('immunal'))                    return 'zap'

  // Dermatology / Venereology
  if (n.includes('dermat') || n.includes('cild')
    || n.includes('venerol') || n.includes('kosmetol'))                  return 'scan'

  // Gastroenterology / Hepatology / Proctology
  if (n.includes('gastro') || n.includes('hepat')
    || n.includes('proktol') || n.includes('kolon'))                     return 'activity'

  // Oncology / Hematology / Chemotherapy / Immunology / Infectious disease
  if (n.includes('onkol') || n.includes('hemato')
    || n.includes('kemot') || n.includes('immunol')
    || n.includes('infeksi') || n.includes('virusol'))                   return 'syringe'

  // Pulmonology / Respiratory / TB / Phthisiology
  if (n.includes('pulmon') || n.includes('ftiziat')
    || n.includes('respirat') || n.includes('agciy')
    || n.includes('bronx') || n.includes('pneum'))                       return 'activity'

  return 'stethoscope'
}

const KEY_TO_COMP = {
  stethoscope:  Icons.Stethoscope,
  heart:        Icons.Heart,
  'heart-pulse': Icons.Heart,
  brain:        Icons.Brain,
  bone:         Icons.Bone,
  eye:          Icons.Eye,
  baby:         Icons.Baby,
  scan:         Icons.Scan,
  tooth:        Icons.Tooth,
  activity:     Icons.Activity,
  syringe:      Icons.Syringe,
  ear:          Icons.Ear,
  droplets:     Icons.Droplets,
  flask:        Icons.Flask,
  zap:          Icons.Zap,
}

/** Resolves an icon value (key string or legacy emoji) to the right SVG component. */
export function DeptIcon({ icon, name, size = 20, color = '#1D8B95', style: extraStyle }) {
  const raw = icon || ''
  const key = EMOJI_TO_KEY[raw] || (KEY_TO_COMP[raw] ? raw : nameToKey(name))
  const Comp = KEY_TO_COMP[key] || Icons.Stethoscope
  return <Comp size={size} style={{ color, flexShrink: 0, ...extraStyle }} />
}

/** Maps an emoji or unknown value to a canonical icon key.
 *  Used when opening the edit modal so the select dropdown shows the right option. */
export function resolveIconKey(raw = '') {
  if (EMOJI_TO_KEY[raw]) return EMOJI_TO_KEY[raw]
  if (KEY_TO_COMP[raw])  return raw
  return 'stethoscope'
}

export default Icons;
