import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageTitle from '../../hooks/usePageTitle'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'

function BlogCard({ post }) {
  const navigate = useNavigate()
  const imgSrc = post.coverImage ?? post.image ?? null

  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{
        background: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(11,29,52,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(29,139,149,0.14)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(11,29,52,0.06)'
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

        {post.readTime && (
          <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: FONT, marginTop: 4 }}>
            {post.readTime} dəq oxu
          </span>
        )}
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

  return (
    <main style={{ background: '#F5F6F8', minHeight: '100vh', fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', boxSizing: 'border-box' }}>
        {loading && <Spinner />}

        {!loading && posts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94A3B8', padding: '80px 0', fontSize: 16 }}>
            Hazırda bloq yazısı yoxdur.
          </p>
        )}

        {!loading && posts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {posts.map((post, i) => (
              <BlogCard key={post._id ?? i} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
