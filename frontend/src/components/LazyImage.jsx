import React, { useEffect, useRef, useState } from 'react';

const TRANSPARENT_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const LazyImage = ({ src, alt = '', className = '', style = {}, placeholder = TRANSPARENT_PLACEHOLDER, ...rest }) => {
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading — still use IntersectionObserver to control placeholder swap
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={visible ? src : placeholder}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${loaded || hasError ? 'opacity-100' : 'opacity-70'}`}
      style={style}
      loading="lazy"
      decoding="async"
      onLoad={() => {
        setLoaded(true);
        setHasError(false);
      }}
      onError={() => {
        setLoaded(true);
        setHasError(true);
      }}
      {...rest}
    />
  );
};

export default LazyImage;
