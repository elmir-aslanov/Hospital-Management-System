import { Link, useNavigate, useParams } from 'react-router-dom'
import usePageTitle from '../../hooks/usePageTitle'
import { blogPosts, popularPosts } from '../../data/blogData'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY = '#0B1D34'
const TEAL = '#1D8B95'
const TEAL_DARK = '#0E8F96'
const PAGE_BG = '#F5F6F8'
const BORDER = '#E2E8F0'
const MUTED = '#64748B'
const TEXT = '#334155'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function RelatedCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="related-card">
      <img src={post.image} alt={post.title} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />
      <span>{post.category}</span>
      <strong>{post.title}</strong>
      <p>{post.excerpt}</p>
    </Link>
  )
}

function DetailSidebar({ post, navigate }) {
  return (
    <aside className="detail-sidebar" aria-label="Məqalə yan paneli">
      <section className="detail-widget appointment-widget">
        <h2>Həkimlə məsləhətləşmək istəyirsiniz?</h2>
        <p>Randevu yaradın və mütəxəssislərimizdən dəstək alın.</p>
        <button type="button" onClick={() => navigate('/randevu')}>Randevu al</button>
      </section>

      <section className="detail-widget">
        <h2>Məqalə haqqında</h2>
        <dl>
          <div><dt>Mövzu</dt><dd>{post.category}</dd></div>
          <div><dt>Müəllif</dt><dd>{post.author}</dd></div>
          <div><dt>Oxuma vaxtı</dt><dd>{post.readTime}</dd></div>
          <div><dt>Yenilənib</dt><dd>{formatDate(post.publishedAt)}</dd></div>
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

    </aside>
  )
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = blogPosts.find(item => item.slug === slug)

  usePageTitle(post?.title || 'Bloq məqaləsi', post?.excerpt || 'Aslan Medical tibbi blog məqaləsi.')

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

  const related = blogPosts
    .filter(item => item.slug !== post.slug && item.category === post.category)
    .concat(blogPosts.filter(item => item.slug !== post.slug && item.category !== post.category))
    .slice(0, 3)

  return (
    <main className="blog-detail-page" style={{ fontFamily: FONT }}>
      <div className="detail-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Ana səhifə</Link>
          <span>/</span>
          <Link to="/blog">Tibbi Blog</Link>
          <span>/</span>
          <strong>{post.category}</strong>
        </nav>

        <header className="article-header-card">
          <span className="category-label">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="article-meta">
            <span>{post.author}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div className="article-layout">
          <article className="article-card">
            <img className="article-hero-image" src={post.image} alt={post.title} onError={event => { event.currentTarget.style.display = 'none' }} />

            <div className="article-body">
              {post.body.map((section, index) => (
                <section key={`${section.heading || 'section'}-${index}`}>
                  {section.heading ? <h2>{section.heading}</h2> : null}
                  {section.paragraphs?.map((paragraph, pIndex) => <p key={pIndex}>{paragraph}</p>)}
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet, bIndex) => <li key={bIndex}>{bullet}</li>)}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <DetailSidebar post={post} navigate={navigate} />
        </div>

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
  .detail-container { width: min(1440px, calc(100% - 64px)); margin: 0 auto; padding: 34px 0 76px; box-sizing: border-box; }
  .breadcrumb { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; color: ${MUTED}; font-size: 14px; margin-bottom: 24px; }
  .breadcrumb a { color: ${TEAL}; text-decoration: none; font-weight: 800; }
  .breadcrumb a:hover { color: ${TEAL_DARK}; text-decoration: underline; }
  .article-header-card, .article-card, .detail-widget, .bottom-cta, .related-card { background: #fff; border: 1px solid ${BORDER}; box-shadow: 0 10px 28px rgba(15, 23, 42, .05); }
  .article-header-card { padding: 38px 42px; margin-bottom: 28px; }
  .category-label { display: inline-flex; color: ${TEAL}; background: #E6F7F8; border: 1px solid rgba(29, 139, 149, .18); border-radius: 999px; padding: 7px 13px; font-size: 12px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .04em; }
  .article-header-card h1 { max-width: 980px; margin: 0 0 16px; color: #2E333A; font-family: 'Raleway', ${FONT}; font-size: clamp(36px, 4.7vw, 58px); line-height: 1.1; font-weight: 650; letter-spacing: 0; }
  .article-header-card p { max-width: 900px; margin: 0; color: ${TEXT}; font-size: 19px; line-height: 1.68; }
  .article-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; color: ${MUTED}; font-size: 15px; }
  .article-meta span + span::before { content: '|'; margin-right: 10px; color: #CBD5E1; }
  .article-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 28px; align-items: start; }
  .article-card { min-width: 0; overflow: hidden; }
  .article-hero-image { width: 100%; height: 430px; object-fit: cover; object-position: center; display: block; background: #E6F7F8; }
  .article-body { padding: 38px 46px 48px; }
  .article-body section + section { margin-top: 32px; }
  .article-body h2 { margin: 0 0 12px; color: ${NAVY}; font-size: 27px; line-height: 1.25; font-weight: 900; }
  .article-body p { margin: 0 0 15px; color: ${TEXT}; font-size: 18px; line-height: 1.82; }
  .article-body ul { margin: 14px 0 0; padding-left: 22px; color: ${TEXT}; font-size: 17px; line-height: 1.85; }
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
  .popular-list { display: grid; gap: 14px; margin-top: 16px; }
  .popular-item { display: grid; grid-template-columns: 72px 1fr; column-gap: 12px; align-items: center; color: inherit; text-decoration: none; }
  .popular-item img { width: 72px; height: 72px; object-fit: cover; object-position: center; border-radius: 8px; grid-row: span 2; background: #E6F7F8; }
  .popular-item span { color: ${TEAL}; font-size: 12px; font-weight: 900; text-transform: uppercase; }
  .popular-item strong { color: ${NAVY}; font-size: 14px; line-height: 1.35; }
  .popular-item:hover strong { color: ${TEAL}; text-decoration: underline; }
  .bottom-cta { margin: 30px 0 44px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 22px; }
  .bottom-cta p { margin-bottom: 0; max-width: 640px; }
  .related-head { margin-bottom: 18px; }
  .related-head p { margin: 0 0 6px; color: ${TEAL}; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
  .related-head h2 { margin: 0; color: ${NAVY}; font-family: 'Raleway', ${FONT}; font-size: 30px; line-height: 1.2; letter-spacing: 0; }
  .related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .related-card { color: inherit; text-decoration: none; overflow: hidden; transition: transform .18s, box-shadow .18s; }
  .related-card:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(15, 23, 42, .08); }
  .related-card img { width: 100%; height: 170px; object-fit: cover; object-position: center; display: block; background: #E6F7F8; }
  .related-card span { display: block; margin: 16px 18px 7px; color: ${TEAL}; font-size: 12px; font-weight: 900; text-transform: uppercase; }
  .related-card strong { display: block; margin: 0 18px 8px; color: ${NAVY}; font-size: 18px; line-height: 1.34; }
  .related-card p { margin: 0 18px 20px; color: ${MUTED}; font-size: 14px; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .not-found { max-width: 720px; text-align: center; padding-top: 96px; }
  .not-found h1 { font-size: 42px; margin: 0 0 10px; }
  .not-found p { color: ${MUTED}; margin: 0 0 22px; }
  @media (max-width: 1100px) {
    .article-layout { grid-template-columns: 1fr; }
    .detail-sidebar { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 760px) {
    .detail-container { width: min(100% - 32px, 1440px); padding-bottom: 58px; }
    .article-header-card { padding: 28px 24px; }
    .article-hero-image { height: 280px; }
    .article-body { padding: 28px 24px 34px; }
    .detail-sidebar, .related-grid { grid-template-columns: 1fr; }
    .bottom-cta { flex-direction: column; align-items: stretch; padding: 24px; }
    .bottom-cta button { width: 100%; }
  }
  @media (max-width: 520px) {
    .detail-container { width: min(100% - 24px, 1440px); }
    .article-meta span + span::before { content: ''; margin-right: 0; }
    .article-hero-image { height: 230px; }
    .article-body { padding: 24px 18px 30px; }
  }
`
