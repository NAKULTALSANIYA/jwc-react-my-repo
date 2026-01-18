/**
 * ==========================================
 * SEO-Enhanced Page Examples
 * ==========================================
 * Copy these patterns to your actual pages
 */

import { SEO, ProductSEO } from '../components/SEO';
import {
  HomePageSchemas,
  ProductSchema,
  BreadcrumbSchema,
  ItemListSchema,
  OfferCatalogSchema,
  OrderSchema,
} from '../components/Schema';
import { useSEO, usePageView } from '../hooks/useSEO';
import { ROUTE_SEO } from '../config/seo.config';
import { generateBreadcrumbs } from '../utils/seo.utils';

/**
 * ==========================================
 * HOME PAGE - Example
 * ==========================================
 */
export const HomePageSEOExample = () => {
  // Option 1: Using useSEO hook
  useSEO({
    title: ROUTE_SEO.home.title,
    description: ROUTE_SEO.home.description,
    keywords: ROUTE_SEO.home.keywords,
  });
  
  // Track page view
  usePageView();
  
  return (
    <div>
      {/* Add all homepage schemas */}
      <HomePageSchemas />
      
      {/* Your homepage content */}
      <h1>Welcome to JWC</h1>
    </div>
  );
};

/**
 * ==========================================
 * HOME PAGE - Alternative using SEO Component
 * ==========================================
 */
export const HomePageSEOAlternative = () => {
  usePageView();
  
  return (
    <div>
      <SEO
        title={ROUTE_SEO.home.title}
        description={ROUTE_SEO.home.description}
        keywords={ROUTE_SEO.home.keywords}
        type="website"
      />
      
      <HomePageSchemas />
      
      {/* Your homepage content */}
      <h1>Welcome to JWC</h1>
    </div>
  );
};

/**
 * ==========================================
 * PRODUCT DETAIL PAGE - Example
 * ==========================================
 */
export const ProductDetailPageExample = () => {
  // Assume you fetch product data with React Query
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });
  
  usePageView();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!product) {
    return <div>Product not found</div>;
  }
  
  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.yoursite.com' },
    { name: 'Products', url: 'https://www.yoursite.com/products' },
    { name: product.category?.name || 'Category', url: `https://www.yoursite.com/category/${product.category?.slug}` },
    { name: product.name, url: `https://www.yoursite.com/product/${product.slug}` },
  ];
  
  return (
    <div>
      {/* Product SEO meta tags */}
      <ProductSEO product={product} />
      
      {/* Schema markup */}
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Product content */}
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>Price: ₹{product.salePrice || product.price}</p>
        {/* ... rest of product UI */}
      </div>
    </div>
  );
};

/**
 * ==========================================
 * PRODUCTS LISTING PAGE - Example
 * ==========================================
 */
export const ProductsListingExample = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  useSEO({
    title: ROUTE_SEO.products.title,
    description: ROUTE_SEO.products.description,
    keywords: ROUTE_SEO.products.keywords,
  });
  
  usePageView();
  
  return (
    <div>
      {/* Product list schema */}
      {products && <ItemListSchema products={products} listName="All Products" />}
      
      <h1>All Products</h1>
      {/* Product grid */}
    </div>
  );
};

/**
 * ==========================================
 * CATEGORY/COLLECTION PAGE - Example
 * ==========================================
 */
export const CategoryPageExample = ({ categorySlug }) => {
  const { data: category } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => fetchCategory(categorySlug),
  });
  
  const { data: products } = useQuery({
    queryKey: ['categoryProducts', categorySlug],
    queryFn: () => fetchCategoryProducts(categorySlug),
  });
  
  usePageView();
  
  if (!category) return null;
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.yoursite.com' },
    { name: 'Collections', url: 'https://www.yoursite.com/collection' },
    { name: category.name, url: `https://www.yoursite.com/collection/${category.slug}` },
  ];
  
  return (
    <div>
      <SEO
        title={`${category.name} Collection - ${products?.length || 0} Products`}
        description={category.description || `Explore our ${category.name} collection`}
        keywords={`${category.name}, ${category.name} jewelry, buy ${category.name}`}
        image={category.image}
      />
      
      <BreadcrumbSchema items={breadcrumbs} />
      {products && <OfferCatalogSchema category={category} products={products} />}
      
      <h1>{category.name}</h1>
      {/* Product grid */}
    </div>
  );
};

/**
 * ==========================================
 * ORDER SUCCESS PAGE - Example
 * ==========================================
 */
export const OrderSuccessPageExample = ({ orderId }) => {
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });
  
  // Don't index order pages
  useSEO({
    title: 'Order Confirmed - Thank You!',
    description: 'Your order has been successfully placed.',
    noIndex: true,
    noFollow: true,
  });
  
  usePageView();
  
  return (
    <div>
      {order && <OrderSchema order={order} />}
      
      <h1>Order Confirmed!</h1>
      <p>Order Number: {order?.orderNumber}</p>
    </div>
  );
};

/**
 * ==========================================
 * CART PAGE - Example
 * ==========================================
 */
export const CartPageExample = () => {
  useSEO({
    title: ROUTE_SEO.cart.title,
    description: ROUTE_SEO.cart.description,
    robots: ROUTE_SEO.cart.robots, // noindex, nofollow
  });
  
  usePageView();
  
  return (
    <div>
      <h1>Shopping Cart</h1>
      {/* Cart items */}
    </div>
  );
};

/**
 * ==========================================
 * ABOUT PAGE - Example
 * ==========================================
 */
export const AboutPageExample = () => {
  useSEO({
    title: ROUTE_SEO.about.title,
    description: ROUTE_SEO.about.description,
    keywords: ROUTE_SEO.about.keywords,
  });
  
  usePageView();
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.yoursite.com' },
    { name: 'About Us', url: 'https://www.yoursite.com/about-us' },
  ];
  
  return (
    <div>
      <BreadcrumbSchema items={breadcrumbs} />
      
      <h1>About Us</h1>
      {/* About content */}
    </div>
  );
};

/**
 * ==========================================
 * CONTACT PAGE - Example
 * ==========================================
 */
export const ContactPageExample = () => {
  useSEO({
    title: ROUTE_SEO.contact.title,
    description: ROUTE_SEO.contact.description,
    keywords: ROUTE_SEO.contact.keywords,
  });
  
  usePageView();
  
  return (
    <div>
      <h1>Contact Us</h1>
      {/* Contact form */}
    </div>
  );
};

/**
 * ==========================================
 * 404 NOT FOUND PAGE - Example
 * ==========================================
 */
export const NotFoundPageExample = () => {
  useSEO({
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
    noIndex: true,
    noFollow: true,
  });
  
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
};

export default {
  HomePageSEOExample,
  ProductDetailPageExample,
  ProductsListingExample,
  CategoryPageExample,
  OrderSuccessPageExample,
  CartPageExample,
  AboutPageExample,
  ContactPageExample,
  NotFoundPageExample,
};
