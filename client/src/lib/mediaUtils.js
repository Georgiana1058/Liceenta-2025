// src/lib/mediaUtils.js

export const getMediaId = (media) => {
    if (typeof media === 'number') return media
    if (Array.isArray(media) && media[0]?.id) return media[0].id
    if (media?.id) return media.id
    return null
  }
  