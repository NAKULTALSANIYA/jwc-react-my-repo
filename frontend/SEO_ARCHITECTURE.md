# 📊 SEO Architecture & Strategy

## Overview

This document explains the **technical SEO architecture** for a Vite + React CSR (Client-Side Rendering) eCommerce application.

---

## Why Client-Side SEO Works (2026)

### Modern Googlebot Capabilities

1. **JavaScript Execution**: Googlebot fully renders JavaScript since 2019
2. **React Support**: React apps are crawled and indexed effectively
3. **Dynamic Content**: Meta tags updated via JavaScript ARE indexed
4. **Mobile-First**: CSR apps often perform better on mobile

### When CSR SEO is Sufficient

✅ **Product Pages**: Products with stable URLs and predictable structure  
✅ **eCommerce**: Fast updates, inventory changes  
✅ **User-Generated Content**: Reviews, comments  
✅ **Real-Time Data**: Prices, availability  

### When to Consider SSR/SSG

❌ **News/Blog Sites**: High content volume, frequent updates  
❌ **Enterprise CMS**: Thousands of pages  
❌ **International SEO**: Multiple languages/regions  

For **eCommerce with <10,000 products**, CSR + proper SEO is **completely viable**.

---

## Architecture Principles

### 1. Separation of Concerns

```
📁 SEO System
├── Configuration (seo.config.js)        # Business data
├── Components (SEO.jsx, Schema.jsx)     # Declarative SEO
├── Hooks (useSEO.jsx)                   # Imperative SEO
├── Utils (seo.utils.js)                 # Helper functions
└── Analytics (analytics.js)             # Tracking
```

**Benefits:**
- ✅ Centralized configuration
- ✅ Reusable across pages
- ✅ Easy to update
- ✅ Type-safe (can add TypeScript)

### 2. Dynamic vs Static SEO

#### Static SEO
**Used for:** Pages with fixed content
```jsx
// About page, Contact page
<SEO
  title="About Us"
  description="Learn about our story"
/>
```

#### Dynamic SEO
**Used for:** Data-driven pages
```jsx
// Product pages, Category pages
const { data: product } = useQuery(...);
<ProductSEO product={product} />
```

### 3. Two Approaches: Hooks vs Components

#### Approach 1: useSEO Hook (Imperative)
```jsx
import { useSEO } from '../hooks/useSEO';

const Page = () => {
  useSEO({
    title: 'My Page',
    description: 'Page description',
  });
  
  return <div>Content</div>;
};
```

**Pros:**
- Minimal JSX clutter
- Great for simple pages

**Cons:**
- Less declarative
- Harder to see at a glance

#### Approach 2: SEO Component (Declarative)
```jsx
import { SEO } from '../components/SEO';

const Page = () => {
  return (
    <>
      <SEO
        title="My Page"
        description="Page description"
      />
      <div>Content</div>
    </>
  );
};
```

**Pros:**
- More React-like
- Easy to read
- Explicit

**Cons:**
- Extra JSX

**Recommendation:** Use **Components** for clarity. Hooks for legacy code.

---

## Client-Side Routing SEO

### Challenge: SPA Navigation

**Problem:** React Router navigates WITHOUT full page reload.

**Solution:** Update meta tags on route change:

```jsx
// Every page component
import { usePageView } from '../hooks/useSEO';

const Page = () => {
  usePageView(); // ✅ Tracks route change
  
  useSEO({ ... }); // ✅ Updates meta tags
  
  return <div>Content</div>;
};
```

**How It Works:**
1. User navigates to `/product/123`
2. React Router renders `ProductDetail` component
3. `useSEO` hook updates `document.title` and meta tags
4. Googlebot sees updated meta tags
5. Page indexed with correct SEO data

### Verification

**Test in Chrome DevTools:**
```js
// Navigate to product page
// Then in console:
console.log(document.title);
console.log(document.querySelector('meta[property="og:title"]').content);
```

If these update dynamically, **SEO is working**.

---

## When to Use Dynamic vs Static SEO

### Static SEO (Pre-configured)

```js
// seo.config.js
export const ROUTE_SEO = {
  home: {
    title: 'Shop Premium Jewelry',
    description: '...',
  },
  products: {
    title: 'All Products',
    description: '...',
  },
};
```

**Use for:**
- Homepage
- About page
- Contact page
- Static collection pages

### Dynamic SEO (Data-driven)

```jsx
// Generate from API data
<ProductSEO product={product} />
```

**Use for:**
- Product detail pages
- Category pages
- User profiles
- Search results

---

## Avoiding Common CSR SEO Pitfalls

### 1. ❌ Don't Rely on Loaders

**Bad:**
```jsx
const Page = () => {
  const { data } = useQuery(...);
  
  if (!data) return <div>Loading...</div>; // ❌ No SEO here
  
  return <ProductSEO product={data} />;
};
```

**Why Bad:** First render has no SEO. Googlebot may miss it.

**Good:**
```jsx
const Page = () => {
  const { data } = useQuery(...);
  
  // ✅ Fallback SEO
  if (!data) {
    return (
      <>
        <SEO title="Loading Product..." robots="noindex" />
        <div>Loading...</div>
      </>
    );
  }
  
  return <ProductSEO product={data} />;
};
```

### 2. ❌ Don't Skip Canonical URLs

**Bad:**
```jsx
<SEO title="Product" />
```

**Good:**
```jsx
<SEO
  title="Product"
  canonical={`https://yoursite.com/product/${slug}`}
/>
```

**Why:** Prevents duplicate content issues.

### 3. ❌ Don't Index User Pages

**Bad:**
```jsx
// Cart, Checkout, Profile with default SEO
<SEO title="My Cart" />
```

**Good:**
```jsx
<SEO title="My Cart" noIndex={true} noFollow={true} />
```

**Why:** User-specific pages dilute SEO value.

### 4. ❌ Don't Forget Schema Markup

**Bad:**
```jsx
// Product page without schema
<ProductSEO product={product} />
```

**Good:**
```jsx
<ProductSEO product={product} />
<ProductSchema product={product} />
```

**Why:** Schema = Rich snippets = higher CTR.

---

## SEO-Friendly URL Strategy

### 1. Use Slugs, Not IDs

**Bad:**
```
/product/507f1f77bcf86cd799439011
```

**Good:**
```
/product/diamond-engagement-ring
```

### 2. Consistent Structure

```
/products              → List all products
/product/:slug         → Single product
/category/:slug        → Category page
/collection/:slug      → Featured collection
/new-arrivals          → New products
```

### 3. Handle Query Parameters

For filters:
```
/products?category=rings&sort=price
```

**Set canonical to base URL:**
```jsx
<SEO canonical="https://yoursite.com/products" />
```

### 4. Pagination

```
/products?page=2
```

**Add pagination hints:**
```jsx
<link rel="prev" href="/products?page=1" />
<link rel="next" href="/products?page=3" />
```

---

## No-Index Strategy

### Routes That Should NOT Be Indexed

```js
// seo.config.js
export const NO_INDEX_PATTERNS = [
  /^\/cart/,
  /^\/checkout/,
  /^\/profile/,
  /^\/login/,
  /^\/register/,
  /^\/order\/.*\/success/,
  /^\/auth\//,
];
```

**Why:**
- **Cart/Checkout:** User-specific, no search value
- **Profile:** Private user data
- **Login/Register:** No content value
- **Order Success:** Transaction confirmation, not searchable
- **Auth:** OAuth callbacks, no content

**How It Works:**

```js
export const shouldIndexRoute = (pathname) => {
  for (const pattern of NO_INDEX_PATTERNS) {
    if (pattern.test(pathname)) {
      return false; // Don't index
    }
  }
  return true; // Index
};
```

---

## Performance = SEO

### Core Web Vitals Impact on Rankings

Google uses **Core Web Vitals** as ranking factors:

1. **LCP (Largest Contentful Paint)** < 2.5s
   - First meaningful content
   - **Fix:** Preload hero images, optimize images

2. **INP (Interaction to Next Paint)** < 200ms
   - Replaced FID in 2024
   - **Fix:** Reduce JavaScript, optimize React renders

3. **CLS (Cumulative Layout Shift)** < 0.1
   - Visual stability
   - **Fix:** Set image dimensions, avoid dynamic content

### SEO Performance Checklist

✅ Lazy load below-fold images  
✅ Preload critical assets  
✅ Use CDN for images  
✅ Minimize main bundle size  
✅ Code split by route  
✅ Use React Query caching  
✅ Set proper cache headers  

---

## React Query + SEO

### Why React Query Helps SEO

1. **Faster Page Loads**: Cached data = instant display
2. **Background Updates**: Fresh data without reload
3. **Prefetching**: Load data before user navigates

### SEO-Optimized Query Setup

```jsx
const { data: product, isLoading, isError } = useQuery({
  queryKey: ['product', productId],
  queryFn: () => fetchProduct(productId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Show skeleton while loading (prevents blank page)
if (isLoading) {
  return (
    <>
      <SEO title="Loading..." robots="noindex" />
      <ProductSkeleton />
    </>
  );
}

// Handle errors
if (isError) {
  return (
    <>
      <SEO title="Product Not Found" robots="noindex" />
      <NotFound />
    </>
  );
}

// Full SEO when data loaded
return (
  <>
    <ProductSEO product={product} />
    <ProductSchema product={product} />
    <ProductDetail product={product} />
  </>
);
```

---

## Authentication & SEO

### Public vs Protected Routes

#### Public Routes (INDEX)
```jsx
// Home, Products, Product Detail, About, Contact
<Route path="/products" element={<Products />} />
```

**SEO:** Full indexing, schema markup, OG tags

#### Protected Routes (NO INDEX)
```jsx
// Profile, Orders, Wishlist
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<Profile />} />
</Route>
```

**SEO:** `noindex, nofollow`

### Guest-Only Routes (NO INDEX)
```jsx
// Login, Register
<Route element={<GuestOnlyRoute />}>
  <Route path="/login" element={<Login />} />
</Route>
```

**SEO:** `noindex, follow` (allow discovery, don't index)

### SEO-Safe Redirects

```jsx
// When unauthenticated user accesses protected route
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // ✅ Client-side redirect
  }
  
  return <Outlet />;
};
```

**Why `replace`:** Prevents back button issues.

---

## Environment-Based Indexing

### Development: Don't Index

```js
// seo.utils.js
export const shouldIndexRoute = (pathname) => {
  // Never index in development
  if (import.meta.env.MODE === 'development') {
    return false;
  }
  
  // Check no-index patterns
  for (const pattern of NO_INDEX_PATTERNS) {
    if (pattern.test(pathname)) {
      return false;
    }
  }
  
  return true;
};
```

### Staging: Conditional Index

```env
# .env.staging
VITE_ALLOW_INDEXING=false
```

```js
export const shouldIndexRoute = (pathname) => {
  if (import.meta.env.VITE_ALLOW_INDEXING === 'false') {
    return false;
  }
  // ...
};
```

### Production: Full Index

```env
# .env.production
VITE_ALLOW_INDEXING=true
```

---

## Soft 404 Handling

### What is a Soft 404?

Page returns **200 OK** but shows "Not Found" content.

**Bad for SEO:** Google thinks page exists but has no value.

### Solution: Return Proper Status

In your backend API:
```js
// Product not found
if (!product) {
  return res.status(404).json({ error: 'Product not found' });
}
```

In your frontend:
```jsx
const { data: product, isError } = useQuery(...);

if (isError) {
  // ✅ Tell search engines this is a 404
  return (
    <>
      <SEO
        title="Product Not Found - 404"
        description="This product does not exist."
        robots="noindex, nofollow"
      />
      <NotFound />
    </>
  );
}
```

---

## Summary: CSR SEO Best Practices

### ✅ DO

1. Update meta tags dynamically on route change
2. Use semantic HTML (`<h1>`, `<h2>`, `<article>`)
3. Add schema markup for rich snippets
4. Set proper canonical URLs
5. NoIndex user-specific pages
6. Optimize Core Web Vitals
7. Use meaningful URLs (slugs)
8. Track page views and conversions
9. Generate sitemap regularly
10. Monitor Google Search Console

### ❌ DON'T

1. Render blank pages during loading
2. Skip canonical URLs
3. Index cart/checkout pages
4. Use IDs in URLs
5. Ignore performance metrics
6. Skip schema markup
7. Forget to track analytics
8. Leave meta tags static
9. Ignore mobile optimization
10. Neglect accessibility (also SEO!)

---

## Next Steps

1. **Read** [SEO_IMPLEMENTATION_GUIDE.md](./SEO_IMPLEMENTATION_GUIDE.md)
2. **Customize** `src/config/seo.config.js`
3. **Implement** SEO on each page type
4. **Test** with Lighthouse & Rich Results Test
5. **Monitor** in Google Search Console
6. **Iterate** based on data

---

Your Vite + React CSR app **CAN rank well** with proper SEO implementation! 🚀
