// Returns a resized Cloudinary delivery URL for `width` px; non-Cloudinary URLs pass through unchanged.
export function cloudinaryResize(url, width) {
  if (!url) return url
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto:good,f_auto,dpr_auto/`)
  }
  return url
}
