// Fixed 12-category catalog — must mirror server/config/blogCategories.js
export const BLOG_CATEGORIES = [
  { slug: 'beyin-ve-sinir-sistemi',  label: 'Beyin və Sinir Sistemi' },
  { slug: 'usaq-saglamligi',         label: 'Uşaq Sağlamlığı' },
  { slug: 'idman-ve-fitnes',         label: 'İdman və Fitnes' },
  { slug: 'urek-saglamligi',         label: 'Ürək Sağlamlığı' },
  { slug: 'kisi-saglamligi',         label: 'Kişi Sağlamlığı' },
  { slug: 'psixi-saglamliq',         label: 'Psixi Sağlamlıq' },
  { slug: 'qidalanma',               label: 'Qidalanma' },
  { slug: 'ortopediya',              label: 'Ortopediya' },
  { slug: 'ilkin-tibbi-yardim',      label: 'İlkin Tibbi Yardım' },
  { slug: 'deri-baximi-ve-gozellik', label: 'Dəri Baxımı və Gözəllik' },
  { slug: 'saglam-yasam',            label: 'Sağlam Yaşam' },
  { slug: 'qadin-saglamligi',        label: 'Qadın Sağlamlığı' },
]

export const blogCategoryLabel = (slug) =>
  BLOG_CATEGORIES.find(c => c.slug === slug)?.label || slug
