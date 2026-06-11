import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import usePageTitle from '../../hooks/usePageTitle'
import api from '../../api/axios'
import { BLOG_CATEGORIES, blogCategoryLabel } from '../../data/blogCategories'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'

const POSTS_PER_PAGE = 9

// Maps catalog slugs to the icon filenames already present in /public
const CATEGORY_ICONS = {
  'beyin-ve-sinir-sistemi':  '/icon-Brain-and-Nervous-System.png',
  'usaq-saglamligi':         '/icon-Childrens-Health.png',
  'idman-ve-fitnes':         '/icon-Exercise-and-Fitness.png',
  'urek-saglamligi':         '/icon-Heart-Health.png',
  'kisi-saglamligi':         '/icon-Mens-Health.png',
  'psixi-saglamliq':         '/icon-Mental-Health.png',
  'qidalanma':               '/icon-Nutrition.png',
  'ortopediya':              '/icon-Orthopaedics.png',
  'ilkin-tibbi-yardim':      '/icon-Primary-Care.png',
  'deri-baximi-ve-gozellik': '/icon-Skin-Care-Beauty.png',
  'saglam-yasam':            '/icon-Wellness.png',
  'qadin-saglamligi':        '/icon-Womens-Health.png',
}

function HealthCategoriesSection({ onSelectCategory }) {
  return (
    <section className="py-16 border-t" style={{ borderColor: '#E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: NAVY, fontFamily: "'Raleway',sans-serif" }}>
          Kəşf etmək üçün sağlamlıq kateqoriyaları
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square bg-sky-50 group-hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors">
                <img
                  src={CATEGORY_ICONS[cat.slug]}
                  alt={cat.label}
                  className="w-16 h-16 md:w-[72px] md:h-[72px] object-contain"
                />
              </div>
              <span
                className="mt-3 text-sm md:text-base underline underline-offset-4 transition-colors"
                style={{ color: TEAL }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0E8F96' }}
                onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
              >
                {cat.label}
              </span>
            </button>
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
            {blogCategoryLabel(post.category)}
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
            {(post.publishedAt || post.createdAt) ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('az-AZ') : ''}
          </span>
        </div>
      </div>
    </article>
  )
}

function BlogCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton-block" style={{ height: 220 }} />
      <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton-block" style={{ height: 12, width: '40%', borderRadius: 4 }} />
        <div className="skeleton-block" style={{ height: 16, width: '90%', borderRadius: 4 }} />
        <div className="skeleton-block" style={{ height: 16, width: '70%', borderRadius: 4 }} />
        <div className="skeleton-block" style={{ height: 12, width: '50%', borderRadius: 4, marginTop: 4 }} />
      </div>
      <style>{`
        .skeleton-block { background: linear-gradient(90deg, #E6F7F8 25%, #F1FAFB 37%, #E6F7F8 63%); background-size: 400% 100%; animation: skeleton-pulse 1.4s ease infinite; }
        @keyframes skeleton-pulse { 0% { background-position: 100% 50% } 100% { background-position: 0 50% } }
      `}</style>
    </div>
  )
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const items = Array.from({ length: pages }, (_, i) => i + 1)

  return (
    <nav aria-label="Bloq səhifələri" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            border: `1.5px solid ${item === page ? TEAL : '#E2E8F0'}`,
            background: item === page ? TEAL : '#fff',
            color: item === page ? '#fff' : NAVY,
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT,
          }}
        >
          {item}
        </button>
      ))}
    </nav>
  )
}

export default function BlogPage() {
  usePageTitle('Tibbi Blog', 'Sağlamlıq, müalicə və profilaktika üzrə məqalələr.')

  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('kateqoriya') || ''
  const searchQuery    = searchParams.get('axtar') || ''
  const page           = Math.max(1, parseInt(searchParams.get('page'), 10) || 1)

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [posts, setPosts] = useState([])
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => { setSearchInput(searchQuery) }, [searchQuery])

  useEffect(() => {
    setLoading(true)
    const params = { limit: POSTS_PER_PAGE, page }
    if (activeCategory) params.category = activeCategory
    if (searchQuery)    params.search = searchQuery

    api.get('/blog', { params })
      .then(res => {
        const data = res.data?.data ?? res.data ?? {}
        setPosts(Array.isArray(data) ? data : (data.data ?? []))
        setPages(data.pages ?? 1)
      })
      .catch(() => { setPosts([]); setPages(1) })
      .finally(() => setLoading(false))
  }, [activeCategory, searchQuery, page])

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectCategory = (slug) => {
    updateParams({ kateqoriya: activeCategory === slug ? '' : slug, page: '' })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParams({ axtar: searchInput.trim(), page: '' })
  }

  const handlePageChange = (next) => {
    updateParams({ page: next > 1 ? String(next) : '' })
  }

  return (
    <main style={{ background: '#F5F6F8', minHeight: '100vh', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', padding: '48px 32px', textAlign: 'center', marginBottom: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 8px' }}>ASLAN MEDİCAL CENTER</p>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: '0 0 12px', fontFamily: "'Raleway',sans-serif" }}>Tibbi Bloq</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: 0 }}>Sağlamlıq, müalicə və profilaktika üzrə məqalə və yeniliklər.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Bloqda axtar..."
            aria-label="Bloq yazılarında axtarış"
            style={{
              width: '100%', maxWidth: 420, padding: '10px 16px', borderRadius: 20,
              border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: NAVY,
            }}
          />
          <button type="submit" style={{
            padding: '10px 22px', borderRadius: 20, border: `1.5px solid ${TEAL}`,
            background: TEAL, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Axtar
          </button>
        </form>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          <button onClick={() => handleSelectCategory('')}
            style={{
              padding: '7px 18px', borderRadius: 20,
              border: `1.5px solid ${!activeCategory ? '#00848e' : '#e2e8f0'}`,
              background: !activeCategory ? '#00848e' : 'white',
              color: !activeCategory ? 'white' : '#64748b',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            Hamısı
          </button>
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => handleSelectCategory(cat.slug)}
              style={{
                padding: '7px 18px', borderRadius: 20,
                border: `1.5px solid ${activeCategory === cat.slug ? '#00848e' : '#e2e8f0'}`,
                background: activeCategory === cat.slug ? '#00848e' : 'white',
                color: activeCategory === cat.slug ? 'white' : '#64748b',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {cat.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingBottom: 60 }}>
            {Array.from({ length: POSTS_PER_PAGE }, (_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94A3B8', padding: '80px 0', fontSize: 16 }}>
            {activeCategory || searchQuery ? 'Axtarışınıza uyğun məqalə tapılmadı.' : 'Hazırda bloq yazısı yoxdur.'}
          </p>
        )}

        {!loading && posts.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {posts.map((post, i) => (
                <BlogCard key={post._id ?? i} post={post} hoveredId={hoveredId} setHoveredId={setHoveredId} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onChange={handlePageChange} />
            <div style={{ height: 60 }} />
          </>
        )}
      </div>

      <HealthCategoriesSection onSelectCategory={handleSelectCategory} />
    </main>
  )
}
