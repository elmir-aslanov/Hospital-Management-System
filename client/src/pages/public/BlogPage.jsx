import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000';
function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return `${BACKEND}${src}`;
  return src;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #e8eef4' }}>
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ height: 200, background: '#e8edf2' }} />
      <div style={{ padding: '20px' }}>
        {[70, 90, 60].map((w, i) => (
          <motion.div key={i} animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
            style={{ height: i === 0 ? 18 : 12, width: `${w}%`, borderRadius: 5, background: '#e8edf2', marginBottom: 10 }} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({ post, index }) {
  const imgSrc = resolveImage(post.image);
  const date   = formatDate(post.publishedAt ?? post.createdAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        background: '#ffffff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #e8eef4', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,132,142,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Thumbnail */}
      <div style={{ height: 200, background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {imgSrc && (
          <img src={imgSrc} alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        )}
        {post.category && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: TEAL, color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '3px 10px', borderRadius: 20, fontFamily: FONT,
          }}>
            {post.category}
          </div>
        )}
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {date && (
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontFamily: FONT }}>{date}</p>
        )}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.35, fontFamily: FONT }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{
            fontSize: 13.5, color: '#4a5568', lineHeight: 1.65, margin: 0, fontFamily: FONT, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}
        {post.author && (
          <p style={{ fontSize: 12, color: TEAL, fontWeight: 600, margin: 0, fontFamily: FONT }}>
            {post.author}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function BlogPage() {
  usePageTitle('Bloq', 'Tibbi məqalələr, sağlamlıq məsləhətləri.')
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [hasMore,     setHasMore]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/blog', { params: { limit: 6 } })
      .then(res => {
        const data = res.data?.data || res.data || {}
        const list = Array.isArray(data) ? data : data.posts || data.blogs || []
        const total = data.total || list.length
        setPosts(list)
        setHasMore(list.length < total || list.length === 6)
        setPage(1)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await api.get('/blog', { params: { limit: 6, page: nextPage } })
      const data = res.data?.data || res.data || {}
      const list = Array.isArray(data) ? data : data.posts || data.blogs || []
      setPosts(prev => [...prev, ...list])
      setPage(nextPage)
      setHasMore(list.length === 6)
    } catch {}
    finally { setLoadingMore(false) }
  }

  return (
    <main style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)', padding: '72px 0 80px', textAlign: 'center', width: '100%' }}>
        <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT }}>
            Aslan Medical Center
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15 }}>
            Tibbi Bloq
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75 }}>
            Sağlamlıq, müalicə və profilaktika üzrə məqalə və yeniliklər.
          </p>
        </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background: '#f8fafc', padding: '64px 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>

          {error && !loading && (
            <p style={{ textAlign: 'center', color: '#ef4444', padding: '60px 0', fontFamily: FONT }}>
              Bloq yazıları yüklənərkən xəta baş verdi.
            </p>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: FONT }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Hazırda bloq yazısı əlavə edilməyib.</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {posts.map((post, i) => <BlogCard key={post._id ?? i} post={post} index={i} />)}
              </div>

              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{
                      padding: '13px 36px', background: loadingMore ? '#94a3b8' : 'white',
                      border: '2px solid #00848e', borderRadius: 12,
                      fontSize: 14, fontWeight: 700, color: loadingMore ? 'white' : '#00848e',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                    onMouseEnter={e => { if (!loadingMore) { e.currentTarget.style.background = '#00848e'; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={e => { if (!loadingMore) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#00848e' } }}
                  >
                    {loadingMore ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Yüklənir...
                      </>
                    ) : 'Daha çox göstər'}
                  </button>
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
