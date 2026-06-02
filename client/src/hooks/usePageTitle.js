import { useEffect } from 'react'

const BASE_TITLE = 'Aslan Medical Center'

export default function usePageTitle(title, description = '') {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE

    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    if (description) metaDesc.content = description

    return () => {
      document.title = BASE_TITLE
    }
  }, [title, description])
}
