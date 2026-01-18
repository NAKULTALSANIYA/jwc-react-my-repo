/**
 * ==========================================
 * Performance Optimization Components
 * ==========================================
 * Core Web Vitals optimization for SEO
 */

import { useEffect, useRef, useState } from 'react';

/**
 * ==========================================
 * Lazy Image Component
 * Optimizes LCP (Largest Contentful Paint)
 * ==========================================
 */
export const LazyImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false, // Set true for above-the-fold images
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };
  
  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      data-src={!isInView ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      {...props}
    />
  );
};

/**
 * ==========================================
 * Preload Critical Resources
 * Use in head for critical assets
 * ==========================================
 */
export const PreloadResources = () => {
  return (
    <>
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/fonts/your-font.woff2"
        crossOrigin="anonymous"
      />
      
      {/* DNS Prefetch for API */}
      <link rel="dns-prefetch" href={import.meta.env.VITE_API_URL} />
      
      {/* Preload hero image (adjust path) */}
      <link
        rel="preload"
        as="image"
        href="/hero-image.jpg"
        type="image/jpeg"
      />
    </>
  );
};

/**
 * ==========================================
 * Progressive Image Loader
 * Shows low-quality placeholder, then full image
 * Improves perceived performance
 * ==========================================
 */
export const ProgressiveImage = ({
  src,
  placeholder,
  alt,
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder || src);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!placeholder) {
      setIsLoading(false);
      return;
    }
    
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
  }, [src, placeholder]);
  
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      {...props}
    />
  );
};

/**
 * ==========================================
 * Core Web Vitals Reporter
 * Track and send metrics to analytics
 * ==========================================
 */
export const useWebVitals = () => {
  useEffect(() => {
    // Import web-vitals dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Report to Google Analytics
      const sendToAnalytics = ({ name, delta, value, id }) => {
        if (typeof window.gtag === 'function') {
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            non_interaction: true,
          });
        }
        
        // Log in development
        if (import.meta.env.MODE === 'development') {
          console.log(`[Web Vitals] ${name}:`, value);
        }
      };
      
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }, []);
};

/**
 * ==========================================
 * Prevent Layout Shift
 * Image wrapper with aspect ratio
 * ==========================================
 */
export const AspectRatioImage = ({
  src,
  alt,
  aspectRatio = '16/9', // e.g., '16/9', '4/3', '1/1'
  className = '',
  objectFit = 'cover',
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <LazyImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit }}
        {...props}
      />
    </div>
  );
};

/**
 * ==========================================
 * Defer Non-Critical Scripts
 * Load third-party scripts after page load
 * ==========================================
 */
export const useDeferredScript = (src, options = {}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async !== false;
    script.defer = options.defer !== false;
    
    if (options.onLoad) {
      script.onload = options.onLoad;
    }
    
    // Load after page is fully loaded
    if (document.readyState === 'complete') {
      document.body.appendChild(script);
    } else {
      window.addEventListener('load', () => {
        document.body.appendChild(script);
      });
    }
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [src, options.async, options.defer]);
};

/**
 * ==========================================
 * Product Card with Performance Optimization
 * Example of optimized component
 * ==========================================
 */
export const OptimizedProductCard = ({ product }) => {
  const { name, image, price, salePrice, slug } = product;
  
  return (
    <a href={`/product/${slug}`} className="block group">
      {/* Image with aspect ratio to prevent CLS */}
      <AspectRatioImage
        src={image}
        alt={name}
        aspectRatio="1/1"
        className="mb-3 rounded-lg"
        width={300}
        height={300}
      />
      
      {/* Product info */}
      <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
      
      <div className="flex items-center gap-2 mt-1">
        {salePrice ? (
          <>
            <span className="font-bold text-red-600">₹{salePrice}</span>
            <span className="text-sm text-gray-500 line-through">₹{price}</span>
          </>
        ) : (
          <span className="font-bold">₹{price}</span>
        )}
      </div>
    </a>
  );
};

/**
 * ==========================================
 * Skeleton Loader for SEO
 * Show content structure while loading
 * ==========================================
 */
export const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-5 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

export default {
  LazyImage,
  PreloadResources,
  ProgressiveImage,
  useWebVitals,
  AspectRatioImage,
  useDeferredScript,
  OptimizedProductCard,
  ProductCardSkeleton,
};
