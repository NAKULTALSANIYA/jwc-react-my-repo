/**
 * ==========================================
 * useSEO Hook - Dynamic SEO Management
 * ==========================================
 * Custom hook for managing page-level SEO
 * Automatically updates meta tags based on data
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SEO, SITE_CONFIG } from '../config/seo.config';
import {
  formatTitle,
  getCanonicalUrl,
  getRobotsContent,
  getOgImageUrl,
  truncateDescription,
} from '../utils/seo.utils';

/**
 * Primary SEO hook
 * @param {Object} config - SEO configuration
 * @param {string} config.title - Page title
 * @param {string} config.description - Meta description
 * @param {string} config.keywords - Meta keywords
 * @param {string} config.image - OG image URL
 * @param {string} config.type - OG type (website, article, product)
 * @param {string} config.robots - Custom robots directive
 * @param {string} config.canonical - Custom canonical URL
 * @param {Object} config.product - Product-specific data for schema
 * @param {Array} config.breadcrumbs - Breadcrumb items
 */
export const useSEO = (config = {}) => {
  const location = useLocation();
  
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image,
    type = 'website',
    robots,
    canonical,
    noIndex = false,
    noFollow = false,
  } = config;
  
  useEffect(() => {
    // Format title
    const formattedTitle = title.includes(SITE_CONFIG.name) 
      ? title 
      : formatTitle(title);
    
    // Update document title
    document.title = formattedTitle;
    
    // Get or create meta tags
    const updateMetaTag = (name, content, type = 'name') => {
      if (!content) return;
      
      let element = document.querySelector(`meta[${type}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(type, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', truncateDescription(description));
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', SITE_CONFIG.name);
    
    // Robots
    const robotsContent = noIndex || noFollow
      ? `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`
      : robots || getRobotsContent(location.pathname);
    updateMetaTag('robots', robotsContent);
    
    // Open Graph
    updateMetaTag('og:title', formattedTitle, 'property');
    updateMetaTag('og:description', truncateDescription(description), 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', canonical || getCanonicalUrl(location.pathname), 'property');
    updateMetaTag('og:site_name', SITE_CONFIG.name, 'property');
    updateMetaTag('og:locale', SITE_CONFIG.locale, 'property');
    
    // OG Image
    const ogImage = getOgImageUrl(image);
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:image:width', '1200', 'property');
    updateMetaTag('og:image:height', '630', 'property');
    updateMetaTag('og:image:alt', formattedTitle, 'property');
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', SITE_CONFIG.social.twitter);
    updateMetaTag('twitter:creator', SITE_CONFIG.social.twitter);
    updateMetaTag('twitter:title', formattedTitle);
    updateMetaTag('twitter:description', truncateDescription(description));
    updateMetaTag('twitter:image', ogImage);
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || getCanonicalUrl(location.pathname));
    
    // Language
    document.documentElement.lang = SITE_CONFIG.language;
    
  }, [title, description, keywords, image, type, robots, canonical, location.pathname, noIndex, noFollow]);
};

/**
 * Hook for product-specific SEO
 */
export const useProductSEO = (product) => {
  if (!product) return;
  
  const {
    name,
    description,
    images,
    price,
    salePrice,
    category,
    brand,
  } = product;
  
  const firstImage = images && images.length > 0 
    ? (typeof images[0] === 'string' ? images[0] : images[0].url)
    : null;
  
  const priceText = salePrice 
    ? `₹${salePrice} (Was ₹${price})`
    : `₹${price}`;
  
  useSEO({
    title: `${name} - ${priceText}`,
    description: `${description ? description.substring(0, 140) : `Shop ${name} at JWC.`} ${category ? `Category: ${category.name}.` : ''} Free shipping. Secure checkout.`,
    keywords: `${name}, ${category?.name || 'jewelry'}, ${brand || 'premium jewelry'}, buy ${name} online`,
    image: firstImage,
    type: 'product',
  });
};

/**
 * Hook for tracking page views (Analytics)
 */
export const usePageView = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
    
    // Facebook Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);
};

export default useSEO;
