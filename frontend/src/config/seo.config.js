/**
 * ==========================================
 * SEO Configuration - Production Ready
 * ==========================================
 * Central configuration for all SEO-related constants
 * Edit these values to match your business
 */

// Base site information
export const SITE_CONFIG = {
  name: 'JWC - Premium Jewelry & Watches',
  shortName: 'JWC',
  url: import.meta.env.VITE_SITE_URL || 'https://www.yoursite.com',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.yoursite.com',
  
  // Business information
  description: 'Discover premium jewelry and luxury watches. Shop exclusive collections with free shipping, secure checkout, and expert customer service.',
  keywords: 'jewelry, watches, luxury jewelry, engagement rings, necklaces, bracelets, premium watches, gold jewelry, diamond jewelry, online jewelry store',
  
  // Social media
  social: {
    twitter: '@yourhandle',
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourhandle',
    pinterest: 'https://pinterest.com/yourpage',
  },
  
  // Contact & Local SEO
  contact: {
    email: 'support@yoursite.com',
    phone: '+1-234-567-8900',
    whatsapp: '+1234567890',
    address: {
      street: '123 Jewelry Lane',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
  },
  
  // Business hours
  openingHours: 'Mo-Fr 09:00-18:00, Sa 10:00-16:00',
  
  // Images
  logo: '/logo.png',
  defaultImage: '/default-og-image.jpg',
  
  // Organization type for schema
  organizationType: 'JewelryStore',
  
  // Language & Region
  language: 'en',
  locale: 'en_US',
  currency: 'INR',
  priceRange: '₹₹',
};

// Default meta tags (fallback)
export const DEFAULT_SEO = {
  title: `${SITE_CONFIG.name} - Premium Jewelry & Luxury Watches`,
  titleTemplate: '%s | JWC', // %s will be replaced with page title
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  author: SITE_CONFIG.name,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  
  // Open Graph defaults
  og: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`,
    imageWidth: '1200',
    imageHeight: '630',
  },
  
  // Twitter Card defaults
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.social.twitter,
    creator: SITE_CONFIG.social.twitter,
  },
};

// Route-specific SEO configurations
export const ROUTE_SEO = {
  home: {
    title: 'Shop Premium Jewelry & Luxury Watches Online',
    description: 'Explore our exclusive collection of handcrafted jewelry and luxury watches. Free shipping on orders over ₹5000. Shop now!',
    keywords: 'jewelry online, buy watches online, luxury jewelry, engagement rings, wedding bands',
    priority: 1.0,
    changefreq: 'daily',
  },
  
  products: {
    title: 'All Products - Jewelry & Watches Collection',
    description: 'Browse our complete collection of premium jewelry and luxury watches. Find the perfect piece for every occasion.',
    keywords: 'jewelry collection, watch collection, all products, jewelry catalog',
    priority: 0.9,
    changefreq: 'daily',
  },
  
  collection: {
    title: 'Featured Collections - Curated Jewelry Sets',
    description: 'Discover our handpicked collections featuring the finest jewelry and watches. Exclusive designs, limited editions.',
    keywords: 'jewelry collections, watch collections, featured jewelry, exclusive designs',
    priority: 0.9,
    changefreq: 'weekly',
  },
  
  newArrivals: {
    title: 'New Arrivals - Latest Jewelry & Watch Designs',
    description: 'Shop the latest arrivals in jewelry and watches. Fresh designs added weekly. Be the first to own exclusive pieces.',
    keywords: 'new jewelry, new watches, latest designs, fresh arrivals, trending jewelry',
    priority: 0.9,
    changefreq: 'daily',
  },
  
  cart: {
    title: 'Shopping Cart',
    description: 'Review your shopping cart and proceed to secure checkout.',
    robots: 'noindex, nofollow', // Don't index cart pages
  },
  
  checkout: {
    title: 'Secure Checkout',
    description: 'Complete your purchase with our secure checkout process.',
    robots: 'noindex, nofollow', // Don't index checkout pages
  },
  
  login: {
    title: 'Customer Login',
    description: 'Sign in to your account to track orders, save favorites, and enjoy exclusive benefits.',
    robots: 'noindex, follow',
  },
  
  register: {
    title: 'Create Account',
    description: 'Join our community and enjoy exclusive perks, early access to sales, and personalized recommendations.',
    robots: 'noindex, follow',
  },
  
  profile: {
    title: 'My Account',
    description: 'Manage your profile, orders, and preferences.',
    robots: 'noindex, nofollow', // Don't index user profiles
  },
  
  contact: {
    title: 'Contact Us - Customer Support',
    description: 'Get in touch with our customer support team. We\'re here to help with questions, orders, and custom requests.',
    keywords: 'contact us, customer support, jewelry help, watch support',
    priority: 0.6,
    changefreq: 'monthly',
  },
  
  about: {
    title: 'About Us - Our Story & Craftsmanship',
    description: 'Learn about our heritage, craftsmanship, and commitment to quality. Discover why thousands trust us for their precious jewelry.',
    keywords: 'about us, jewelry craftsmanship, our story, jewelry artisans',
    priority: 0.7,
    changefreq: 'monthly',
  },
};

// No-index patterns (regex)
export const NO_INDEX_PATTERNS = [
  /^\/cart/,
  /^\/checkout/,
  /^\/profile/,
  /^\/login/,
  /^\/register/,
  /^\/order\/.*\/success/,
  /^\/auth\//,
];

// Structured data constants
export const SCHEMA_CONSTANTS = {
  // Product availability
  availability: {
    IN_STOCK: 'https://schema.org/InStock',
    OUT_OF_STOCK: 'https://schema.org/OutOfStock',
    PRE_ORDER: 'https://schema.org/PreOrder',
    BACK_ORDER: 'https://schema.org/BackOrder',
  },
  
  // Product condition
  condition: {
    NEW: 'https://schema.org/NewCondition',
    USED: 'https://schema.org/UsedCondition',
    REFURBISHED: 'https://schema.org/RefurbishedCondition',
  },
  
  // Price validUntil (90 days from now)
  getPriceValidUntil: () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString();
  },
};

// Performance thresholds for Core Web Vitals
export const PERFORMANCE_CONFIG = {
  // Largest Contentful Paint (LCP) - should be < 2.5s
  lcpThreshold: 2500,
  
  // First Input Delay (FID) / Interaction to Next Paint (INP) - should be < 200ms
  inpThreshold: 200,
  
  // Cumulative Layout Shift (CLS) - should be < 0.1
  clsThreshold: 0.1,
  
  // Image lazy loading offset
  lazyLoadOffset: '200px',
  
  // Preload critical assets
  preloadAssets: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ],
};

// Sitemap configuration
export const SITEMAP_CONFIG = {
  // Static routes to include
  staticRoutes: [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/products', priority: 0.9, changefreq: 'daily' },
    { path: '/collection', priority: 0.9, changefreq: 'weekly' },
    { path: '/new-arrivals', priority: 0.9, changefreq: 'daily' },
    { path: '/about-us', priority: 0.7, changefreq: 'monthly' },
    { path: '/contact-us', priority: 0.6, changefreq: 'monthly' },
  ],
  
  // Dynamic routes config
  dynamicRoutes: {
    products: {
      pathTemplate: '/product/:slug',
      priority: 0.8,
      changefreq: 'weekly',
    },
    categories: {
      pathTemplate: '/category/:slug',
      priority: 0.8,
      changefreq: 'weekly',
    },
  },
  
  // How often to regenerate sitemap (in milliseconds)
  regenerateInterval: 24 * 60 * 60 * 1000, // 24 hours
};

// Analytics & Tracking
export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  ga4MeasurementId: import.meta.env.VITE_GA4_ID || 'G-XXXXXXXXXX',
  
  // Google Tag Manager (optional)
  gtmId: import.meta.env.VITE_GTM_ID || '',
  
  // Google Search Console
  googleSiteVerification: import.meta.env.VITE_GOOGLE_VERIFICATION || '',
  
  // Facebook Pixel
  fbPixelId: import.meta.env.VITE_FB_PIXEL_ID || '',
  
  // Events to track
  events: {
    pageView: 'page_view',
    productView: 'view_item',
    addToCart: 'add_to_cart',
    removeFromCart: 'remove_from_cart',
    beginCheckout: 'begin_checkout',
    purchase: 'purchase',
    search: 'search',
    selectItem: 'select_item',
    viewItemList: 'view_item_list',
    addToWishlist: 'add_to_wishlist',
  },
};

export default {
  SITE_CONFIG,
  DEFAULT_SEO,
  ROUTE_SEO,
  NO_INDEX_PATTERNS,
  SCHEMA_CONSTANTS,
  PERFORMANCE_CONFIG,
  SITEMAP_CONFIG,
  ANALYTICS_CONFIG,
};
