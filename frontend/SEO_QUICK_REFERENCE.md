# 🎯 SEO Quick Reference - Copy & Paste Ready

## Essential Imports

```jsx
// Meta Tags
import { SEO, ProductSEO, CategorySEO } from '../components/SEO';

// Schema Markup
import {
  HomePageSchemas,
  ProductSchema,
  BreadcrumbSchema,
  ItemListSchema,
  OfferCatalogSchema,
  OrderSchema,
} from '../components/Schema';

// Hooks
import { useSEO, usePageView } from '../hooks/useSEO';

// Analytics
import {
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
} from '../utils/analytics';

// Performance
import { LazyImage, AspectRatioImage } from '../components/PerformanceSEO';

// Config
import { ROUTE_SEO, SITE_CONFIG } from '../config/seo.config';
```

---

## Page Templates

### 1. Home Page

```jsx
import { SEO } from '../components/SEO';
import { HomePageSchemas } from '../components/Schema';
import { usePageView } from '../hooks/useSEO';
import { ROUTE_SEO } from '../config/seo.config';

export const Home = () => {
  usePageView();
  
  return (
    <>
      <SEO
        title={ROUTE_SEO.home.title}
        description={ROUTE_SEO.home.description}
        keywords={ROUTE_SEO.home.keywords}
      />
      <HomePageSchemas />
      
      {/* Your content */}
      <div>
        <h1>Welcome to JWC</h1>
      </div>
    </>
  );
};
```

### 2. Product Detail

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductSEO } from '../components/SEO';
import { ProductSchema, BreadcrumbSchema } from '../components/Schema';
import { usePageView } from '../hooks/useSEO';
import { trackProductView } from '../utils/analytics';

export const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  });
  
  usePageView();
  
  useEffect(() => {
    if (product) trackProductView(product);
  }, [product]);
  
  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Not found</div>;
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.yoursite.com' },
    { name: 'Products', url: 'https://www.yoursite.com/products' },
    { name: product.name, url: window.location.href },
  ];
  
  return (
    <>
      <ProductSEO product={product} />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div>
        <h1>{product.name}</h1>
        <p>₹{product.salePrice || product.price}</p>
      </div>
    </>
  );
};
```

### 3. Product Listing

```jsx
import { useQuery } from '@tanstack/react-query';
import { SEO } from '../components/SEO';
import { ItemListSchema } from '../components/Schema';
import { usePageView } from '../hooks/useSEO';
import { ROUTE_SEO } from '../config/seo.config';

export const Products = () => {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  usePageView();
  
  return (
    <>
      <SEO
        title={ROUTE_SEO.products.title}
        description={ROUTE_SEO.products.description}
        keywords={ROUTE_SEO.products.keywords}
      />
      {products && <ItemListSchema products={products} listName="All Products" />}
      
      <div>
        <h1>All Products</h1>
        {/* Product grid */}
      </div>
    </>
  );
};
```

### 4. Category Page

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CategorySEO } from '../components/SEO';
import { OfferCatalogSchema } from '../components/Schema';
import { usePageView } from '../hooks/useSEO';

export const Category = () => {
  const { slug } = useParams();
  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory(slug),
  });
  const { data: products } = useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: () => fetchCategoryProducts(slug),
  });
  
  usePageView();
  
  if (!category) return null;
  
  return (
    <>
      <CategorySEO category={category} />
      {products && <OfferCatalogSchema category={category} products={products} />}
      
      <div>
        <h1>{category.name}</h1>
      </div>
    </>
  );
};
```

### 5. Cart (No Index)

```jsx
import { SEO } from '../components/SEO';
import { usePageView } from '../hooks/useSEO';

export const Cart = () => {
  usePageView();
  
  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review your cart items"
        noIndex={true}
        noFollow={true}
      />
      
      <div>
        <h1>Shopping Cart</h1>
      </div>
    </>
  );
};
```

### 6. Checkout

```jsx
import { SEO } from '../components/SEO';
import { usePageView } from '../hooks/useSEO';
import { trackBeginCheckout } from '../utils/analytics';

export const Checkout = () => {
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });
  
  usePageView();
  
  useEffect(() => {
    if (cart?.items) {
      trackBeginCheckout(cart.items, cart.total);
    }
  }, [cart]);
  
  return (
    <>
      <SEO
        title="Checkout"
        description="Complete your purchase"
        noIndex={true}
        noFollow={true}
      />
      
      <div>
        <h1>Checkout</h1>
      </div>
    </>
  );
};
```

### 7. Order Success

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '../components/SEO';
import { OrderSchema } from '../components/Schema';
import { usePageView } from '../hooks/useSEO';
import { trackPurchase } from '../utils/analytics';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });
  
  usePageView();
  
  useEffect(() => {
    if (order) trackPurchase(order);
  }, [order]);
  
  return (
    <>
      <SEO
        title="Order Confirmed!"
        description="Your order has been placed successfully"
        noIndex={true}
        noFollow={true}
      />
      {order && <OrderSchema order={order} />}
      
      <div>
        <h1>Thank You!</h1>
        <p>Order #{order?.orderNumber}</p>
      </div>
    </>
  );
};
```

---

## Analytics Events

### Track Product View

```jsx
import { trackProductView } from '../utils/analytics';

useEffect(() => {
  if (product) {
    trackProductView(product);
  }
}, [product]);
```

### Track Add to Cart

```jsx
import { trackAddToCart } from '../utils/analytics';

const handleAddToCart = (product, quantity) => {
  // Your add to cart logic
  addToCartMutation.mutate({ product, quantity });
  
  // Track event
  trackAddToCart(product, quantity);
};
```

### Track Purchase

```jsx
import { trackPurchase } from '../utils/analytics';

useEffect(() => {
  if (order && !order.tracked) {
    trackPurchase(order);
  }
}, [order]);
```

### Track Search

```jsx
import { trackSearch } from '../utils/analytics';

const handleSearch = (term) => {
  performSearch(term);
  trackSearch(term);
};
```

---

## Performance Components

### Lazy Load Image

```jsx
import { LazyImage } from '../components/PerformanceSEO';

<LazyImage
  src="/product.jpg"
  alt="Product name"
  width={400}
  height={400}
  className="rounded-lg"
/>
```

### Above-the-Fold Image (Priority)

```jsx
<LazyImage
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority={true} // Loads immediately
/>
```

### Aspect Ratio Image (Prevents CLS)

```jsx
import { AspectRatioImage } from '../components/PerformanceSEO';

<AspectRatioImage
  src="/product.jpg"
  alt="Product"
  aspectRatio="1/1" // Square
  className="w-full"
/>
```

### Product Card (Optimized)

```jsx
import { OptimizedProductCard } from '../components/PerformanceSEO';

<div className="grid grid-cols-4 gap-4">
  {products.map(product => (
    <OptimizedProductCard key={product._id} product={product} />
  ))}
</div>
```

---

## Schema Examples

### Product Schema

```jsx
<ProductSchema
  product={{
    name: 'Diamond Ring',
    description: 'Beautiful diamond ring',
    images: ['/ring.jpg'],
    price: 50000,
    salePrice: 45000,
    sku: 'RING-001',
    brand: 'JWC',
    category: { name: 'Rings' },
    stock: 10,
    rating: 4.5,
    reviews: [
      { rating: 5, comment: 'Great!', author: 'John' },
    ],
  }}
/>
```

### Breadcrumb Schema

```jsx
<BreadcrumbSchema
  items={[
    { name: 'Home', url: 'https://www.yoursite.com' },
    { name: 'Products', url: 'https://www.yoursite.com/products' },
    { name: 'Diamond Ring', url: 'https://www.yoursite.com/product/diamond-ring' },
  ]}
/>
```

---

## Common SEO Patterns

### Pattern 1: Data Loading with SEO

```jsx
const { data, isLoading, isError } = useQuery(...);

if (isLoading) {
  return (
    <>
      <SEO title="Loading..." robots="noindex" />
      <Skeleton />
    </>
  );
}

if (isError) {
  return (
    <>
      <SEO title="Error" robots="noindex" />
      <ErrorPage />
    </>
  );
}

return (
  <>
    <SEO title={data.title} description={data.description} />
    <Content data={data} />
  </>
);
```

### Pattern 2: Conditional SEO

```jsx
const isIndexable = !pathname.includes('/cart') && !pathname.includes('/profile');

<SEO
  title={title}
  description={description}
  noIndex={!isIndexable}
/>
```

### Pattern 3: Dynamic Breadcrumbs

```jsx
const generateBreadcrumbs = (product) => [
  { name: 'Home', url: SITE_CONFIG.url },
  { name: product.category.name, url: `${SITE_CONFIG.url}/category/${product.category.slug}` },
  { name: product.name, url: window.location.href },
];

<BreadcrumbSchema items={generateBreadcrumbs(product)} />
```

---

## Environment Setup

### .env File

```env
# Site
VITE_SITE_URL=https://www.yoursite.com
VITE_API_URL=https://api.yoursite.com

# Analytics
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GOOGLE_VERIFICATION=abc123xyz

# Features
VITE_ALLOW_INDEXING=true
```

### Initialize Analytics in main.jsx

```jsx
import { initializeGA4 } from './utils/analytics';

if (import.meta.env.PROD) {
  initializeGA4();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Testing Checklist

### Local Testing

```bash
# 1. Check meta tags
View page source (Ctrl+U) → Look for <title>, <meta>, <script type="application/ld+json">

# 2. Lighthouse audit
Chrome DevTools → Lighthouse → SEO

# 3. Test performance
Chrome DevTools → Lighthouse → Performance
```

### Production Testing

```bash
# 1. Rich Results Test
https://search.google.com/test/rich-results

# 2. Mobile-Friendly Test
https://search.google.com/test/mobile-friendly

# 3. PageSpeed Insights
https://pagespeed.web.dev/
```

---

## Common Commands

### Generate Sitemap

```bash
cd backend
node scripts/generateSitemap.js
```

### Check Robots.txt

```bash
curl https://www.yoursite.com/robots.txt
```

### Verify Sitemap

```bash
curl https://www.yoursite.com/sitemap.xml
```

---

## Troubleshooting

### Meta Tags Not Updating?

```jsx
// Ensure HelmetProvider wraps entire app
<HelmetProvider>
  <App />
</HelmetProvider>
```

### Analytics Not Tracking?

```js
// Check console in production mode
console.log(typeof window.gtag); // Should be 'function'
```

### Images Not Loading?

```jsx
// Use absolute URLs for OG images
image={`${SITE_CONFIG.url}/product-image.jpg`}
```

### Sitemap 404?

```bash
# Check file exists
ls -la frontend/public/sitemap.xml

# Or add backend route
app.get('/sitemap.xml', sitemapController);
```

---

## Quick Wins

### ✅ Top 5 SEO Improvements

1. **Add Product Schema** → Rich snippets in Google
2. **Optimize Images** → Lazy load + proper dimensions
3. **Set Canonical URLs** → Prevent duplicates
4. **NoIndex User Pages** → Focus crawl budget
5. **Track Core Web Vitals** → Improve rankings

### ✅ Top 5 Performance Improvements

1. **Lazy load images** → Use `<LazyImage>`
2. **Set image dimensions** → Prevent CLS
3. **Preload critical assets** → Fonts, hero images
4. **Code split routes** → Already done with React Router
5. **Cache API responses** → React Query settings

---

## Support

**Documentation:**
- [Full Implementation Guide](./SEO_IMPLEMENTATION_GUIDE.md)
- [Architecture Overview](./SEO_ARCHITECTURE.md)

**Examples:**
- See `src/examples/SEOPageExamples.jsx` for more patterns

**Need Help?**
- Check schema: https://validator.schema.org/
- Test SEO: https://search.google.com/test/rich-results
- Monitor: https://search.google.com/search-console

---

## 🎉 Ready to Rank!

Copy these patterns to your pages and start optimizing! 🚀
