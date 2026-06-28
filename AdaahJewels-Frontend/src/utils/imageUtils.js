export const FALLBACK_IMAGE = '/no-image.svg';

export const getSafeImageUrl = (value, fallback = FALLBACK_IMAGE) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/via\.placeholder\.com|placeholder\.com/i.test(trimmed)) {
    return fallback;
  }

  return trimmed;
};

export const handleImageError = (event, fallback = FALLBACK_IMAGE) => {
  if (event?.currentTarget) {
    event.currentTarget.src = fallback;
  }
};
