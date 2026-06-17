import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import usePageTitle from '../../hooks/usePageTitle'
import { blogCategories, blogPosts, popularPosts } from '../../data/blogData'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY = '#0B1D34'
const TEAL = '#1D8B95'
const TEAL_DARK = '#0E8F96'
const PAGE_BG = '#F5F6F8'
const BORDER = '#E2E8F0'
const MUTED = '#64748B'
const TEXT = '#334155'
const POSTS_PER_PAGE = 6

const tabs = [
  { label: 'Xəbərlər', filter: () => true },
  { label: 'Məqalələr', filter: () => true },
  {
    label: 'Həkim tövsiyələri',
    filter: post => ['Kardiologiya', 'Endokrinologiya', 'Pediatriya', 'Dermatologiya', 'Ginekologiya', 'Qadın sağlamlığı'].includes(post.category),
  },
  { label: 'Profilaktika', filter: post => post.category === 'Profilaktika' },
  { label: 'Daha çox', filter: () => true },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

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
        <img src={post.image} alt={post.title} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />
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

function RelatedTopics({ onSelectTopic }) {
  const topics = ['Kardiologiya', 'Laboratoriya', 'Profilaktika', 'Endokrinologiya', 'Pediatriya', 'Qadın sağlamlığı']

  return (
    <section className="sidebar-widget related-topics" aria-labelledby="related-topics-title">
      <div className="widget-head">
        <h2 id="related-topics-title">Əlaqəli mövzular</h2>
        <button type="button" onClick={() => onSelectTopic(null)}>Hamısı</button>
      </div>

      <div className="topic-list">
        {topics.map(topic => {
          const count = blogPosts.filter(post => post.category === topic).length
          return (
            <article key={topic} className="topic-item">
              <div>
                <h3>{topic}</h3>
                <p>{count || 0} məqalə · 5 dəq əvvəl yeniləndi</p>
              </div>
              <button type="button" onClick={() => onSelectTopic(topic)}>Bax</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function BlogSidebar({ onSelectTopic }) {
  const navigate = useNavigate()
  const spotlight = blogPosts.find(post => post.slug === 'check-up-muayinesi-niye-vacibdir') || blogPosts[0]

  return (
    <aside className="blog-sidebar" aria-label="Blog yan paneli">
      <RelatedTopics onSelectTopic={onSelectTopic} />

      <section className="sidebar-widget appointment-widget">
        <h2>Randevu almaq istəyirsiniz?</h2>
        <p>Onlayn müraciət edin və ya bizimlə əlaqə saxlayın. Komandamız uyğun həkim və xidmət seçiminizdə sizə kömək edəcək.</p>
        <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
      </section>

      <section className="sidebar-widget spotlight-widget">
        <h2>Seçilmiş məqalə</h2>
        <Link to={`/blog/${spotlight.slug}`} className="spotlight-link">
          <img src={spotlight.image} alt={spotlight.title} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />
          <strong>{spotlight.title}</strong>
          <span>Daha çox oxu</span>
        </Link>
      </section>

      <section className="sidebar-widget trust-widget">
        <h2>Etibarlı tibbi məlumat</h2>
        <ul>
          <li>Həkim nəzarətində hazırlanmış məzmun</li>
          <li>Maarifləndirici və praktik tövsiyələr</li>
          <li>Pasiyentlər üçün aydın izahlar</li>
        </ul>
        <a href="#blog-results">Məqalələrə bax</a>
      </section>

    </aside>
  )
}

export default function BlogListingPage() {
  usePageTitle('Aslan Medical Tibbi Blog', 'Sağlamlıq, profilaktika, müayinə və müalicə mövzularında həkim tövsiyələri və maarifləndirici yazılar.')

  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Xəbərlər')
  const [topicFilter, setTopicFilter] = useState(null)
  const [page, setPage] = useState(1)
  const leadPost = blogPosts[0]

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const tab = tabs.find(item => item.label === activeTab) || tabs[0]

    return blogPosts
      .filter(post => tab.filter(post))
      .filter(post => !topicFilter || post.category === topicFilter)
      .filter(post => {
        if (!q) return true
        return (
          post.title.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  }, [activeTab, query, topicFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const visiblePosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handleTabClick = (label) => {
    setActiveTab(label)
    setTopicFilter(null)
    setPage(1)
  }

  const handleTopicClick = (topic) => {
    setActiveTab('Xəbərlər')
    setTopicFilter(topic)
    setPage(1)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
  }

  return (
    <main className="blog-page" style={{ fontFamily: FONT }}>
      <div className="blog-container blog-layout">
        <section className="blog-main-panel">
          <header className="blog-profile-card">
            <div className="profile-title-row">
              <h1>Aslan Medical Tibbi Blog</h1>
              <button type="button" onClick={() => handleTabClick('Xəbərlər')}>Bütün məqalələr</button>
            </div>

            <div className="profile-intro">
              <img src={leadPost.image} alt="Aslan Medical blog" loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />
              <div>
                <p>
                  Aslan Medical bloqunda sağlamlıq, profilaktika, müayinə və müalicə mövzularında
                  həkimlərimizin tövsiyələrini və maarifləndirici yazıları oxuya bilərsiniz.
                </p>
                <div className="blog-meta-line">
                  <LockIcon />
                  <span>Açıq tibbi maarifləndirmə bloqu</span>
                </div>
              </div>
            </div>
          </header>

          <nav className="blog-tabs" aria-label="Blog bölmələri">
            {tabs.map(tab => (
              <button
                key={tab.label}
                type="button"
                className={tab.label === activeTab && !topicFilter ? 'active' : ''}
                onClick={() => handleTabClick(tab.label)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

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
                    onChange={event => { setQuery(event.target.value); setPage(1) }}
                    placeholder="Yazılarda axtar..."
                    aria-label="Bloq yazılarında axtarış edin"
                  />
                </label>
                <button type="submit">Axtar</button>
              </form>
            </div>

            <div id="blog-results" className="post-list">
              {visiblePosts.length ? (
                visiblePosts.map((post, index) => <PostRow key={post.id} post={post} index={index} />)
              ) : (
                <div className="empty-state">
                  <SearchIcon />
                  <h3>Məqalə tapılmadı</h3>
                  <p>Axtarış və ya filtr nəticəsinə uyğun yazı mövcud deyil.</p>
                </div>
              )}
            </div>

            {visiblePosts.length ? (
              <nav className="pagination" aria-label="Bloq səhifələri">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(item => (
                  <button key={item} type="button" className={item === page ? 'active' : ''} onClick={() => setPage(item)}>
                    {item}
                  </button>
                ))}
              </nav>
            ) : null}

            <div className="category-strip" aria-label="Blog kateqoriyaları">
              {blogCategories.filter(item => item !== 'Hamısı').slice(0, 8).map(item => (
                <button key={item} type="button" className={item === topicFilter ? 'active' : ''} onClick={() => handleTopicClick(item)}>
                  {item}
                </button>
              ))}
            </div>
          </section>
        </section>

        <BlogSidebar onSelectTopic={handleTopicClick} />
      </div>

      <style>{`
        .blog-page { min-height: 100vh; background: ${PAGE_BG}; color: ${NAVY}; padding: 32px 0 72px; }
        .blog-container { width: min(1440px, calc(100% - 64px)); margin: 0 auto; box-sizing: border-box; }
        .blog-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 28px; align-items: start; }
        .blog-main-panel, .sidebar-widget { background: #fff; border: 1px solid ${BORDER}; box-shadow: 0 10px 28px rgba(15, 23, 42, .05); }
        .blog-main-panel { min-width: 0; }
        .blog-profile-card { padding: 38px 40px 34px; }
        .profile-title-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 24px; margin-bottom: 32px; }
        .profile-title-row h1 { margin: 0; color: #2E333A; font-family: 'Raleway', ${FONT}; font-size: clamp(42px, 4.8vw, 62px); line-height: 1.12; font-weight: 600; letter-spacing: 0; }
        .profile-title-row button, .topic-item button { border: 1px solid ${TEAL}; border-radius: 999px; background: #fff; color: ${TEAL}; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; transition: background .18s, color .18s, border-color .18s; }
        .profile-title-row button { min-width: 154px; height: 42px; padding: 0 18px; }
        .profile-title-row button:hover, .topic-item button:hover { background: ${TEAL}; color: #fff; }
        .profile-intro { display: grid; grid-template-columns: 128px minmax(0, 1fr); gap: 26px; align-items: start; }
        .profile-intro img { width: 128px; height: 128px; object-fit: cover; border-radius: 10px; background: #E6F7F8; }
        .profile-intro p { margin: 2px 0 20px; max-width: 920px; color: ${NAVY}; font-size: 23px; line-height: 1.45; }
        .blog-meta-line { display: inline-flex; align-items: center; gap: 9px; color: ${TEXT}; font-size: 17px; }
        .blog-tabs { display: flex; gap: 0; overflow-x: auto; border-top: 1px solid ${BORDER}; border-bottom: 1px solid ${BORDER}; padding: 0 40px; scrollbar-width: thin; }
        .blog-tabs button { position: relative; flex: 0 0 auto; border: 0; background: transparent; color: #101827; padding: 20px 22px 19px 0; margin-right: 26px; font: inherit; font-size: 18px; font-weight: 800; cursor: pointer; }
        .blog-tabs button::after { content: ''; position: absolute; left: 0; right: 22px; bottom: -1px; height: 2px; background: transparent; }
        .blog-tabs button:hover, .blog-tabs button.active { color: ${TEAL}; }
        .blog-tabs button.active::after { background: ${TEAL}; }
        .newsfeed-card { padding: 40px 40px 44px; }
        .newsfeed-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(330px, 360px); gap: 24px; align-items: start; padding-bottom: 28px; border-bottom: 1px solid ${BORDER}; }
        .newsfeed-head h2 { margin: 0; color: #2E333A; font-family: 'Raleway', ${FONT}; font-size: clamp(34px, 3vw, 42px); line-height: 1.12; font-weight: 600; letter-spacing: 0; }
        .newsfeed-head p { margin: 8px 0 0; color: ${MUTED}; font-size: 15px; }
        .newsfeed-search { display: flex; height: 44px; }
        .newsfeed-search label { min-width: 0; flex: 1; display: flex; align-items: center; gap: 8px; border: 1px solid #CBD5E1; border-right: 0; border-radius: 8px 0 0 8px; padding: 0 13px; color: #94A3B8; background: #fff; }
        .newsfeed-search label:focus-within { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(29, 139, 149, .12); }
        .newsfeed-search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: ${NAVY}; font: inherit; font-size: 16px; }
        .newsfeed-search button { width: 104px; border: 1px solid ${TEAL}; border-radius: 0 18px 18px 0; background: ${TEAL}; color: #fff; font: inherit; font-size: 16px; font-weight: 900; cursor: pointer; }
        .newsfeed-search button:hover { background: ${TEAL_DARK}; border-color: ${TEAL_DARK}; }
        .post-row { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; padding: 32px 0; border-bottom: 1px solid #E5E7EB; }
        .post-row:last-child { border-bottom: 0; }
        .post-image-link { display: block; align-self: start; overflow: hidden; border-radius: 8px; background: #E6F7F8; }
        .post-image-link img { width: 100%; height: 172px; object-fit: cover; object-position: center; display: block; transition: transform .22s; }
        .post-row:hover .post-image-link img { transform: scale(1.035); }
        .post-content { min-width: 0; padding-top: 2px; }
        .post-title { display: inline-block; color: ${NAVY}; text-decoration: none; font-size: clamp(23px, 2vw, 29px); line-height: 1.25; font-weight: 900; letter-spacing: 0; }
        .post-title:hover { color: ${TEAL}; text-decoration: underline; }
        .post-meta { display: flex; flex-wrap: wrap; gap: 9px; margin: 12px 0 12px; color: ${MUTED}; font-size: 15px; line-height: 1.5; }
        .post-meta span + span::before { content: '|'; margin-right: 9px; color: #CBD5E1; }
        .post-content p { margin: 0 0 16px; color: ${TEXT}; font-size: 17px; line-height: 1.62; }
        .read-link { color: ${TEAL}; font-size: 15px; font-weight: 900; text-decoration: none; }
        .read-link:hover { color: ${TEAL_DARK}; text-decoration: underline; }
        .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 34px; }
        .pagination button { width: 40px; height: 40px; border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; color: ${NAVY}; font: inherit; font-weight: 900; cursor: pointer; }
        .pagination button:hover, .pagination button.active { border-color: ${TEAL}; background: ${TEAL}; color: #fff; }
        .empty-state { padding: 58px 24px; text-align: center; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; }
        .empty-state svg { color: ${TEAL}; }
        .empty-state h3 { margin: 14px 0 8px; color: ${NAVY}; font-size: 22px; }
        .category-strip { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 30px; margin-top: 30px; border-top: 1px solid ${BORDER}; }
        .category-strip button { border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; color: ${NAVY}; padding: 9px 14px; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
        .category-strip button:hover, .category-strip button.active { border-color: ${TEAL}; color: ${TEAL}; }
        .blog-sidebar { display: grid; gap: 24px; position: sticky; top: 92px; }
        .sidebar-widget { padding: 24px; }
        .widget-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-bottom: 14px; border-bottom: 1px solid ${BORDER}; }
        .sidebar-widget h2, .widget-head h2 { margin: 0; color: ${NAVY}; font-size: 22px; line-height: 1.25; font-weight: 900; letter-spacing: 0; }
        .widget-head button { border: 0; background: transparent; color: ${TEAL}; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; }
        .widget-head button:hover { text-decoration: underline; }
        .topic-list { display: grid; }
        .topic-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: start; padding: 20px 0; border-bottom: 1px solid ${BORDER}; }
        .topic-item:last-child { border-bottom: 0; padding-bottom: 0; }
        .topic-item h3 { margin: 0 0 8px; color: #030712; font-size: 20px; line-height: 1.25; font-weight: 900; }
        .topic-item p { margin: 0; color: ${MUTED}; font-size: 14px; line-height: 1.5; }
        .topic-item button { min-width: 70px; height: 36px; }
        .appointment-widget p, .trust-widget li { color: ${TEXT}; font-size: 15px; line-height: 1.6; }
        .appointment-widget p { margin: 12px 0 18px; }
        .appointment-widget button { width: 100%; height: 44px; border: 0; border-radius: 10px; background: ${TEAL}; color: #fff; font: inherit; font-weight: 900; cursor: pointer; }
        .appointment-widget button:hover { background: ${TEAL_DARK}; }
        .spotlight-link { display: grid; gap: 12px; color: inherit; text-decoration: none; margin-top: 16px; }
        .spotlight-link img { width: 100%; height: 152px; object-fit: cover; object-position: center; border-radius: 8px; background: #E6F7F8; }
        .spotlight-link strong { color: ${NAVY}; font-size: 18px; line-height: 1.32; }
        .spotlight-link span, .trust-widget a { color: ${TEAL}; font-size: 14px; font-weight: 900; text-decoration: none; }
        .spotlight-link:hover strong, .trust-widget a:hover { color: ${TEAL_DARK}; text-decoration: underline; }
        .trust-widget ul { margin: 14px 0 14px; padding-left: 19px; }
        .popular-list { display: grid; gap: 14px; margin-top: 16px; }
        .popular-item { display: grid; grid-template-columns: 72px 1fr; column-gap: 12px; align-items: center; color: inherit; text-decoration: none; }
        .popular-item img { width: 72px; height: 72px; object-fit: cover; object-position: center; border-radius: 8px; grid-row: span 2; background: #E6F7F8; }
        .popular-item span { color: ${TEAL}; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .popular-item strong { color: ${NAVY}; font-size: 14px; line-height: 1.35; }
        .popular-item:hover strong { color: ${TEAL}; text-decoration: underline; }
        @media (max-width: 1120px) {
          .blog-layout { grid-template-columns: 1fr; }
          .blog-sidebar { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .related-topics { grid-column: 1 / -1; }
        }
        @media (max-width: 820px) {
          .blog-container { width: min(100% - 32px, 1440px); }
          .blog-profile-card, .newsfeed-card { padding: 28px 24px 32px; }
          .profile-title-row, .newsfeed-head { grid-template-columns: 1fr; }
          .profile-intro { grid-template-columns: 112px 1fr; gap: 18px; }
          .profile-intro img { width: 112px; height: 112px; }
          .profile-intro p { font-size: 19px; }
          .blog-tabs { padding: 0 24px; }
          .post-row { grid-template-columns: 240px minmax(0, 1fr); gap: 20px; }
          .post-image-link img { height: 156px; }
          .newsfeed-search { max-width: 100%; }
          .blog-sidebar { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .blog-page { padding: 18px 0 52px; }
          .blog-container { width: min(100% - 24px, 1440px); }
          .blog-profile-card, .newsfeed-card, .sidebar-widget { padding: 22px 16px 26px; }
          .profile-title-row button { width: 100%; }
          .profile-intro, .post-row { grid-template-columns: 1fr; }
          .profile-intro img { width: 118px; height: 118px; }
          .blog-tabs { padding: 0 16px; }
          .blog-tabs button { padding: 18px 18px 17px 0; margin-right: 18px; font-size: 16px; }
          .newsfeed-search { height: auto; display: grid; grid-template-columns: 1fr; }
          .newsfeed-search label { height: 44px; border-right: 1px solid #CBD5E1; border-radius: 8px; }
          .newsfeed-search button { width: 100%; height: 44px; border-radius: 8px; }
          .post-image-link img { height: 210px; }
          .post-meta span + span::before { content: ''; margin-right: 0; }
        }
      `}</style>
    </main>
  )
}
