import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import usePageTitle from '../../hooks/usePageTitle'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'

const HEALTH_CATEGORIES = [
  { name: 'Beyin və Sinir Sistemi', icon: '/icon-Brain-and-Nervous-System.png', slug: 'beyin-ve-sinir-sistemi' },
  { name: 'Uşaq Sağlamlığı', icon: '/icon-Childrens-Health.png', slug: 'usaq-saglamligi' },
  { name: 'İdman və Fitnes', icon: '/icon-Exercise-and-Fitness.png', slug: 'idman-ve-fitnes' },
  { name: 'Ürək Sağlamlığı', icon: '/icon-Heart-Health.png', slug: 'urek-saglamligi' },
  { name: 'Kişi Sağlamlığı', icon: '/icon-Mens-Health.png', slug: 'kisi-saglamligi' },
  { name: 'Psixi Sağlamlıq', icon: '/icon-Mental-Health.png', slug: 'psixi-saglamliq' },
  { name: 'Qidalanma', icon: '/icon-Nutrition.png', slug: 'qidalanma' },
  { name: 'Ortopediya', icon: '/icon-Orthopaedics.png', slug: 'ortopediya' },
  { name: 'İlkin Tibbi Yardım', icon: '/icon-Primary-Care.png', slug: 'ilkin-tibbi-yardim' },
  { name: 'Dəri Baxımı və Gözəllik', icon: '/icon-Skin-Care-Beauty.png', slug: 'deri-baximi-ve-gozellik' },
  { name: 'Sağlam Yaşam', icon: '/icon-Wellness.png', slug: 'saglam-yasam' },
  { name: 'Qadın Sağlamlığı', icon: '/icon-Womens-Health.png', slug: 'qadin-saglamligi' },
]

function HealthCategoriesSection() {
  return (
    <section className="py-16 border-t" style={{ borderColor: '#E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: NAVY, fontFamily: "'Raleway',sans-serif" }}>
          Kəşf etmək üçün sağlamlıq kateqoriyaları
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {HEALTH_CATEGORIES.map(cat => (
            <Link key={cat.slug} to="/blog" className="group flex flex-col items-center text-center">
              <div className="w-full aspect-square bg-sky-50 group-hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] object-contain"
                />
              </div>
              <span
                className="mt-3 text-sm md:text-base underline underline-offset-4 transition-colors"
                style={{ color: TEAL }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0E8F96' }}
                onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogCard({ post, hoveredId, setHoveredId }) {
  const navigate = useNavigate()
  const imgSrc = post.coverImage ?? post.image ?? null

  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      onMouseEnter={() => setHoveredId(post._id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        background: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hoveredId === post._id ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        transform: hoveredId === post._id ? 'translateY(-4px)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ height: 220, background: '#E6F7F8', overflow: 'hidden', flexShrink: 0 }}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        )}
      </div>

      <div style={{ padding: '18px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {post.category && (
          <span style={{
            fontSize: 12, fontWeight: 700, color: TEAL,
            textDecoration: 'underline', fontFamily: FONT,
          }}>
            {post.category}
          </span>
        )}

        <h3 style={{
          margin: 0, fontSize: 16, fontWeight: 700, color: NAVY,
          lineHeight: 1.4, fontFamily: FONT,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{
            margin: 0, fontSize: 13, color: '#64748B', lineHeight: 1.6, fontFamily: FONT,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          {post.readTime && (
            <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: FONT }}>
              {post.readTime} dəq oxu
            </span>
          )}
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 12 }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('az-AZ') : ''}
          </span>
        </div>
      </div>
    </article>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid #E2E8F0',
        borderTopColor: TEAL,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function BlogPage() {
  usePageTitle('Tibbi Blog', 'Sağlamlıq, müalicə və profilaktika üzrə məqalələr.')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Hamısı')
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    api.get('/blog', { params: { limit: 100 } })
      .then(res => {
        const data = res.data?.data ?? res.data ?? {}
        const list = Array.isArray(data) ? data : (data.data ?? [])
        setPosts(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = activeCategory === 'Hamısı' ? posts : posts.filter(p => p.category === activeCategory)

  return (
    <main style={{ background: '#F5F6F8', minHeight: '100vh', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', padding: '48px 32px', textAlign: 'center', marginBottom: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 8px' }}>ASLAN MEDİCAL CENTER</p>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: '0 0 12px', fontFamily: "'Raleway',sans-serif" }}>Tibbi Bloq</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: 0 }}>Sağlamlıq, müalicə və profilaktika üzrə məqalə və yeniliklər.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        {!loading && posts.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {['Hamısı', ...new Set(posts.map(p => p.category).filter(Boolean))].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px', borderRadius: 20,
                  border: `1.5px solid ${activeCategory === cat ? '#00848e' : '#e2e8f0'}`,
                  background: activeCategory === cat ? '#00848e' : 'white',
                  color: activeCategory === cat ? 'white' : '#64748b',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && <Spinner />}

        {!loading && filteredPosts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94A3B8', padding: '80px 0', fontSize: 16 }}>
            Hazırda bloq yazısı yoxdur.
          </p>
        )}

        {!loading && filteredPosts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingBottom: 60 }}>
            {filteredPosts.map((post, i) => (
              <BlogCard key={post._id ?? i} post={post} hoveredId={hoveredId} setHoveredId={setHoveredId} />
            ))}
          </div>
        )}
      </div>

      <HealthCategoriesSection />
    </main>
  )
}
