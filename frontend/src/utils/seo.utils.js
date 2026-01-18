/**
 * ==========================================
 * SEO Utility Functions
 * ==========================================
 * Helper functions for SEO operations
 */

import { SITE_CONFIG, NO_INDEX_PATTERNS } from '../config/seo.config';

/**
 * Generate canonical URL
 * Ensures consistent URLs for SEO (removes trailing slashes, query params if needed)
 */
export const getCanonicalUrl = (path = '') => {
  const baseUrl = SITE_CONFIG.url;
  const cleanPath = path.replace(/\/+$/, ''); // Remove trailing slashes
  return `${baseUrl}${cleanPath}`;
};

/**
 * Format title with template
 */
export const formatTitle = (title, template = '%s | JWC') => {
  if (!title) return template.replace('%s | ', '');
  return template.replace('%s', title);
};

/**
 * Truncate description to optimal length
 * Google displays ~155-160 characters
 */
export const truncateDescription = (description, maxLength = 155) => {
  if (!description || description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
};

/**
 * Generate keywords string from array
 */
export const formatKeywords = (keywords) => {
  if (Array.isArray(keywords)) {
    return keywords.join(', ');
  }
  return keywords;
};

/**
 * Determine if route should be indexed
 */
export const shouldIndexRoute = (pathname) => {
  // Check against no-index patterns
  for (const pattern of NO_INDEX_PATTERNS) {
    if (pattern.test(pathname)) {
      return false;
    }
  }
  
  // Check if it's a development environment
  if (import.meta.env.MODE === 'development') {
    return false;
  }
  
  return true;
};

/**
 * Get robots meta content based on route
 */
export const getRobotsContent = (pathname, customRobots = null) => {
  if (customRobots) return customRobots;
  
  const shouldIndex = shouldIndexRoute(pathname);
  return shouldIndex 
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow';
};

/**
 * Generate breadcrumb data from pathname
 */
export const generateBreadcrumbs = (pathname, customItems = []) => {
  const breadcrumbs = [
    { name: 'Home', url: SITE_CONFIG.url },
  ];
  
  // Add custom items if provided
  if (customItems.length > 0) {
    return [...breadcrumbs, ...customItems];
  }
  
  // Auto-generate from pathname
  const parts = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const name = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      name,
      url: `${SITE_CONFIG.url}${currentPath}`,
    });
  });
  
  return breadcrumbs;
};

/**
 * Format price for schema markup
 */
export const formatPriceForSchema = (price) => {
  // Remove currency symbols and commas
  if (typeof price === 'string') {
    return parseFloat(price.replace(/[^0-9.]/g, ''));
  }
  return parseFloat(price);
};

/**
 * Get product availability status for schema
 */
export const getAvailabilityStatus = (stock, threshold = 0) => {
  if (stock > threshold) {
    return 'https://schema.org/InStock';
  }
  return 'https://schema.org/OutOfStock';
};

/**
 * Create slug from text
 */
export const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start
    .replace(/-+$/, '');      // Trim - from end
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

/**
 * Generate Open Graph image URL
 * Falls back to default if not provided
 */
export const getOgImageUrl = (imagePath) => {
  if (!imagePath) {
    return `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`;
  }
  
  // If already full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, prepend site URL
  return `${SITE_CONFIG.url}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Format rating for schema (must be 1-5)
 */
export const formatRating = (rating, maxRating = 5) => {
  const normalized = parseFloat(rating);
  if (isNaN(normalized)) return null;
  return Math.min(Math.max(normalized, 0), maxRating);
};

/**
 * Calculate aggregate rating data
 */
export const calculateAggregateRating = (reviews) => {
  if (!reviews || reviews.length === 0) return null;
  
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const average = total / reviews.length;
  
  return {
    ratingValue: average.toFixed(1),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
};

/**
 * Generate FAQ schema data
 */
export const generateFAQData = (faqs) => {
  return faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));
};

/**
 * Sanitize text for schema markup
 * Removes HTML tags and special characters
 */
export const sanitizeForSchema = (text) => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n/g, ' ')     // Replace newlines with spaces
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim();
};

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format date for schema
 */
export const formatSchemaDate = (date) => {
  if (!date) return getCurrentTimestamp();
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  return new Date(date).toISOString();
};

/**
 * Validate required SEO fields
 */
export const validateSEOData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length < 10) {
    errors.push('Title should be at least 10 characters');
  }
  
  if (!data.description || data.description.length < 50) {
    errors.push('Description should be at least 50 characters');
  }
  
  if (data.title && data.title.length > 60) {
    errors.push('Title should not exceed 60 characters');
  }
  
  if (data.description && data.description.length > 160) {
    errors.push('Description should not exceed 160 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate meta image URL with proper dimensions
 */
export const generateMetaImage = (imagePath, width = 1200, height = 630) => {
  const imageUrl = getOgImageUrl(imagePath);
  
  // If using a CDN with image transformation, add parameters here
  // Example for Cloudinary: return `${imageUrl}?w=${width}&h=${height}&fit=cover`
  
  return imageUrl;
};

/**
 * Extract first image from product or content
 */
export const extractFirstImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  const firstImage = images[0];
  
  // Handle different image object structures
  if (typeof firstImage === 'string') {
    return firstImage;
  }
  
  return firstImage.url || firstImage.src || firstImage.image || null;
};

/**
 * Create product JSON-LD data
 */
export const createProductSchema = (product) => {
  const {
    name,
    description,
    images,
    price,
    salePrice,
    sku,
    brand,
    category,
    stock,
    rating,
    reviews,
  } = product;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanitizeForSchema(name),
    description: sanitizeForSchema(description),
    sku: sku || 'N/A',
    brand: {
      '@type': 'Brand',
      name: brand || SITE_CONFIG.name,
    },
  };
  
  // Add images
  if (images && images.length > 0) {
    schema.image = images.map(img => 
      typeof img === 'string' ? getOgImageUrl(img) : getOgImageUrl(img.url)
    );
  }
  
  // Add offers
  const offerPrice = salePrice || price;
  schema.offers = {
    '@type': 'Offer',
    url: window.location.href,
    priceCurrency: SITE_CONFIG.currency,
    price: formatPriceForSchema(offerPrice),
    availability: getAvailabilityStatus(stock),
    itemCondition: 'https://schema.org/NewCondition',
  };
  
  // Add aggregate rating if available
  if (rating && reviews && reviews.length > 0) {
    const aggregateRating = calculateAggregateRating(reviews);
    if (aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ...aggregateRating,
      };
    }
  }
  
  return schema;
};

export default {
  getCanonicalUrl,
  formatTitle,
  truncateDescription,
  formatKeywords,
  shouldIndexRoute,
  getRobotsContent,
  generateBreadcrumbs,
  formatPriceForSchema,
  getAvailabilityStatus,
  createSlug,
  extractDomain,
  getOgImageUrl,
  formatRating,
  calculateAggregateRating,
  generateFAQData,
  sanitizeForSchema,
  getCurrentTimestamp,
  formatSchemaDate,
  validateSEOData,
  generateMetaImage,
  extractFirstImage,
  createProductSchema,
};
