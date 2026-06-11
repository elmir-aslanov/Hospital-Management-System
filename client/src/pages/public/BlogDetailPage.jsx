import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import useSeoMeta from '../../hooks/useSeoMeta'
import api from '../../api/axios'
import { blogCategoryLabel } from '../../data/blogCategories'
import BlogCard from '../../components/blog/BlogCard'
import { cloudinaryResize } from '../../utils/cloudinaryImage'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY = '#0B1D34'
const TEAL = '#1D8B95'
const TEAL_DARK = '#0E8F96'
const PAGE_BG = '#F5F6F8'
const BORDER = '#E2E8F0'
const MUTED = '#64748B'
const TEXT = '#334155'

const AZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
]

// Manual az-AZ formatter (e.g. "10 iyun 2026") — Intl locale data for 'az' is unreliable across runtimes.
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function getAuthorName(author) {
  if (!author) return 'Aslan Medical Center'
  if (typeof author === 'string') return author
  if (author.fullName) return author.fullName
  const name = [author.name, author.surname].filter(Boolean).join(' ')
  return name || 'Aslan Medical Center'
}

function getReviewerName(doctor) {
  const u = doctor?.userId || {}
  return u.fullName || [u.name, u.surname].filter(Boolean).join(' ') || ''
}

const HERO_WIDTHS = [800, 1200, 1600]

function getHeroImageSrcSet(url) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return undefined
  return HERO_WIDTHS.map(w => `${cloudinaryResize(url, w)} ${w}w`).join(', ')
}

// Slugify heading text into an anchor id (mirrors server-side AZ transliteration).
function toAnchorSlug(text) {
  return (text || '')
    .toLowerCase().trim()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o')
    .replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's')
    .replace(/ğ/g, 'g').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Injects unique ids into <h2> headings and returns the heading list for the table of contents.
function withHeadingAnchors(html) {
  if (!html) return { html, headings: [] }
  const headings = []
  const used = new Set()
  const out = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gis, (match, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').trim()
    let id = toAnchorSlug(text) || `bolme-${headings.length + 1}`
    let unique = id
    let i = 2
    while (used.has(unique)) unique = `${id}-${i++}`
    used.add(unique)
    headings.push({ id: unique, text })
    const cleanAttrs = (attrs || '').replace(/\sid="[^"]*"/i, '')
    return `<h2${cleanAttrs} id="${unique}">${inner}</h2>`
  })
  return { html: out, headings }
}

function FacebookIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.56 1.52-3.97 3.85-3.97 1.12 0 2.3.2 2.3.2v2.5h-1.3c-1.27 0-1.67.79-1.67 1.6V12h2.84l-.45 2.91h-2.39v7.04A10 10 0 0 0 22 12z" /></svg>
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.2 8.2L23.3 22h-6.7l-5.2-6.6L5.4 22H2.3l7.7-8.8L1 2h6.9l4.7 6.1L18.9 2zm-1.2 18h1.8L7.4 4H5.5l12.2 16z" /></svg>
}
function LinkedInIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18v-7.5H5.67V18h2.67zM7 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.34 18v-4.2c0-2.25-1.2-3.3-2.8-3.3-1.3 0-1.88.71-2.2 1.21V10.5h-2.67c.04.76 0 7.5 0 7.5h2.67v-4.19c0-.22.02-.45.08-.61.18-.45.6-.92 1.3-.92.92 0 1.29.7 1.29 1.72V18h2.67z" /></svg>
}
function WhatsAppIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3 1 .9-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.2 1.6 2.4 3.8 3.4.5.2.9.4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" /></svg>
}
function LinkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h3v1.6h-3a2.5 2.5 0 0 0 0 5h3V16h-3A4.1 4.1 0 0 1 3.9 12zm6-1h4.2v1.6H9.9V11zm3.1-3.1h3a4.1 4.1 0 0 1 0 8.2h-3V14.5h3a2.5 2.5 0 0 0 0-5h-3V7.9z" /></svg>
}
function CheckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
}

function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <FacebookIcon /> },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, icon: <XIcon /> },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: <LinkedInIcon /> },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: <WhatsAppIcon /> },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="share-row" aria-label="Məqaləni paylaş">
      {links.map(l => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="share-btn" title={l.label} aria-label={`${l.label}-da paylaş`}>
          {l.icon}
        </a>
      ))}
      <button type="button" className="share-btn" onClick={handleCopy} title="Linki kopyala" aria-label="Linki kopyala">
        {copied ? <CheckIcon /> : <LinkIcon />}
      </button>
      {copied && <span className="share-copied">Kopyalandı</span>}
    </div>
  )
}

function TableOfContents({ headings }) {
  if (headings.length < 3) return null

  const handleClick = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="detail-widget toc-widget">
      <h2>Mündəricat</h2>
      <ol>
        {headings.map(h => (
          <li key={h.id}>
            <a href={`#${h.id}`} onClick={e => handleClick(e, h.id)}>{h.text}</a>
          </li>
        ))}
      </ol>
    </section>
  )
}

function RelatedPosts({ category, excludeSlug }) {
  const [posts, setPosts] = useState([])
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    if (!category) return
    api.get('/blog', { params: { category, limit: 4 } })
      .then(res => {
        const data = res.data?.data ?? res.data ?? {}
        const list = Array.isArray(data) ? data : (data.data ?? [])
        setPosts(list.filter(p => p.slug !== excludeSlug).slice(0, 3))
      })
      .catch(() => setPosts([]))
  }, [category, excludeSlug])

  if (posts.length === 0) return null

  return (
    <section className="related-section">
      <h2>Oxşar məqalələr</h2>
      <div className="related-grid">
        {posts.map(post => (
          <BlogCard key={post._id} post={post} hoveredId={hoveredId} setHoveredId={setHoveredId} />
        ))}
      </div>
    </section>
  )
}

function PopularPosts({ excludeSlug }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api.get('/blog', { params: { sort: 'views', limit: 5 } })
      .then(res => {
        const data = res.data?.data ?? res.data ?? {}
        const list = Array.isArray(data) ? data : (data.data ?? [])
        setPosts(list.filter(p => p.slug !== excludeSlug).slice(0, 4))
      })
      .catch(() => setPosts([]))
  }, [excludeSlug])

  if (posts.length === 0) return null

  return (
    <section className="detail-widget popular-widget">
      <h2>Populyar məqalələr</h2>
      <div className="popular-list">
        {posts.map(post => (
          <Link key={post._id} to={`/blog/${post.slug}`} className="popular-item">
            {post.coverImage && (
              <img src={cloudinaryResize(post.coverImage, 150)} alt={post.title} loading="lazy" />
            )}
            {post.category && <span>{blogCategoryLabel(post.category)}</span>}
            <strong>{post.title}</strong>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ContentBody({ html }) {
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: html || '' }} />
}

function DisclaimerBox({ navigate }) {
  return (
    <div className="disclaimer-box">
      <p>Bu məqalə yalnız məlumat xarakteri daşıyır və həkim konsultasiyasını əvəz etmir.</p>
      <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
    </div>
  )
}

function DetailSidebar({ post, headings, navigate }) {
  const reviewerName = getReviewerName(post.reviewedBy)

  return (
    <aside className="detail-sidebar" aria-label="Məqalə yan paneli">
      <TableOfContents headings={headings} />

      <section className="detail-widget appointment-widget">
        <h2>Həkimlə məsləhətləşmək istəyirsiniz?</h2>
        <p>Randevu yaradın və mütəxəssislərimizdən dəstək alın.</p>
        <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
      </section>

      <section className="detail-widget">
        <h2>Məqalə haqqında</h2>
        <dl>
          <div><dt>Mövzu</dt><dd>{blogCategoryLabel(post.category)}</dd></div>
          <div><dt>Müəllif</dt><dd>{getAuthorName(post.author)}</dd></div>
          <div><dt>Oxuma vaxtı</dt><dd>{post.readTime} dəq</dd></div>
          <div><dt>Yenilənib</dt><dd>{formatDate(post.publishedAt || post.createdAt)}</dd></div>
          {reviewerName && (
            <div>
              <dt>Tibbi yoxlama</dt>
              <dd><Link to="/doctors">Dr. {reviewerName}</Link></dd>
            </div>
          )}
        </dl>
      </section>

      <section className="detail-widget trust-widget">
        <h2>Etibarlı tibbi məlumat</h2>
        <ul>
          <li>Həkim nəzarətində hazırlanmış məzmun</li>
          <li>Maarifləndirici və praktik tövsiyələr</li>
          <li>Pasiyentlər üçün aydın izahlar</li>
        </ul>
      </section>

      <PopularPosts excludeSlug={post.slug} />
    </aside>
  )
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/blog/' + slug)
      .then(r => setPost(r.data?.data || r.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  const { html: contentHtml, headings } = useMemo(() => withHeadingAnchors(post?.content), [post?.content])
  const reviewerName = getReviewerName(post?.reviewedBy)
  const canonicalUrl = post ? `${window.location.origin}/blog/${post.slug}` : undefined

  const jsonLd = useMemo(() => {
    if (!post) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      headline: post.title,
      ...(post.coverImage ? { image: [post.coverImage] } : {}),
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || post.publishedAt || post.createdAt,
      author: { '@type': 'Organization', name: getAuthorName(post.author) },
      publisher: { '@type': 'Organization', name: 'Aslan Medical Center' },
      ...(reviewerName ? { reviewedBy: { '@type': 'Person', name: `Dr. ${reviewerName}` } } : {}),
    }
  }, [post, reviewerName])

  useSeoMeta({
    title: post?.title || 'Bloq məqaləsi',
    description: post?.excerpt || 'Aslan Medical tibbi blog məqaləsi.',
    canonical: canonicalUrl,
    image: post?.coverImage,
    type: 'article',
    jsonLd,
  })

  if (loading) {
    return (
      <main className="blog-detail-page" style={{ fontFamily: FONT }}>
        <div className="detail-container" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <div className="spinner" />
        </div>
        <style>{baseStyles}</style>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="blog-detail-page" style={{ fontFamily: FONT }}>
        <div className="detail-container not-found">
          <h1>Məqalə tapılmadı</h1>
          <p>Axtardığınız blog yazısı mövcud deyil və ya ünvan dəyişdirilib.</p>
          <button type="button" onClick={() => navigate('/blog')}>Bloqa qayıt</button>
        </div>
        <style>{baseStyles}</style>
      </main>
    )
  }

  return (
    <main className="blog-detail-page" style={{ fontFamily: FONT }}>
      <div className="detail-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Ana Səhifə</Link>
          <span>/</span>
          <Link to="/blog">Bloq</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link to={`/blog?kateqoriya=${post.category}`}>{blogCategoryLabel(post.category)}</Link>
            </>
          )}
          <span>/</span>
          <strong>{post.title}</strong>
        </nav>

        <div className="article-layout">
          <article className="article-card">
            <header className="article-header">
              <div className="article-meta-row">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                {post.category && (
                  <>
                    <span className="meta-sep">/</span>
                    <Link to={`/blog?kateqoriya=${post.category}`}>{blogCategoryLabel(post.category)}</Link>
                  </>
                )}
              </div>
              <h1 className="article-title">{post.title}</h1>
              {post.excerpt && <p className="article-subtitle">{post.excerpt}</p>}
              {canonicalUrl && <ShareButtons url={canonicalUrl} title={post.title} />}
            </header>

            {post.coverImage && (
              <div className="article-hero-wrap">
                <img
                  className="article-hero-image"
                  src={cloudinaryResize(post.coverImage, 1600)}
                  srcSet={getHeroImageSrcSet(post.coverImage)}
                  sizes="(max-width: 768px) 100vw, 1100px"
                  alt={post.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={event => { event.currentTarget.style.display = 'none' }}
                />
              </div>
            )}

            <ContentBody html={contentHtml} />

            <DisclaimerBox navigate={navigate} />
          </article>

          <DetailSidebar post={post} headings={headings} navigate={navigate} />
        </div>

        <RelatedPosts category={post.category} excludeSlug={post.slug} />

        <section className="bottom-cta">
          <div>
            <h2>Həkimlə məsləhətləşmək istəyirsiniz?</h2>
            <p>Randevu yaradın və mütəxəssislərimizdən dəstək alın.</p>
          </div>
          <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
        </section>
      </div>

      <style>{baseStyles}</style>
    </main>
  )
}

const baseStyles = `
  .blog-detail-page { min-height: 100vh; background: ${PAGE_BG}; color: ${NAVY}; }
  .detail-container { width: min(1320px, calc(100% - 64px)); margin: 0 auto; padding: 34px 0 76px; box-sizing: border-box; }
  .spinner { width: 40px; height: 40px; border: 3px solid ${BORDER}; border-top-color: ${TEAL}; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .breadcrumb { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; color: ${MUTED}; font-size: 14px; margin-bottom: 24px; }
  .breadcrumb a { color: ${TEAL}; text-decoration: none; font-weight: 800; }
  .breadcrumb a:hover { color: ${TEAL_DARK}; text-decoration: underline; }
  .breadcrumb strong { color: ${MUTED}; font-weight: 700; }
  .article-card, .detail-widget, .bottom-cta { background: #fff; border: 1px solid ${BORDER}; box-shadow: 0 10px 28px rgba(15, 23, 42, .05); }
  .article-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 28px; align-items: start; }
  .article-card { min-width: 0; overflow: hidden; }
  .article-header { padding: 34px 46px 0; }
  .article-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: ${MUTED}; font-size: 13px; font-weight: 700; margin-bottom: 14px; }
  .article-meta-row .meta-sep { color: #CBD5E1; }
  .article-meta-row a { color: ${TEAL}; text-decoration: none; font-weight: 800; }
  .article-meta-row a:hover { color: ${TEAL_DARK}; text-decoration: underline; }
  .article-title { margin: 0 0 12px; color: ${NAVY}; font-family: 'Raleway', ${FONT}; font-size: 30px; line-height: 1.2; font-weight: 800; letter-spacing: -0.01em; }
  .article-subtitle { margin: 0; color: ${MUTED}; font-size: 17px; line-height: 1.6; max-width: 760px; }
  .share-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
  .share-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #F1F5F9; color: ${MUTED}; border: 0; cursor: pointer; transition: all .15s; text-decoration: none; }
  .share-btn:hover { background: ${TEAL}; color: #fff; }
  .share-copied { font-size: 12px; color: ${TEAL}; font-weight: 700; }
  .article-hero-wrap { padding: 22px 46px 0; }
  .article-hero-image { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; object-position: center; border-radius: 12px; background: #E6F7F8; }
  .article-body { padding: 38px 46px 0; }
  .article-body h2, .article-body h3, .article-body p, .article-body ul { margin: 0 0 15px; }
  .article-body h2 { color: ${NAVY}; font-size: 18px; line-height: 1.25; font-weight: 900; scroll-margin-top: 100px; }
  .article-body h3 { color: ${NAVY}; font-size: 16px; line-height: 1.3; font-weight: 800; scroll-margin-top: 100px; }
  .article-body p { color: ${TEXT}; font-size: 15px; line-height: 1.7; }
  .article-body ul { padding-left: 22px; color: ${TEXT}; font-size: 15px; line-height: 1.7; }
  .article-body li { margin-bottom: 6px; }
  .disclaimer-box { margin: 8px 46px 38px; padding: 18px 20px; background: #F8FAFC; border: 1px solid ${BORDER}; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .disclaimer-box p { margin: 0; color: ${MUTED}; font-size: 13px; line-height: 1.6; max-width: 560px; }
  .disclaimer-box button { border: 0; border-radius: 10px; background: ${TEAL}; color: #fff; padding: 10px 18px; font: inherit; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .disclaimer-box button:hover { background: ${TEAL_DARK}; }
  .detail-sidebar { display: grid; gap: 24px; position: sticky; top: 92px; }
  .detail-widget { padding: 24px; }
  .detail-widget h2, .bottom-cta h2 { margin: 0 0 10px; color: ${NAVY}; font-size: 22px; line-height: 1.25; font-weight: 900; }
  .detail-widget p, .bottom-cta p { margin: 0 0 18px; color: ${TEXT}; font-size: 15px; line-height: 1.6; }
  .appointment-widget button, .bottom-cta button, .not-found button { border: 0; border-radius: 10px; background: ${TEAL}; color: #fff; padding: 12px 18px; font: inherit; font-weight: 900; cursor: pointer; }
  .appointment-widget button:hover, .bottom-cta button:hover, .not-found button:hover { background: ${TEAL_DARK}; }
  .appointment-widget button { width: 100%; }
  .detail-widget dl { margin: 0; display: grid; gap: 13px; }
  .detail-widget dt { color: ${MUTED}; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
  .detail-widget dd { margin: 3px 0 0; color: ${NAVY}; font-weight: 800; }
  .trust-widget ul { margin: 14px 0 0; padding-left: 19px; color: ${TEXT}; font-size: 15px; line-height: 1.65; }
  .toc-widget ol { margin: 0; padding-left: 18px; display: grid; gap: 9px; }
  .toc-widget li { color: ${TEXT}; font-size: 14px; line-height: 1.5; }
  .toc-widget a { color: ${TEAL}; text-decoration: none; font-weight: 700; }
  .toc-widget a:hover { color: ${TEAL_DARK}; text-decoration: underline; }
  .related-section { margin: 30px 0 0; }
  .related-section h2 { margin: 0 0 18px; color: ${NAVY}; font-size: 22px; line-height: 1.25; font-weight: 900; font-family: 'Raleway', ${FONT}; }
  .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .popular-list { display: grid; gap: 14px; margin-top: 16px; }
  .popular-item { display: grid; grid-template-columns: 72px 1fr; column-gap: 12px; align-items: center; color: inherit; text-decoration: none; }
  .popular-item img { width: 72px; height: 72px; object-fit: cover; object-position: center; border-radius: 8px; grid-row: span 2; background: #E6F7F8; }
  .popular-item span { color: ${TEAL}; font-size: 12px; font-weight: 900; text-transform: uppercase; }
  .popular-item strong { color: ${NAVY}; font-size: 14px; line-height: 1.35; }
  .popular-item:hover strong { color: ${TEAL}; text-decoration: underline; }
  .blog-detail-page a:focus-visible,
  .blog-detail-page button:focus-visible,
  .blog-detail-page [tabindex]:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 2px; border-radius: 4px; }
  .bottom-cta { margin: 30px 0 44px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 22px; }
  .bottom-cta p { margin-bottom: 0; max-width: 640px; }
  .not-found { max-width: 720px; text-align: center; padding-top: 96px; }
  .not-found h1 { font-size: 42px; margin: 0 0 10px; }
  .not-found p { color: ${MUTED}; margin: 0 0 22px; }
  @media (max-width: 1100px) {
    .article-layout { grid-template-columns: 1fr; }
    .detail-sidebar { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .related-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 760px) {
    .detail-container { width: min(100% - 32px, 1320px); padding-bottom: 58px; }
    .article-header { padding: 24px 24px 0; }
    .article-title { font-size: 24px; }
    .article-hero-wrap { padding: 16px 24px 0; }
    .article-body { padding: 28px 24px 0; }
    .disclaimer-box { margin: 8px 24px 28px; }
    .detail-sidebar { grid-template-columns: 1fr; }
    .related-grid { grid-template-columns: 1fr; }
    .bottom-cta { flex-direction: column; align-items: stretch; padding: 24px; }
    .bottom-cta button { width: 100%; }
  }
  @media (max-width: 520px) {
    .detail-container { width: min(100% - 24px, 1320px); }
    .article-header { padding: 20px 18px 0; }
    .article-hero-wrap { padding: 14px 18px 0; }
    .article-body { padding: 24px 18px 0; }
    .disclaimer-box { margin: 8px 18px 24px; flex-direction: column; align-items: stretch; }
  }
`
