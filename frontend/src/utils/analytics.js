/**
 * ==========================================
 * Analytics Integration
 * ==========================================
 * Google Analytics 4 + eCommerce tracking
 */

import { useEffect } from 'react';
import { ANALYTICS_CONFIG, SITE_CONFIG } from '../config/seo.config';

/**
 * Initialize Google Analytics 4
 * Add this to your index.html or main App component
 */
export const initializeGA4 = () => {
  if (typeof window === 'undefined') return;
  if (import.meta.env.MODE === 'development') {
    console.log('[GA4] Development mode - tracking disabled');
    return;
  }
  
  const GA_ID = ANALYTICS_CONFIG.ga4MeasurementId;
  
  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_ID, {
    send_page_view: false, // We'll handle this manually
    cookie_flags: 'SameSite=None;Secure',
  });
  
  console.log('[GA4] Initialized');
};

/**
 * Initialize Facebook Pixel
 */
export const initializeFacebookPixel = () => {
  if (typeof window === 'undefined') return;
  if (import.meta.env.MODE === 'development') return;
  if (!ANALYTICS_CONFIG.fbPixelId) return;
  
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  window.fbq('init', ANALYTICS_CONFIG.fbPixelId);
  
  console.log('[Facebook Pixel] Initialized');
};

/**
 * Track page view
 */
export const trackPageView = (path, title) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
  
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track product view
 */
export const trackProductView = (product) => {
  const item = {
    item_id: product._id || product.id,
    item_name: product.name,
    item_category: product.category?.name,
    item_brand: product.brand || SITE_CONFIG.name,
    price: product.salePrice || product.price,
    currency: SITE_CONFIG.currency,
  };
  
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.productView, {
      currency: SITE_CONFIG.currency,
      value: item.price,
      items: [item],
    });
  }
  
  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [item.item_id],
      content_type: 'product',
      content_name: item.item_name,
      value: item.price,
      currency: SITE_CONFIG.currency,
    });
  }
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  const item = {
    item_id: product._id || product.id,
    item_name: product.name,
    item_category: product.category?.name,
    item_brand: product.brand || SITE_CONFIG.name,
    price: product.salePrice || product.price,
    quantity: quantity,
    currency: SITE_CONFIG.currency,
  };
  
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.addToCart, {
      currency: SITE_CONFIG.currency,
      value: item.price * quantity,
      items: [item],
    });
  }
  
  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [item.item_id],
      content_type: 'product',
      content_name: item.item_name,
      value: item.price * quantity,
      currency: SITE_CONFIG.currency,
    });
  }
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  const item = {
    item_id: product._id || product.id,
    item_name: product.name,
    price: product.salePrice || product.price,
    quantity: quantity,
  };
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.removeFromCart, {
      currency: SITE_CONFIG.currency,
      value: item.price * quantity,
      items: [item],
    });
  }
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (cartItems, total) => {
  const items = cartItems.map(item => ({
    item_id: item.product._id || item.product.id,
    item_name: item.product.name,
    item_category: item.product.category?.name,
    price: item.product.salePrice || item.product.price,
    quantity: item.quantity,
  }));
  
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.beginCheckout, {
      currency: SITE_CONFIG.currency,
      value: total,
      items: items,
    });
  }
  
  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(item => item.item_id),
      contents: items,
      value: total,
      currency: SITE_CONFIG.currency,
    });
  }
};

/**
 * Track purchase (conversion)
 */
export const trackPurchase = (order) => {
  const items = order.items.map(item => ({
    item_id: item.product._id || item.product.id,
    item_name: item.product.name,
    item_category: item.product.category?.name,
    price: item.price,
    quantity: item.quantity,
  }));
  
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.purchase, {
      transaction_id: order._id || order.orderNumber,
      value: order.total,
      currency: SITE_CONFIG.currency,
      tax: order.tax || 0,
      shipping: order.shippingCost || 0,
      items: items,
    });
  }
  
  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(item => item.item_id),
      contents: items,
      value: order.total,
      currency: SITE_CONFIG.currency,
    });
  }
};

/**
 * Track search
 */
export const trackSearch = (searchTerm) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.search, {
      search_term: searchTerm,
    });
  }
  
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Search', {
      search_string: searchTerm,
    });
  }
};

/**
 * Track product list view
 */
export const trackProductListView = (products, listName = 'Product List') => {
  const items = products.map((product, index) => ({
    item_id: product._id || product.id,
    item_name: product.name,
    item_category: product.category?.name,
    item_brand: product.brand || SITE_CONFIG.name,
    price: product.salePrice || product.price,
    index: index,
  }));
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.viewItemList, {
      item_list_name: listName,
      items: items,
    });
  }
};

/**
 * Track add to wishlist
 */
export const trackAddToWishlist = (product) => {
  const item = {
    item_id: product._id || product.id,
    item_name: product.name,
    price: product.salePrice || product.price,
    currency: SITE_CONFIG.currency,
  };
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', ANALYTICS_CONFIG.events.addToWishlist, {
      currency: SITE_CONFIG.currency,
      value: item.price,
      items: [item],
    });
  }
  
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToWishlist', {
      content_ids: [item.item_id],
      content_name: item.item_name,
      value: item.price,
      currency: SITE_CONFIG.currency,
    });
  }
};

/**
 * Custom event tracking
 */
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * Hook for initializing analytics
 */
export const useAnalytics = () => {
  useEffect(() => {
    initializeGA4();
    initializeFacebookPixel();
  }, []);
};

export default {
  initializeGA4,
  initializeFacebookPixel,
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackProductListView,
  trackAddToWishlist,
  trackCustomEvent,
  useAnalytics,
};
