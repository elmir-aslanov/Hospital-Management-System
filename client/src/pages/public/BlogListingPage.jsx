import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import usePageTitle from '../../hooks/usePageTitle'
import { blogCategories, blogPosts, popularPosts } from '../../data/blogData'

const FONT  = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY  = '#0B1D34'
const TEAL  = '#1D8B95'
const TEAL_DARK = '#0E8F96'
const BORDER = '#E2E8F0'
const MUTED  = '#64748B'
const TEXT   = '#334155'
const POSTS_PER_PAGE = 6

const featuredPosts = [
  {
    id: 'f1',
    image: '/blogsekil1.jpeg',
    category: 'Xərçəng Profilaktikası',
    title: 'Xaya xərçənginin xəbərdarlıq əlamətləri hansılardır?',
    excerpt: 'Xayada izah edilməyən şişkinlik, narahatlıq və ya dəyişikliklər nəzərə alınmamalıdır.',
    readTime: 5,
    slug: 'xaya-xercenginin-xeberdarliq-elamétleri',
  },
  {
    id: 'f2',
    image: '/blogsekil2.jpeg',
    category: 'Sidik-Cinsiyyət Sağlamlığı',
    title: 'Sperma sayını artırmaq və kişi fertilliğini yaxşılaşdırmaq üçün nə etməli?',
    excerpt: 'Sağlam qidalanma, çəkini idarə etmə və stressin azaldılması kömək edən əsas üsullardır.',
    readTime: 6,
    slug: 'sperma-sayini-artirmaq',
  },
  {
    id: 'f3',
    image: '/blogsekil3.jpeg',
    category: 'Kişi Sağlamlığı',
    title: 'Erektil disfunksiya haqqında ümumi suallara cavablar',
    excerpt: 'Əksər kişilərin həyatlarının müəyyən dövründə yaşadığı ED haqqında bilməli olduğunuz hər şey.',
    readTime: 7,
    slug: 'erektil-disfunksiya-haqqinda',
  },
]

const tabs = [
  { label: 'Xəbərlər',         filter: () => true },
  { label: 'Məqalələr',        filter: () => true },
  { label: 'Həkim tövsiyələri', filter: post => ['Kardiologiya','Endokrinologiya','Pediatriya','Dermatologiya','Ginekologiya','Qadın sağlamlığı'].includes(post.category) },
  { label: 'Profilaktika',     filter: post => post.category === 'Profilaktika' },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

/* ── Featured post — horizontal card ───────────────────────────────── */
function FeaturedCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{
        display: 'flex', textDecoration: 'none',
        background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8,
        overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(29,139,149,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <img
        src={post.image} alt={post.title}
        style={{ width: 200, height: 160, objectFit: 'cover', flexShrink: 0, display: 'block' }}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT }}>{post.category}</p>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY, lineHeight: 1.35, fontFamily: FONT }}>{post.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: TEXT, lineHeight: 1.55, fontFamily: FONT, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
        <p style={{ margin: 0, fontSize: 12, color: MUTED, fontFamily: FONT }}>{post.readTime} dəq oxu</p>
      </div>
    </Link>
  )
}

/* ── Regular post row ───────────────────────────────────────────────── */
function PostRow({ post, index }) {
  return (
    <motion.article
      className="post-row"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.28, delay: index * 0.03 }}
    >
      <Link to={`/blog/${post.slug}`} className="post-image-link" aria-label={post.title}>
        <img src={post.image} alt={post.title} loading="lazy" onError={ev => { ev.currentTarget.style.display = 'none' }} />
      </Link>
      <div className="post-content">
        <Link to={`/blog/${post.slug}`} className="post-title">{post.title}</Link>
        <div className="post-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.author}</span>
          <span>{post.category}</span>
          <span>{post.readTime}</span>
          {post.comments ? <span>Şərhlər ({post.comments})</span> : null}
        </div>
        <p>{post.excerpt}</p>
        <Link to={`/blog/${post.slug}`} className="read-link">Oxu <span aria-hidden="true">-&gt;</span></Link>
      </div>
    </motion.article>
  )
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
function BlogSidebar({ onSelectTopic }) {
  const navigate  = useNavigate()
  const spotlight = blogPosts.find(p => p.slug === 'check-up-muayinesi-niye-vacibdir') || blogPosts[0]
  const topics    = ['Kardiologiya', 'Laboratoriya', 'Profilaktika', 'Endokrinologiya', 'Pediatriya', 'Qadın sağlamlığı']

  return (
    <aside className="blog-sidebar" aria-label="Blog yan paneli">

      {/* Related topics */}
      <section className="sidebar-widget" aria-labelledby="related-topics-title">
        <div className="widget-head">
          <h2 id="related-topics-title">Əlaqəli mövzular</h2>
          <button type="button" onClick={() => onSelectTopic(null)}>Hamısı</button>
        </div>
        <div className="topic-list">
          {topics.map(topic => {
            const count = blogPosts.filter(p => p.category === topic).length
            return (
              <article key={topic} className="topic-item">
                <div><h3>{topic}</h3><p>{count || 1} məqalə</p></div>
                <button type="button" onClick={() => onSelectTopic(topic)}>Bax</button>
              </article>
            )
          })}
        </div>
      </section>

      {/* Appointment */}
      <section className="sidebar-widget appointment-widget">
        <h2>Randevu almaq istəyirsiniz?</h2>
        <p>Onlayn müraciət edin və ya bizimlə əlaqə saxlayın.</p>
        <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
      </section>

      {/* Spotlight */}
      <section className="sidebar-widget spotlight-widget">
        <h2>Seçilmiş məqalə</h2>
        <Link to={`/blog/${spotlight.slug}`} className="spotlight-link">
          <img src={spotlight.image} alt={spotlight.title} loading="lazy" onError={ev => { ev.currentTarget.style.display = 'none' }} />
          <strong>{spotlight.title}</strong>
          <span>Daha çox oxu</span>
        </Link>
      </section>

      {/* Trust */}
      <section className="sidebar-widget trust-widget">
        <h2>Etibarlı tibbi məlumat</h2>
        <ul>
          <li>Həkim nəzarətində hazırlanmış məzmun</li>
          <li>Maarifləndirici və praktik tövsiyələr</li>
          <li>Pasiyentlər üçün aydın izahlar</li>
        </ul>
        <a href="#blog-results">Məqalələrə bax</a>
      </section>

      {/* Popular */}
      <section className="sidebar-widget popular-widget">
        <h2>Populyar yazılar</h2>
        <div className="popular-list">
          {popularPosts.slice(0, 3).map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="popular-item">
              <img src={post.image} alt={post.title} loading="lazy" onError={ev => { ev.currentTarget.style.display = 'none' }} />
              <span>{post.category}</span>
              <strong>{post.title}</strong>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function BlogListingPage() {
  usePageTitle('Tibbi Bloq', 'Sağlamlıq, müalicə və profilaktika üzrə məqalə və yeniliklər.')

  const [query,       setQuery]       = useState('')
  const [activeTab,   setActiveTab]   = useState('Xəbərlər')
  const [topicFilter, setTopicFilter] = useState(null)
  const [page,        setPage]        = useState(1)

  const filteredPosts = useMemo(() => {
    const q   = query.trim().toLowerCase()
    const tab = tabs.find(t => t.label === activeTab) || tabs[0]
    return blogPosts
      .filter(p => tab.filter(p))
      .filter(p => !topicFilter || p.category === topicFilter)
      .filter(p => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  }, [activeTab, query, topicFilter])

  const totalPages   = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const visiblePosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handleTabClick   = label => { setActiveTab(label); setTopicFilter(null); setPage(1) }
  const handleTopicClick = topic => { setActiveTab('Xəbərlər'); setTopicFilter(topic); setPage(1) }
  const handleSearch     = ev    => { ev.preventDefault(); setPage(1) }

  return (
    <main className="blog-page" style={{ fontFamily: FONT }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', padding: '48px 40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, margin: '0 0 8px', fontFamily: FONT }}>ASLAN MEDİCAL CENTER</p>
        <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 12px', fontFamily: "'Raleway', sans-serif" }}>Tibbi Bloq</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: 0, fontFamily: FONT }}>Sağlamlıq, müalicə və profilaktika üzrə məqalə və yeniliklər.</p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, maxWidth: 1100, margin: '32px auto', padding: '0 24px', boxSizing: 'border-box', alignItems: 'start' }}>

        {/* ── Left: main content ── */}
        <div>

          {/* Featured posts — horizontal cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            {featuredPosts.map(post => <FeaturedCard key={post.id} post={post} />)}
          </div>

          {/* Tabs */}
          <nav className="blog-tabs" aria-label="Blog bölmələri">
            {tabs.map(tab => (
              <button
                key={tab.label} type="button"
                className={tab.label === activeTab && !topicFilter ? 'active' : ''}
                onClick={() => handleTabClick(tab.label)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Posts section */}
          <section className="newsfeed-card" aria-labelledby="newsfeed-title">
            <div className="newsfeed-head">
              <div>
                <h2 id="newsfeed-title">Son yazılar</h2>
                <p>{topicFilter ? `${topicFilter} mövzusunda ` : ''}{filteredPosts.length} yazı göstərilir</p>
              </div>
              <form className="newsfeed-search" onSubmit={handleSearch}>
                <label>
                  <SearchIcon />
                  <input
                    value={query}
                    onChange={ev => { setQuery(ev.target.value); setPage(1) }}
                    placeholder="Yazılarda axtar..."
                    aria-label="Bloq yazılarında axtarış"
                  />
                </label>
                <button type="submit">Axtar</button>
              </form>
            </div>

            <div id="blog-results" className="post-list">
              {visiblePosts.length ? (
                visiblePosts.map((post, i) => <PostRow key={post.id} post={post} index={i} />)
              ) : (
                <div className="empty-state">
                  <SearchIcon />
                  <h3>Məqalə tapılmadı</h3>
                  <p>Axtarış və ya filtr nəticəsinə uyğun yazı mövcud deyil.</p>
                </div>
              )}
            </div>

            {visiblePosts.length > 0 && (
              <nav className="pagination" aria-label="Bloq səhifələri">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} type="button" className={n === page ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
                ))}
              </nav>
            )}

            <div className="category-strip" aria-label="Blog kateqoriyaları">
              {blogCategories.filter(c => c !== 'Hamısı').slice(0, 8).map(c => (
                <button key={c} type="button" className={c === topicFilter ? 'active' : ''} onClick={() => handleTopicClick(c)}>{c}</button>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: sidebar ── */}
        <BlogSidebar onSelectTopic={handleTopicClick} />
      </div>

      <style>{`
        .blog-page { min-height: 100vh; background: #F5F6F8; color: ${NAVY}; }
        .blog-tabs { display: flex; gap: 0; overflow-x: auto; border: 1px solid ${BORDER}; border-radius: 8px 8px 0 0; background: #fff; padding: 0 20px; scrollbar-width: thin; }
        .blog-tabs button { position: relative; flex: 0 0 auto; border: 0; background: transparent; color: #101827; padding: 18px 20px 17px 0; margin-right: 22px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
        .blog-tabs button::after { content: ''; position: absolute; left: 0; right: 22px; bottom: -1px; height: 2px; background: transparent; }
        .blog-tabs button:hover, .blog-tabs button.active { color: ${TEAL}; }
        .blog-tabs button.active::after { background: ${TEAL}; }
        .newsfeed-card { background: #fff; border: 1px solid ${BORDER}; border-top: 0; border-radius: 0 0 8px 8px; padding: 28px 28px 32px; }
        .newsfeed-head { display: grid; grid-template-columns: minmax(0,1fr) minmax(280px,320px); gap: 20px; align-items: start; padding-bottom: 24px; border-bottom: 1px solid ${BORDER}; }
        .newsfeed-head h2 { margin: 0; color: #2E333A; font-family: 'Raleway', ${FONT}; font-size: 18px; font-weight: 700; }
        .newsfeed-head p  { margin: 6px 0 0; color: ${MUTED}; font-size: 14px; }
        .newsfeed-search  { display: flex; height: 40px; }
        .newsfeed-search label { min-width: 0; flex: 1; display: flex; align-items: center; gap: 8px; border: 1px solid #CBD5E1; border-right: 0; border-radius: 8px 0 0 8px; padding: 0 12px; color: #94A3B8; background: #fff; }
        .newsfeed-search label:focus-within { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(29,139,149,.12); }
        .newsfeed-search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: ${NAVY}; font: inherit; font-size: 14px; }
        .newsfeed-search button { width: 88px; border: 1px solid ${TEAL}; border-radius: 0 8px 8px 0; background: ${TEAL}; color: #fff; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
        .newsfeed-search button:hover { background: ${TEAL_DARK}; border-color: ${TEAL_DARK}; }
        .post-row { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 24px; padding: 28px 0; border-bottom: 1px solid #E5E7EB; }
        .post-row:last-child { border-bottom: 0; }
        .post-image-link { display: block; overflow: hidden; border-radius: 8px; background: #E6F7F8; }
        .post-image-link img { width: 100%; height: 152px; object-fit: cover; display: block; transition: transform .22s; }
        .post-row:hover .post-image-link img { transform: scale(1.035); }
        .post-content { min-width: 0; padding-top: 2px; }
        .post-title { display: inline-block; color: ${NAVY}; text-decoration: none; font-size: 15px; line-height: 1.3; font-weight: 600; }
        .post-title:hover { color: ${TEAL}; text-decoration: underline; }
        .post-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; color: ${MUTED}; font-size: 13px; }
        .post-meta span + span::before { content: '|'; margin-right: 8px; color: #CBD5E1; }
        .post-content p { margin: 0 0 14px; color: ${TEXT}; font-size: 14px; line-height: 1.6; }
        .read-link { color: ${TEAL}; font-size: 13px; font-weight: 700; text-decoration: none; }
        .read-link:hover { color: ${TEAL_DARK}; text-decoration: underline; }
        .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 28px; }
        .pagination button { width: 36px; height: 36px; border: 1px solid ${BORDER}; border-radius: 50%; background: #fff; color: ${NAVY}; font: inherit; font-weight: 700; cursor: pointer; }
        .pagination button:hover, .pagination button.active { border-color: ${TEAL}; background: ${TEAL}; color: #fff; }
        .empty-state { padding: 48px 20px; text-align: center; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; }
        .empty-state h3 { margin: 12px 0 6px; color: ${NAVY}; font-size: 18px; }
        .category-strip { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 24px; margin-top: 24px; border-top: 1px solid ${BORDER}; }
        .category-strip button { border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; color: ${NAVY}; padding: 7px 13px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .category-strip button:hover, .category-strip button.active { border-color: ${TEAL}; color: ${TEAL}; }
        .blog-sidebar { display: grid; gap: 20px; position: sticky; top: 92px; }
        .sidebar-widget { background: #fff; border: 1px solid ${BORDER}; border-radius: 8px; padding: 20px; }
        .widget-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid ${BORDER}; }
        .sidebar-widget h2, .widget-head h2 { margin: 0; color: ${NAVY}; font-size: 16px; font-weight: 800; }
        .widget-head button { border: 0; background: transparent; color: ${TEAL}; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
        .widget-head button:hover { text-decoration: underline; }
        .topic-list { display: grid; }
        .topic-item { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; align-items: center; padding: 14px 0; border-bottom: 1px solid ${BORDER}; }
        .topic-item:last-child { border-bottom: 0; padding-bottom: 0; }
        .topic-item h3 { margin: 0 0 3px; color: #030712; font-size: 14px; font-weight: 700; }
        .topic-item p  { margin: 0; color: ${MUTED}; font-size: 12px; }
        .topic-item button { min-width: 52px; height: 30px; border: 1px solid ${TEAL}; border-radius: 999px; background: #fff; color: ${TEAL}; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .topic-item button:hover { background: ${TEAL}; color: #fff; }
        .appointment-widget p { color: ${TEXT}; font-size: 13px; line-height: 1.55; margin: 10px 0 14px; }
        .appointment-widget button { width: 100%; height: 40px; border: 0; border-radius: 8px; background: ${TEAL}; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
        .appointment-widget button:hover { background: ${TEAL_DARK}; }
        .spotlight-link { display: grid; gap: 10px; color: inherit; text-decoration: none; margin-top: 14px; }
        .spotlight-link img { width: 100%; height: 130px; object-fit: cover; border-radius: 6px; background: #E6F7F8; }
        .spotlight-link strong { color: ${NAVY}; font-size: 14px; line-height: 1.35; }
        .spotlight-link span, .trust-widget a { color: ${TEAL}; font-size: 13px; font-weight: 700; text-decoration: none; }
        .spotlight-link:hover strong { color: ${TEAL}; text-decoration: underline; }
        .trust-widget ul { margin: 10px 0; padding-left: 16px; }
        .trust-widget li { color: ${TEXT}; font-size: 13px; line-height: 1.6; }
        .popular-list { display: grid; gap: 12px; margin-top: 14px; }
        .popular-item { display: grid; grid-template-columns: 60px 1fr; column-gap: 10px; align-items: center; color: inherit; text-decoration: none; }
        .popular-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; grid-row: span 2; background: #E6F7F8; }
        .popular-item span { color: ${TEAL}; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .popular-item strong { color: ${NAVY}; font-size: 13px; line-height: 1.3; }
        .popular-item:hover strong { color: ${TEAL}; text-decoration: underline; }
        @media (max-width: 900px) {
          .blog-layout { grid-template-columns: 1fr !important; }
          .blog-sidebar { position: static; }
          .newsfeed-head { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .post-row { grid-template-columns: 1fr; }
          .newsfeed-card { padding: 20px 16px 24px; }
          .blog-tabs { padding: 0 16px; }
        }
      `}</style>
    </main>
  )
}
