/**
 * ==========================================
 * SEO Component - Helmet-based Meta Manager
 * ==========================================
 * Declarative SEO component using react-helmet-async
 * Alternative to useSEO hook - use whichever you prefer
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_CONFIG, DEFAULT_SEO } from '../config/seo.config';
import {
  formatTitle,
  getCanonicalUrl,
  getRobotsContent,
  getOgImageUrl,
  truncateDescription,
} from '../utils/seo.utils';

export const SEO = ({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image,
  type = 'website',
  robots,
  canonical,
  noIndex = false,
  noFollow = false,
  children, // Additional helmet tags
}) => {
  const location = useLocation();
  
  // Format title
  const formattedTitle = title.includes(SITE_CONFIG.name) 
    ? title 
    : formatTitle(title);
  
  // Get canonical URL
  const canonicalUrl = canonical || getCanonicalUrl(location.pathname);
  
  // Get OG image
  const ogImage = getOgImageUrl(image);
  
  // Robots directive
  const robotsContent = noIndex || noFollow
    ? `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`
    : robots || getRobotsContent(location.pathname);
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={truncateDescription(description)} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_CONFIG.name} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={truncateDescription(description)} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={formattedTitle} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={truncateDescription(description)} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={SITE_CONFIG.social.twitter} />
      <meta name="twitter:creator" content={SITE_CONFIG.social.twitter} />
      
      {/* Language */}
      <html lang={SITE_CONFIG.language} />
      
      {/* Additional custom tags */}
      {children}
    </Helmet>
  );
};

/**
 * Product-specific SEO component
 */
export const ProductSEO = ({ product }) => {
  if (!product) return null;
  
  const {
    name,
    description,
    images,
    price,
    salePrice,
    category,
    brand,
    slug,
  } = product;
  
  const firstImage = images && images.length > 0 
    ? (typeof images[0] === 'string' ? images[0] : images[0].url)
    : null;
  
  const priceText = salePrice 
    ? `₹${salePrice} (Was ₹${price})`
    : `₹${price}`;
  
  const productTitle = `${name} - ${priceText}`;
  const productDesc = description 
    ? truncateDescription(`${description} ${category ? `Category: ${category.name}.` : ''} Free shipping. Secure checkout.`)
    : `Shop ${name} at JWC. ${category ? `Category: ${category.name}.` : ''} Free shipping. Secure checkout.`;
  
  return (
    <SEO
      title={productTitle}
      description={productDesc}
      keywords={`${name}, ${category?.name || 'jewelry'}, ${brand || 'premium jewelry'}, buy ${name} online`}
      image={firstImage}
      type="product"
      canonical={slug ? getCanonicalUrl(`/product/${slug}`) : undefined}
    >
      {/* Product-specific meta tags */}
      <meta property="product:price:amount" content={salePrice || price} />
      <meta property="product:price:currency" content={SITE_CONFIG.currency} />
      {category && <meta property="product:category" content={category.name} />}
      {brand && <meta property="product:brand" content={brand} />}
    </SEO>
  );
};

/**
 * Category/Collection SEO component
 */
export const CategorySEO = ({ category }) => {
  if (!category) return null;
  
  const { name, description, image, slug, productCount } = category;
  
  return (
    <SEO
      title={`${name} Collection - ${productCount || 0} Products`}
      description={description || `Explore our ${name} collection. Discover premium jewelry and watches. Shop now with free shipping.`}
      keywords={`${name}, ${name} jewelry, ${name} collection, buy ${name} online`}
      image={image}
      canonical={slug ? getCanonicalUrl(`/category/${slug}`) : undefined}
    />
  );
};

export default SEO;
