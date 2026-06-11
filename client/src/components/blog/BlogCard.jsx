import { useNavigate } from 'react-router-dom'
import { blogCategoryLabel } from '../../data/blogCategories'
import { cloudinaryResize } from '../../utils/cloudinaryImage'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'

export default function BlogCard({ post, hoveredId, setHoveredId }) {
  const navigate = useNavigate()
  const imgSrc = post.coverImage ?? post.image ?? null

  const goToPost = () => navigate(`/blog/${post.slug}`)

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={post.title}
      className="blog-card"
      onClick={goToPost}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToPost() } }}
      onMouseEnter={() => setHoveredId?.(post._id)}
      onMouseLeave={() => setHoveredId?.(null)}
      style={{
        background: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: hoveredId === post._id ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        transform: hoveredId === post._id ? 'translateY(-4px)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ height: 220, background: '#E6F7F8', overflow: 'hidden', flexShrink: 0 }}>
        {imgSrc && (
          <img
            src={cloudinaryResize(imgSrc, 600)}
            alt={post.title}
            width={400}
            height={220}
            loading="lazy"
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
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          {post.readTime && (
            <span style={{ fontSize: 12, color: '#64748B', fontFamily: FONT }}>
              {post.readTime} dəq oxu
            </span>
          )}
          <span style={{ fontSize: 12, color: '#64748B', marginLeft: 12 }}>
            {(post.publishedAt || post.createdAt) ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('az-AZ') : ''}
          </span>
        </div>
      </div>
      <style>{`
        .blog-card:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 2px; }
      `}</style>
    </article>
  )
}
