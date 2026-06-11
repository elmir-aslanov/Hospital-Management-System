import { useEffect } from 'react'

const BASE_TITLE = 'Aslan Medical Center'

function upsertMeta(attr, key, value) {
  if (!value) return null
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  let created = false
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
    created = true
  }
  el.setAttribute('content', value)
  return created ? el : null
}

// Rich per-page SEO: title, description, canonical, Open Graph, Twitter card, JSON-LD.
// Follows the same direct-DOM approach as usePageTitle; elements created here are
// removed on cleanup so they don't leak onto pages that don't set them.
export default function useSeoMeta({ title, description, canonical, image, type = 'article', jsonLd } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE
    upsertMeta('name', 'description', description)

    const created = []

    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
        created.push(canonicalEl)
      }
      canonicalEl.setAttribute('href', canonical)
    }

    const ogTags = [
      upsertMeta('property', 'og:title', title),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:type', type),
      upsertMeta('property', 'og:url', canonical),
      upsertMeta('property', 'og:image', image),
      upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
      upsertMeta('name', 'twitter:title', title),
      upsertMeta('name', 'twitter:description', description),
      upsertMeta('name', 'twitter:image', image),
    ].filter(Boolean)
    created.push(...ogTags)

    if (jsonLd) {
      const jsonLdEl = document.createElement('script')
      jsonLdEl.type = 'application/ld+json'
      jsonLdEl.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(jsonLdEl)
      created.push(jsonLdEl)
    }

    return () => {
      document.title = BASE_TITLE
      created.forEach(el => el.remove())
    }
  }, [title, description, canonical, image, type, jsonLd])
}
